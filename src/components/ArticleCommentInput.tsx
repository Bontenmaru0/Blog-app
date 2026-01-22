import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createCommentThunk, fetchArticleCommentsThunk } from '../features/comments/commentsSlice'

interface ArticleCommentInputProps {
  articleId: string
}

export default function ArticleCommentInput({ articleId }: ArticleCommentInputProps) {
  const dispatch = useAppDispatch()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [commentText, setCommentText] = useState('')
  const { insertCommentLoading, insertCommentError } = useAppSelector((state) => state.comments)

  // Auto-resize textarea
  const handleInput = () => {
    if (!textareaRef.current) return
    const ta = textareaRef.current
    const maxHeight = 100
    const minHeight = 50

    ta.style.height = 'auto'
    const newHeight = Math.min(Math.max(ta.scrollHeight, minHeight), maxHeight)
    ta.style.height = `${newHeight}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  // Submit comment
  const submitComment = async () => {
    if (!commentText.trim()) return

    const payload = {
      articleId,
      imageId: null,
      parentId: null,
      content: commentText,
    }

    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      await dispatch(fetchArticleCommentsThunk({ articleId })).unwrap()
      setCommentText('')
      if (textareaRef.current) textareaRef.current.style.height = '50px'
      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err) {
      window.showToast('Error', insertCommentError || 'Failed to send comment', 'error')
    }
  }

  return (
    <div className="position-relative">
      <textarea
        ref={textareaRef}
        className="form-control rounded-0"
        rows={1}
        placeholder="Write a comment…"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onInput={handleInput}
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
  )
}
