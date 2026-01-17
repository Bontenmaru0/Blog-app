import { useState, useEffect } from 'react'

interface Props {
  article: any
  onCancel: () => void
  onConfirmSave: (data: { title: string; content: string }) => void
}

export default function EditPostCard({
  article,
  onCancel,
  onConfirmSave,
}: Props) {
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
        Published By {article.author} • {new Date(article.created_at).toLocaleDateString()}
        {article.updated_at && article.updated_by && (
          <> | Updated By {article.updated_by} • {new Date(article.updated_at).toLocaleDateString()}</>
        )}
      </small>

      <div className="position-absolute bottom-0 end-0 mb-2 me-2 d-flex align-items-center">
        {!confirmSave ? (
          <>
            <button
              type="button"
              className="btn btn-link p-0 text-success text-decoration-none me-2"
              onClick={() => setConfirmSave(true)}
            >
              SAVE
            </button>
            <span className="mx-1">|</span>
            <button
              type="button"
              className="btn btn-link p-0 text-secondary text-decoration-none"
              onClick={onCancel}
            >
              CANCEL
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-link p-0 text-success text-decoration-none"
              onClick={() => onConfirmSave({ title, content })}
            >
              YES
            </button>

            <span className="mx-1">-</span> 

            <button
              type="button"
              className="btn btn-link p-0 text-secondary text-decoration-none"
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
