import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchImagesCommentsThunk } from '../../features/comments/commentsSlice'
import ImageCommentItem from './ImageCommentItem'

export interface ImageCommentSectionRef {
  scrollToTop: (smooth?: boolean) => void
}

interface Props {
  articleId: string
  imageId: string
}

const ImageCommentSection = forwardRef<ImageCommentSectionRef, Props>(
  ({ articleId, imageId }, ref) => {
    const dispatch = useAppDispatch()
    const { imageComments, imageContentLoading, imageTotals } =
      useAppSelector((state) => state.comments)
    const { user } = useAppSelector((state) => state.auth)

    const commentsContainerRef = useRef<HTMLDivElement>(null)
    const comments = imageComments[imageId] || []

    useImperativeHandle(ref, () => ({
      scrollToTop: (smooth = false) => {
        if (!commentsContainerRef.current) return
        commentsContainerRef.current.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'auto',
        })
      },
    }))

    useEffect(() => {
      if (!articleId || !imageId) return
      dispatch(fetchImagesCommentsThunk({ articleId, imageId }))
    }, [articleId, imageId, dispatch])

    return (
      <div className="d-flex flex-column h-100">
        <h6 className="mb-1">
          Comments {imageTotals[imageId] !== undefined && `(${imageTotals[imageId]})`}
        </h6>

        <div
          ref={commentsContainerRef}
          className="flex-grow-1 overflow-auto mb-2"
          style={{ paddingRight: '0.5rem' }}
        >
          {imageContentLoading && (
            <p className="text-muted small">Loading comments…</p>
          )}

          {comments.map((comment) => (
            <ImageCommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              articleId={articleId}
              imageId={imageId}
            />
          ))}

          {!imageContentLoading && comments.length === 0 && (
            <p className="text-muted small">No comments yet.</p>
          )}
        </div>
      </div>
    )
  }
)

export default ImageCommentSection
