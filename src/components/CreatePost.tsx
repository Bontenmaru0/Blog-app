import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createArticleThunk, fetchArticlesThunk } from '../features/blog/blogSlice'
import { useState } from 'react'

interface Props {
  visible: boolean
  publishingAs?: string
  onCancel: () => void
}

export default function CreatePostCard({
  visible,
  publishingAs,
  onCancel
}: Props) {
  if (!visible) return null

  const { insertArticleLoading } = useAppSelector((state) => state.blog)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const dispatch = useAppDispatch()
  const limit = 5 
  const [searchTerm] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createArticleThunk({ title, content })).unwrap()

      await dispatch(fetchArticlesThunk({ search: searchTerm, limit, page: 1 }))

      window.showToast('Success', 'Article posted successfully.', 'success')
      setTitle('')
      setContent('')
      onCancel()
    } catch (err) {
      window.showToast(
        'Error',
        'Article creation failed. Something went wrong.',
        'error'
      )
    }
  }

  return (
    <div className="card mb-3 rounded-0">
      <div className="card-body position-relative">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control rounded-0 mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="form-control rounded-0 mb-2"
            rows={4}
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <small className="text-muted">
            Publishing as {publishingAs || 'Guest'}
          </small>

          <div className="position-absolute bottom-0 end-0 mb-2 me-2">
            <button
              className="btn btn-sm btn-dark rounded-0 me-2"
              style={{ width: insertArticleLoading ? 150 : 100 }}
              disabled={insertArticleLoading}
            >
              {insertArticleLoading ? 'POSTING ARTICLE...' : 'POST'}
            </button>
            <button
              className="btn btn-sm btn-outline-dark rounded-0"
              onClick={onCancel}
              style={{ width: 100 }}
              disabled={insertArticleLoading}
              type="button"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
