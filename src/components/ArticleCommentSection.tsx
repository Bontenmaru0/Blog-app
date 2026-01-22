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
  const { articleComments, articleContentLoading, insertCommentLoading, insertCommentError, articleTotals } =
    useAppSelector((state) => state.comments)
    
  const { user } = useAppSelector((state) => state.auth)

  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get the comments for this article safely
  const comments: Comment[] = articleComments[articleId] || []

  // Fetch comments when articleId changes
  useEffect(() => {
    if (!articleId) return
    dispatch(fetchArticleCommentsThunk({ articleId }))
  }, [articleId, dispatch])

  const handleInput = () => {
    if (!textareaRef.current) return;

    const ta = textareaRef.current;
    const maxHeight = 100; // same as your CSS maxHeight

    ta.style.height = 'auto'; // reset height to recalc scrollHeight
    if (ta.scrollHeight <= maxHeight) {
        ta.style.height = `${ta.scrollHeight}px`; // grow until maxHeight
        ta.style.overflowY = 'hidden'; // hide scrollbar while growing
    } else {
        ta.style.height = `${maxHeight}px`; // cap at maxHeight
        ta.style.overflowY = 'auto'; // enable scrollbar
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return
    const payload = {
      articleId,
      imageId: null, // article comment
      parentId: null,
      content: text,
    }
    try {
      await dispatch(createCommentThunk(payload)).unwrap()
      setText('')
      dispatch(fetchArticleCommentsThunk({ articleId })) // refresh comments
      window.showToast('Success', 'Comment sent successfully!', 'success')
    } catch (err: any) {
      window.showToast(
        'Error',
        insertCommentError || 'Failed to send comment',
        'error'
      )
    }
  }

  return (
    <div className="d-flex flex-column">
      <h6 className="mb-1">Comments {articleTotals[articleId] !== undefined && `(${articleTotals[articleId]})`}</h6>

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
            maxHeight: '100px',
          }}
        />
        <button
          className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-1 rounded-0"
          style={{ zIndex: 10 }}
          onClick={handlePost}
          disabled={insertCommentLoading || !text.trim()}
        >
          <i className="bi bi-send"></i>{' '}
          {insertCommentLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

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
