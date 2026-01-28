import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  fetchArticleCommentsThunk,
  createCommentThunk,
} from '../features/comments/commentsSlice'
import ArticleCommentItem from './ArticleCommentItem'
import type { Comment } from '../features/comments/commentsService'

interface Props {
  articleId: string
}

export default function ArticleCommentSection({ articleId }: Props) {
  const dispatch = useAppDispatch()
  const {
    articleComments,
    articleContentLoading,
    insertCommentLoading,
    insertCommentError,
    articleTotals,
  } = useAppSelector((state) => state.comments)

  const { user } = useAppSelector((state) => state.auth)

  const [text, setText] = useState('')
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get comments for this article safely
  const comments: Comment[] = articleComments[articleId] || []

  // Fetch comments when articleId changes
  useEffect(() => {
    if (!articleId) return
    dispatch(fetchArticleCommentsThunk({ articleId }))
  }, [articleId, dispatch])

  // Auto-resize textarea
  const handleInput = () => {
    if (!textareaRef.current) return
    const ta = textareaRef.current
    const maxHeight = 100
    ta.style.height = 'auto'
    if (ta.scrollHeight <= maxHeight) {
      ta.style.height = `${ta.scrollHeight}px`
      ta.style.overflowY = 'hidden'
    } else {
      ta.style.height = `${maxHeight}px`
      ta.style.overflowY = 'auto'
    }
  }

  // Handle image selection
  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCommentImage(file)
    setCommentImagePreview(URL.createObjectURL(file))
  }

  // Submit comment
  const handlePost = async () => {
    if (!user) return
    if (!text.trim() && !commentImage) return

    const payload = {
      articleId,
      imageId: null, // article comment
      parentId: null,
      content: text,
      // TODO: handle sending commentImage if backend supports it
    }

    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      setText('')
      setCommentImage(null)
      setCommentImagePreview(null)
      dispatch(fetchArticleCommentsThunk({ articleId }))
      if (textareaRef.current) textareaRef.current.style.height = '50px'
      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err: any) {
      window.showToast('Error', insertCommentError || 'Failed to send comment', 'error')
    }
  }

  return (
    <div className="d-flex flex-column">
      <h6 className="mb-1">
        Comments {articleTotals[articleId] !== undefined && `(${articleTotals[articleId]})`}
      </h6>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleCommentImageChange}
        hidden
      />

      {user ? (
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
              paddingLeft: '3rem', // room for upload button
              paddingBottom: '2.5rem',
              overflow: 'hidden',
              resize: 'none',
              minHeight: 50,
              maxHeight: 100,
            }}
          />

          {/* Upload button */}
          <button
            type="button"
            className="btn btn-light btn-sm position-absolute bottom-0 start-0 m-1 rounded-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={insertCommentLoading}
            style={{ zIndex: 10 }}
          >
            <i className="bi bi-image"></i>
          </button>

          {/* Send button */}
          <button
            type="button"
            className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-1 rounded-0"
            onClick={handlePost}
            disabled={insertCommentLoading || (!text.trim() && !commentImage)}
            style={{ zIndex: 10 }}
          >
            <i className="bi bi-send"></i> {insertCommentLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      ) : (
        <p className="text-muted small">
          You must <strong>log in</strong> to post a comment.
        </p>
      )}

      {/* Image preview */}
      {commentImagePreview && (
        <div
          className="mb-2 position-relative"
          style={{
            display: 'inline-block',
            width: 200,
            height: 120,
            overflow: 'hidden',
          }}
        >
          <img
            src={commentImagePreview}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            type="button"
            className="btn btn-sm btn-dark position-absolute top-0 start-0 rounded-0"
            style={{ padding: '0 6px', fontSize: '0.8rem', zIndex: 20 }}
            onClick={() => {
              setCommentImage(null)
              setCommentImagePreview(null)
            }}
          >
            ✕
          </button>
        </div>
      )}

      {articleContentLoading && <p className="text-muted small">Loading comments…</p>}

      {comments.map((comment) => (
        <ArticleCommentItem
          key={comment.id}
          comment={comment}
          articleId={articleId}
          currentUserId={user?.id}
        />
      ))}
    </div>
  )
}
