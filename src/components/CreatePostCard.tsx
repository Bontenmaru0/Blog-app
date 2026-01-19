import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createArticleThunk, fetchArticlesThunk } from '../features/blog/blogSlice'
import { useState } from 'react'
import ArticleImageGrid from './Img/ArticleImageGrid'

interface Props {
  visible: boolean
  publishingAs?: string
  onCancel: () => void
}

export default function CreatePostCard({ visible, onCancel }: Props) {
  // ✅ Hooks called first, always
  const { profile } = useAppSelector((state) => state.profiles)
  const { insertArticleLoading } = useAppSelector((state) => state.blog)
  const dispatch = useAppDispatch()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [searchTerm] = useState('')
  const limit = 5

  // Early return for invisible state
  if (!visible) return null

  // Add images to state & previews
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createArticleThunk({ title, content, images: files })).unwrap()
      await dispatch(fetchArticlesThunk({ search: searchTerm, limit, page: 1 }))

      window.showToast('Success', 'Article posted successfully.', 'success')
      setTitle('')
      setContent('')
      setPreviews([])
      setFiles([])
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
      <div className="card-body d-flex flex-column">
        <form onSubmit={handleSubmit} className="d-flex flex-column">
          {/* Title input */}
          <input
            type="text"
            className="form-control rounded-0 mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Content textarea */}
          <textarea
            className="form-control rounded-0 mb-2"
            rows={4}
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          {/* Image uploader */}
          <div className="mb-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddImages}
              className="form-control rounded-0"
            />
          </div>

          {/* Image previews */}
          <ArticleImageGrid
            images={previews.map(url => ({ image_url: url }))}
            onRemove={(index) => {
              setPreviews(prev => prev.filter((_, i) => i !== index))
              setFiles(prev => prev.filter((_, i) => i !== index))
            }}
          />

          {/* Metadata */}
          <small className="text-muted d-block mt-2 mb-2">
            Publishing as {profile?.full_name ?? 'You'}
          </small>

          {/* Buttons in-flow, flex-wrap for mobile */}
          <div className="d-flex gap-2 mt-2 justify-content-end flex-wrap flex-sm-nowrap">
            <button
              type="submit"
              className="btn btn-sm btn-dark rounded-0"
              style={{ width: insertArticleLoading ? 150 : 100 }}
              disabled={insertArticleLoading}
            >
              {insertArticleLoading ? 'POSTING ARTICLE...' : 'POST'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-dark rounded-0"
              onClick={onCancel}
              style={{ width: 100 }}
              disabled={insertArticleLoading}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
