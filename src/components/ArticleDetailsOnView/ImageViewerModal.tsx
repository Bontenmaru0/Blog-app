import { useState, useEffect, useRef } from 'react'
import ImageCommentSection from './ImageCommentSection'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchImagesCommentsThunk, createCommentThunk } from '../../features/comments/commentsSlice'
import type { GridImage } from '../ArticleImageGrid'
import type { ImageCommentSectionRef } from './ImageCommentSection'

interface Props {
  images: GridImage[]
  startIndex: number
  article: any
  onClose: () => void
}

export default function ImageViewerModal({
  images,
  startIndex,
  article,
  onClose,
}: Props) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { insertCommentLoading, insertCommentError } = useAppSelector((state) => state.comments)

  const [activeIndex, setActiveIndex] = useState(startIndex)
  const activeImage = images[activeIndex] ?? null

  useEffect(() => {
    setActiveIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    if (!activeImage?.id) return
    dispatch(fetchImagesCommentsThunk({
      articleId: article.id,
      imageId: activeImage.id,
    }))
  }, [activeImage?.id, article.id, dispatch])

  const handlePrev = () => {
    setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1))
  }

  const handleNext = () => {
    setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1))
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [images.length, onClose])

  const commentSectionRef = useRef<ImageCommentSectionRef>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [commentText, setCommentText] = useState('')

  const commentInput = () => {
    if (!textareaRef.current) return

    const ta = textareaRef.current
    const maxHeight = 200
    const minHeight = 50

    ta.style.height = 'auto'
    const newHeight = Math.min(Math.max(ta.scrollHeight, minHeight), maxHeight)
    ta.style.height = `${newHeight}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  const submitComment = async () => {
    if (!user) return
    if (!commentText.trim()) return
    if (!activeImage?.id) return

    const payload = {
      articleId: article.id,
      imageId: activeImage.id,
      parentId: null,
      content: commentText,
    }

    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      await dispatch(fetchImagesCommentsThunk({ articleId: article.id, imageId: activeImage.id })).unwrap()

      commentSectionRef.current?.scrollToTop(true)

      setCommentText('')
      if (textareaRef.current) textareaRef.current.style.height = '50px'

      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err) {
      window.showToast('Error', insertCommentError || 'Failed to send comment', 'error')
    }
  }

  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '96vw' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content rounded-0" style={{ height: '90vh' }}>
          <div className="modal-body p-0 h-100">
            <div className="row g-0 h-100">

              {/* LEFT: IMAGE CAROUSEL */}
              <div className="col-md-9 bg-dark position-relative">
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                    zIndex: 10,
                  }}
                >
                  Modern Samurai x {article.full_name ?? article.author}
                </div>

                {activeImage ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={activeImage.image_url}
                        alt={activeImage.alt_text ?? ''}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-0"
                          onClick={handlePrev}
                        >
                          ‹
                        </button>
                        <button
                          className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-0"
                          onClick={handleNext}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-white">No images available</p>
                )}
              </div>

              {/* RIGHT: ARTICLE + COMMENTS */}
              <div className="col-md-3 d-flex flex-column p-3" style={{ height: '100%' }}>
                <h5 className="mb-1">{article.title}</h5>
                
                <div className="flex-grow-1 overflow-hidden" style={{ marginBottom: '0.5rem' }}>
                  <p>{article.content}</p>
                  {activeImage?.id && (
                    <ImageCommentSection
                      ref={commentSectionRef}
                      key={activeImage?.id}
                      articleId={article.id}
                      imageId={activeImage?.id}
                    />
                  )}
                </div>

                {user ? (
                  <div className="position-relative">
                    <textarea
                      ref={textareaRef}
                      className="form-control rounded-0"
                      rows={1}
                      placeholder="Write a comment…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onInput={commentInput}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitComment())
                      }
                      style={{
                        paddingRight: '4rem',
                        paddingBottom: '2.5rem',
                        resize: 'none',
                        minHeight: '50px',
                        maxHeight: '200px',
                      }}
                    />
                    <button
                      className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-1 rounded-0"
                      style={{ zIndex: 10 }}
                      onClick={submitComment}
                      disabled={insertCommentLoading || !commentText.trim()}
                    >
                      <i className="bi bi-send"></i> {insertCommentLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                ) : (
                  <p className="text-muted small">
                    You must <strong>log in</strong> to post a comment.
                  </p>
                )}

              </div>

            </div>
          </div>

          <button
            type="button"
            className="btn-close position-absolute top-0 end-0 m-3"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  )
}
