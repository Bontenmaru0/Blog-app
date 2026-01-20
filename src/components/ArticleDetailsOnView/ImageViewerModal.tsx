import { useState, useEffect } from 'react'
import CommentSection from './CommentSection'
import { useAppDispatch } from '../../app/hooks'
import { fetchCommentsThunk } from '../../features/comments/commentsSlice'

interface Props {
  imageUrl: string
  article: any
  onClose: () => void
}

export default function ImageViewerModal({ imageUrl, article, onClose }: Props) {
  const dispatch = useAppDispatch()
  const images = article?.images ?? []

  // ACTIVE IMAGE INDEX
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? null

  // Rehydrate activeIndex AFTER images load (refresh-safe)
  useEffect(() => {
    if (!images.length) return
    const index = images.findIndex((img: any) => img.image_url === imageUrl)
    setActiveIndex(index >= 0 ? index : 0)
  }, [imageUrl, images])

  // Fetch comments whenever activeImage changes
  useEffect(() => {
    if (!activeImage?.id) return
    dispatch(fetchCommentsThunk({ articleId: article.id, imageId: activeImage.id }))
  }, [activeImage?.id, article.id, dispatch])

  // CAROUSEL NAVIGATION
  const handlePrev = () => setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  const handleNext = () => setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))

  // Keyboard navigation
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
                  {/* AruDonno x {article.full_name ?? article.author} */}{article.full_name ?? article.author}
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
              <div className="col-md-3 d-flex flex-column p-3">
                <h5 className="mb-1">{article.title}</h5>
                <div className="flex-grow-1 overflow-auto">
                  <p>{article.content}</p>
                  {console.log(activeImage)}
                  {activeImage?.id && (
                    <CommentSection
                      key={activeImage?.id} // 🔑 force remount
                      articleId={article.id}
                      imageId={activeImage?.id ?? null}
                    />
                  )}
                </div>
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
