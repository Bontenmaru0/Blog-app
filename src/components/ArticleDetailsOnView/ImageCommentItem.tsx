import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deleteCommentThunk } from "../../features/comments/commentsSlice"

interface Props {
  comment: any;
  currentUserId?: string;
}

export default function ImageCommentItem({ comment, currentUserId }: Props) {
  const dispatch = useAppDispatch();
  const { deleteCommentLoading, deleteCommentError } = useAppSelector(
    (state) => state.comments
  );

  console.log(comment)

  const isOwner = comment.user_id === currentUserId;


  const handleDelete = async () => {
    try {
      await dispatch(
        deleteCommentThunk({ commentId: comment.id })
      ).unwrap();
      window.showToast('Success', 'Comment deleted successfully', 'success')
    } catch (err: any) {
      window.showToast('Error', deleteCommentError ||'Failed to delete comment. Something went wrong.', 'error')
    }
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between">
        <strong className="small">
          {comment.author_name ?? "Anonymous"}
        </strong>
        <small className="text-muted">
          {timeAgo(comment.created_at)}
        </small>
      </div>

      <p className="mb-1">{comment.content}</p>

      <div className="d-flex gap-2">
        {isOwner && (
          <>
            {/* <button className="btn btn-link p-0 small">EDIT</button> */}

            <button
              className="btn btn-link p-0 small text-danger"
              onClick={handleDelete}
              disabled={deleteCommentLoading}
            >
              {deleteCommentLoading ? "DELETING..." : "DELETE"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}
