import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchImagesCommentsThunk, deleteCommentThunk, updateCommentThunk } from "../../features/comments/commentsSlice";

interface Props {
  comment: any;
  currentUserId?: string;
  articleId: string;
  imageId: string
}

export default function ImageCommentItem({ comment, currentUserId, articleId, imageId }: Props) {
  const dispatch = useAppDispatch();
  const { deleteCommentLoading, deleteCommentError } = useAppSelector(
    (state) => state.comments
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [updateLoading, setUpdateLoading] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const isOwner = comment.user_id === currentUserId;

  const handleDelete = async () => {
    try {
      await dispatch(deleteCommentThunk({ commentId: comment.id })).unwrap();
      window.showToast("Success", "Comment deleted successfully", "success");
    } catch (err: any) {
      window.showToast(
        "Error",
        deleteCommentError || "Failed to delete comment. Something went wrong.",
        "error"
      );
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      setUpdateLoading(true);
      await dispatch(updateCommentThunk({ commentId: comment.id, content: editText, stats: 'edited' })).unwrap();
      dispatch(fetchImagesCommentsThunk({ articleId, imageId }))
      window.showToast("Success", "Comment updated successfully", "success");
      setIsEditing(false);
    } catch (err: any) {
      window.showToast(
        "Error",
        "Failed to update comment. Something went wrong.",
        "error"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Auto-grow + scroll for edit textarea
  useEffect(() => {
    if (!editRef.current) return;
    const ta = editRef.current;
    const maxHeight = 100; // px, adjust to your design

    ta.style.height = "auto";
    if (ta.scrollHeight <= maxHeight) {
      ta.style.height = `${ta.scrollHeight}px`;
      ta.style.overflowY = "hidden";
    } else {
      ta.style.height = `${maxHeight}px`;
      ta.style.overflowY = "auto";
    }
  }, [editText, isEditing]);

  return (
    <div className="mb-3 card rounded-0 p-3">
      <div className="d-flex justify-content-between">
        <strong className="small">{comment.author_name ?? "Anonymous"}</strong>
        <small className="text-muted">{timeAgo(comment.created_at)}</small>
      </div>

      <div className="overflow-auto mb-1">
        {isEditing ? (
          <textarea
            ref={editRef}
            className="form-control form-control-sm rounded-0"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            style={{
              paddingRight: '4rem',
              paddingBottom: '2.5rem',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '75px',
            }}
          />
        ) : (
          <p>{comment.content}</p>
        )}
      </div>

      {isOwner && (
        <div className="d-flex gap-2">
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
                disabled={updateLoading}
              >
                <small>{updateLoading ? "SAVING..." : "SAVE"}</small>
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-0"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.content);
                }}
              >
                <small>CANCEL</small>
              </button>
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
  );
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
