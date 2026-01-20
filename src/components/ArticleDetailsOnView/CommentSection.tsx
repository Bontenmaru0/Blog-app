import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchCommentsThunk, createCommentThunk } from '../../features/comments/commentsSlice'
import CommentItem from './CommentItem'


interface Props {
  articleId: string
  imageId?: string | null
}

export default function CommentSection({ articleId, imageId = null }: Props) {
  const dispatch = useAppDispatch()
  const { comments, contentLoading, insertCommentLoading, insertCommentError } = useAppSelector((state) => state.comments)
  const { user } = useAppSelector((state) => state.auth)

  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch comments whenever articleId or imageId changes
  useEffect(() => {
    if (!articleId || !imageId) return
    dispatch(fetchCommentsThunk({ articleId, imageId }))
  }, [articleId, imageId, dispatch])

  // Clear the textarea when switching images
  useEffect(() => {
    setText('')
  }, [imageId])

  const handleInput = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }

  const handlePost = async () => {
    if (!imageId) return
    const payload = {
      articleId,
      imageId,
      parentId: null,
      content: text,
    }
    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      dispatch(fetchCommentsThunk({ articleId, imageId })) // refresh after posting
      setText('')
      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err) {
      window.showToast('Error', insertCommentError || 'Failed to send comment', 'error')
    }
  }

  return (
    <div className="d-flex flex-column">
      <h6 className="mb-1">Comments</h6>

      {/* textarea + Post button */}
      <div className="position-relative mb-3">
        <textarea
          ref={textareaRef}
          className="form-control rounded-0"
          rows={1}
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleInput}
          onKeyDown={(e) =>
            e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePost())
          }
          style={{
            paddingRight: '4rem',
            paddingBottom: '2.5rem',
            overflow: 'hidden',
            resize: 'none',
            minHeight: '50px',
            maxHeight: '200px',
          }}
        />
        <button
          className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-1 rounded-0"
          style={{ zIndex: 10 }}
          onClick={handlePost}
          disabled={insertCommentLoading}
        >
          <i className="bi bi-send"></i> {insertCommentLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {contentLoading && <p className="text-muted small">Loading comments…</p>}

      {comments?.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          currentUserId={user?.id}
        />
      ))}
    </div>
  )
}
