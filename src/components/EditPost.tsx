import { useEffect, useState } from 'react'
// import { useAppDispatch } from '../app/hooks'
// import { updateArticleThunk } from '../features/blog/blogSlice'

interface Props {
  article: any
  onCancel: () => void
  onSave: (data: { title: string; content: string }) => void
}

export default function EditPostCard({ article, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)

  const [confirmSave, setConfirmSave] = useState(false)

  // reset when article changes
  useEffect(() => {
    setTitle(article.title)
    setContent(article.content)
    setConfirmSave(false)
  }, [article])

  return (
    <>
      <input
        type="text"
        className="form-control rounded-0 mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="form-control rounded-0 mb-2"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

        <small className="text-muted d-block">
        Published By {article.author} • {article.created_at.toLocaleDateString()}
        </small>
        {article.updated_at && article.updated_by && (
        <small className="text-muted d-block">
            Updated By {article.updated_by} • {new Date(article.updated_at).toLocaleDateString()}
        </small>
        )}

      <div className="position-absolute bottom-0 end-0 mb-2 me-2 d-flex align-items-center">
        {!confirmSave ? (
          <>
            <button
              className="btn btn-link p-0 text-dark"
              onClick={() => setConfirmSave(true)}
            >
              SAVE
            </button>

            <span className="mx-1">|</span>

            <button
              className="btn btn-link p-0 text-secondary"
              onClick={onCancel}
            >
              CANCEL
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-link p-0 text-success me-2"
              onClick={() => onSave({ title, content })}
            >
              YES
            </button>
            <button
              className="btn btn-link p-0 text-secondary"
              onClick={() => setConfirmSave(false)}
            >
              NO
            </button>
          </>
        )}
      </div>
    </>
  )
}