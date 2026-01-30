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

export default function ImageViewerModal({ images, startIndex, article, onClose }: Props) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { insertCommentLoading, insertCommentError } = useAppSelector((state) => state.comments)

  const [activeIndex, setActiveIndex] = useState(startIndex)
  const activeImage = images[activeIndex] ?? null
  const [isComment, setIsComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null)

  const [showFullTitle, setShowFullTitle] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const TITLE_LIMIT = 50
  const CONTENT_LIMIT = 50

  const commentSectionRef = useRef<ImageCommentSectionRef>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setActiveIndex(startIndex), [startIndex])

  useEffect(() => {
    if (!activeImage?.id) return
    dispatch(fetchImagesCommentsThunk({ articleId: article.id, imageId: activeImage.id }))
  }, [activeImage?.id, article.id, dispatch])

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

  const handlePrev = () => setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1))
  const handleNext = () => setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1))

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

  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCommentImage(file)
    setCommentImagePreview(URL.createObjectURL(file))
  }

  const submitComment = async () => {
    if (!user || !activeImage?.id) return
    const payload = { articleId: article.id, content: commentText, imageId: activeImage.id, parentId: null, comment_image: commentImage }
    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      await dispatch(fetchImagesCommentsThunk({ articleId: article.id, imageId: activeImage.id })).unwrap()
      commentSectionRef.current?.scrollToTop(true)

      setCommentText('')
      setCommentImage(null)
      setCommentImagePreview(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (textareaRef.current) textareaRef.current.style.height = '70px'
      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err) {
      window.showToast('Error', insertCommentError || 'Failed to send comment', 'error')
    }
  }

  const truncatedTitle = article.title.length > TITLE_LIMIT ? article.title.slice(0, TITLE_LIMIT) + '...' : article.title
  const truncatedContent = article.content.length > CONTENT_LIMIT ? article.content.slice(0, CONTENT_LIMIT) + '...' : article.content

  return (
    <div className="modal fade show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '96vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-content rounded-0" style={{ height: '90vh' }}>
          <div className="modal-body p-0 h-100">
            <div className="row g-0 h-100">

              {/* LEFT: IMAGE CAROUSEL */}
              <div className={`col-md-9 bg-dark position-relative ${isComment ? 'd-none' : ''}`}>
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.6rem', fontSize: '0.85rem', zIndex: 10 }}>
                  Modern Samurai x {article.full_name ?? article.author}
                </div>

                {!isComment && (
                  <div className="position-absolute start-50 bottom-0 translate-middle-x text-center w-100 d-md-none"
                    onClick={() => setIsComment(true)}
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.6rem', fontSize: '0.85rem', zIndex: 10, cursor: 'pointer' }}>
                    See comments
                  </div>
                )}

                {activeImage ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={activeImage.image_url} alt={activeImage.alt_text ?? ''} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <p className="text-white">No images available</p>
                )}

                {images.length > 1 && (
                  <>
                    <button className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-0" onClick={handlePrev}>‹</button>
                    <button className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-0" onClick={handleNext}>›</button>
                  </>
                )}
              </div>

              {/* RIGHT: ARTICLE + COMMENTS */}
              <div className={`col-md-3 d-flex flex-column p-3 ${isComment ? '' : 'd-none d-md-flex'}`} style={{ height: '100%' }}>

                {/* Mobile toggle */}
                {isComment && (
                  <div className="position-absolute top-0 start-50 translate-middle-x text-center w-100 d-md-none"
                    onClick={() => setIsComment(false)}
                    style={{ backgroundColor: 'rgba(0,0,0,0.95)', color: 'white', padding: '0.3rem 0.6rem', fontSize: '0.85rem', zIndex: 10, cursor: 'pointer' }}>
                    Tap to hide comments
                  </div>
                )}

                {/* Title with truncation */}
                <h5 className="mt-3 mt-md-0 mb-1">
                  {showFullTitle ? article.title : truncatedTitle}
                  {article.title.length > TITLE_LIMIT && (
                    <button
                      className="btn btn-link btn-sm p-0 ms-1 text-secondary"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => setShowFullTitle(!showFullTitle)}
                    >
                      {showFullTitle ? 'Show less' : 'See full'}
                    </button>
                  )}
                </h5>

                {/* Content with truncation */}
                <p>
                  {showFullContent ? article.content : truncatedContent}
                  {article.content.length > CONTENT_LIMIT && (
                    <button
                      className="btn btn-link btn-sm p-0 ms-1 text-secondary"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => setShowFullContent(!showFullContent)}
                    >
                      {showFullContent ? 'Show less' : 'See full'}
                    </button>
                  )}
                </p>

                {/* Scrollable content + comments */}
                <div className="flex-grow-1 overflow-auto mb-2">
                  {activeImage?.id && <ImageCommentSection ref={commentSectionRef} key={activeImage?.id} articleId={article.id} imageId={activeImage?.id} />}
                </div>

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleCommentImageChange} hidden />
                {commentImagePreview && (
                  <div className="mb-2 position-relative" style={{ display: 'inline-block' }}>
                    <img src={commentImagePreview} alt="Preview" className="img-fluid" style={{ maxHeight: 120, objectFit: 'cover' }} />
                    <button type="button" className="btn btn-sm btn-dark position-absolute top-0 start-0 rounded-0" style={{ padding: '0 6px', lineHeight: '1', fontSize: '0.8rem', zIndex: 10 }}
                      onClick={() => { setCommentImage(null); setCommentImagePreview(null) }}>✕</button>
                  </div>
                )}

                {/* Comment input + image preview */}
                {user ? (
                  <div className="mt-auto position-relative">
                    <textarea
                      ref={textareaRef}
                      className="form-control rounded-0"
                      rows={1}
                      placeholder="Write a comment…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onInput={commentInput}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitComment())}
                      style={{ paddingRight: '4rem', paddingLeft: '2.5rem', paddingBottom: '2.5rem', resize: 'none', minHeight: '50px', maxHeight: '200px' }}
                      required
                    />
                    <button type="button" className="btn btn-light btn-sm position-absolute bottom-0 start-0 m-1 rounded-0"
                      onClick={() => fileInputRef.current?.click()} disabled={insertCommentLoading}>
                      <i className="bi bi-image"></i>
                    </button>

                    <button className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-1 rounded-0"
                      onClick={submitComment} disabled={insertCommentLoading || (!commentText.trim() && !commentImage)}>
                      <i className="bi bi-send"></i> {insertCommentLoading ? ' Sending...' : ' Send'}
                    </button>
                  </div>
                ) : (
                  <p className="text-muted small">You must <strong>log in</strong> to post a comment.</p>
                )}
              </div>
            </div>
          </div>

          <button type="button" className={`btn-close position-absolute top-0 end-0 ${isComment ? 'mt-5 mt-md-3 me-3' : 'm-3'}`} onClick={onClose} />
        </div>
      </div>
    </div>
  )
}
