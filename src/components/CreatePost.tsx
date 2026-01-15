

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

  return (
    <div className="card mb-3 rounded-0">
      <div className="card-body position-relative">
        <input
          type="text"
          className="form-control rounded-0 mb-2"
          placeholder="Title"
        />

        <textarea
          className="form-control rounded-0 mb-2"
          rows={4}
          placeholder="Write your content here..."
        />

        <small className="text-muted">
          Publishing as {publishingAs || 'Guest'}
        </small>

        <div className="position-absolute bottom-0 end-0 mb-2 me-2">
          <button className="btn btn-sm btn-dark rounded-0 me-2" style={{ width: 100 }}>
            POST
          </button>
          <button
            className="btn btn-sm btn-outline-dark rounded-0"
            onClick={onCancel} style={{ width: 100 }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
