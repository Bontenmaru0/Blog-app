import { useState, useRef, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { fetchImagesCommentsThunk, deleteCommentThunk, updateCommentThunk } from "../../features/comments/commentsSlice"

interface Props {
  comment: any
  currentUserId?: string
  articleId: string
  imageId: string
}

export default function ImageCommentItem({
  comment,
  currentUserId,
  articleId,
  imageId
}: Props) {
  const dispatch = useAppDispatch()
  const { deleteCommentLoading, deleteCommentError, updateCommentLoading, updateCommentError } = useAppSelector(
    (state) => state.comments
  )

  const isOwner = comment.user_id === currentUserId

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)

  // 🔹 IMAGE EDIT STATE
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(comment.image?.image_url ?? null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  const removedImageUrl = removeExistingImage ? comment.image?.image_url ?? null : null

  const editRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local image state when Redux updates
  useEffect(() => {
    if (!isEditing) {
      setEditImagePreview(comment.image?.image_url ?? null)
      setEditImageFile(null)
      setRemoveExistingImage(false)
    }
  }, [comment.image?.image_url])

  // Auto-grow textarea
  useEffect(() => {
    if (!editRef.current) return
    const ta = editRef.current
    const maxHeight = 100

    ta.style.height = "auto"
    if (ta.scrollHeight <= maxHeight) {
      ta.style.height = `${ta.scrollHeight}px`
      ta.style.overflowY = "hidden"
    } else {
      ta.style.height = `${maxHeight}px`
      ta.style.overflowY = "auto"
    }
  }, [editText, isEditing])

  const handleDelete = async () => {
    try {
      await dispatch(deleteCommentThunk({ commentId: comment.id })).unwrap()
      window.showToast("Success", "Comment deleted successfully", "success")
    } catch {
      window.showToast( "Error", deleteCommentError || "Failed to delete comment", "error" )
    } finally {
      setConfirmDelete(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      await dispatch(updateCommentThunk({
        commentId: comment.id,
        content: editText,
        stats: 'edited',
        newImage: editImageFile,
        removedImage: removedImageUrl,
        articleId: articleId
      })).unwrap()

      await dispatch(fetchImagesCommentsThunk({ articleId, imageId }))
      window.showToast("Success", "Comment updated successfully", "success")
      setIsEditing(false)
    } catch {
      window.showToast("Error", updateCommentError||"Failed to update comment", "error")
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))

    // Mark original image as removed if replacing
    if (comment.image?.image_url) {
      setRemoveExistingImage(true)
    }
  }

  const removeImage = () => {
    setEditImageFile(null)
    setEditImagePreview(null)
    setRemoveExistingImage(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditText(comment.content)
    setEditImageFile(null)
    setEditImagePreview(comment.image?.image_url ?? null)
    setRemoveExistingImage(false)
  }

  const hasImage = !!editImagePreview

  return (
    <div className="mb-3 card rounded-0 p-3">
      <div className="d-flex justify-content-between">
        <strong className="small">{comment.author_name ?? "Anonymous"}</strong>
        <small className="text-muted">{timeAgo(comment.created_at)}</small>
      </div>

      {/* IMAGE */}
      <div className="mb-2 mt-2 position-relative d-inline-block">
        {hasImage ? (
          <img
            src={editImagePreview!}
            alt=""
            className="img-fluid"
            style={{ maxHeight: 200, objectFit: "contain" }}
          />
        ) : isEditing ? (
          <div
            className="bg-light border w-100"
            style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span className="text-muted cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              No image
            </span>
          </div>
        ) : null}

        {/* IMAGE BUTTON (Change/Add) */}
        {isEditing && (
          <button
            type="button"
            className="btn btn-sm btn-light position-absolute bottom-0 start-0 rounded-0 m-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-image"></i> {hasImage ? "Change" : "Add"}
          </button>
        )}

        {/* REMOVE IMAGE BUTTON */}
        {isEditing && hasImage && (
          <button
            type="button"
            className="btn btn-sm btn-dark position-absolute top-0 start-0 rounded-0"
            style={{ padding: "0 6px", lineHeight: 1, fontSize: "0.8rem" }}
            onClick={removeImage}
          >
            ✕
          </button>
        )}
      </div>

      {isEditing && (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={handleEditImageChange}
        />
      )}

      <div className="overflow-auto mb-1">
        {isEditing ? (
          <textarea
            ref={editRef}
            className="form-control form-control-sm rounded-0"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            style={{
              paddingRight: "4rem",
              paddingBottom: "2.5rem",
              resize: "none",
              minHeight: "50px",
              maxHeight: "75px"
            }}
          />
        ) : (
          <p>{comment.content}</p>
        )}
      </div>

      {isOwner && (
        <div className="d-flex gap-2 flex-wrap">
          {!isEditing ? (
            <button
              className="btn btn-outline-dark btn-sm rounded-0"
              onClick={() => setIsEditing(true)}
            >
              <small>EDIT</small>
            </button>
          ) : (
            <>
              <button
                className="btn btn-outline-success btn-sm rounded-0"
                onClick={handleSaveEdit}
                disabled={updateCommentLoading}
              >
                <small>{updateCommentLoading ? "SAVING..." : "SAVE"}</small>
              </button>

              <button
                className="btn btn-outline-secondary btn-sm rounded-0"
                onClick={cancelEdit}
              >
                <small>CANCEL</small>
              </button>
              <span className="mx-1">|</span>
            </>
          )}

          {!confirmDelete ? (
            <button
              className="btn btn-outline-dark btn-sm rounded-0"
              onClick={() => setConfirmDelete(true)}
            >
              <small>DELETE</small>
            </button>
          ) : (
            <>
              <span className="mx-1">|</span>
              <button
                className="btn btn-outline-danger btn-sm rounded-0"
                disabled={deleteCommentLoading}
                onClick={handleDelete}
              >
                <small>{deleteCommentLoading ? "DELETING..." : "YES"}</small>
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-0"
                onClick={() => setConfirmDelete(false)}
              >
                <small>NO</small>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}
