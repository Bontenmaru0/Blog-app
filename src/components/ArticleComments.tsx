// import { useEffect, useState, useRef } from 'react'
// import { useAppDispatch, useAppSelector } from '../app/hooks'
// import { fetchArticleCommentsThunk, createCommentThunk } from '../features/comments/commentsSlice'

// export default function ArticleComments({ article }: { article: any }) {
//   const dispatch = useAppDispatch()
//   const { articleComments, articleContentLoading, insertCommentLoading } = useAppSelector((state) => state.comments)

//   const [text, setText] = useState('')
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   // fetch comments on article load
//   useEffect(() => {
//     if (!article?.id) return
//     dispatch(fetchArticleCommentsThunk({ articleId: article.id }))
//   }, [article?.id, dispatch])

//   const handleInput = () => {
//     if (!textareaRef.current) return
//     textareaRef.current.style.height = 'auto'
//     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
//   }

//   const handlePost = async () => {
//     if (!text.trim()) return
//     try {
//       await dispatch(
//         createCommentThunk({
//           articleId: article.id,
//           imageId: null,
//           parentId: null,
//           content: text,
//         })
//       ).unwrap()
//       setText('')
//       window.showToast('Success', 'Comment sent successfully!', 'success')
//     } catch {
//       window.showToast('Error', 'Failed to send comment', 'error')
//     }
//   }

//   const timeAgo = (dateString: string) => {
//     const diff = Date.now() - new Date(dateString).getTime()
//     const mins = Math.floor(diff / 60000)
//     if (mins < 1) return 'just now'
//     if (mins < 60) return `${mins} minutes ago`
//     const hours = Math.floor(mins / 60)
//     if (hours < 24) return `${hours} hours ago`
//     const days = Math.floor(hours / 24)
//     return `${days} days ago`
//   }

//   return (
//     <div className="border p-3 mb-4">
//       <h5>Comments</h5>

//       <textarea
//         ref={textareaRef}
//         className="form-control mb-2"
//         rows={2}
//         placeholder="Write a comment..."
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onInput={handleInput}
//         onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePost())}
//       />
//       <button
//         className="btn btn-dark mb-3"
//         onClick={handlePost}
//         disabled={insertCommentLoading}
//       >
//         {insertCommentLoading ? 'Sending…' : 'Send'}
//       </button>

//       {articleContentLoading && <p className="text-muted">Loading comments…</p>}

//       {article.map((c) => (
//         <div key={c.id} className="mb-2 border-top pt-2">
//           <strong>{c.author_name ?? 'Anonymous'}</strong>{' '}
//           <small className="text-muted">{timeAgo(c.created_at)}</small>
//           <p>{c.content}</p>
//         </div>
//       ))}

//       {article.length === 0 && !articleContentLoading && <p className="text-muted">No comments yet.</p>}
//     </div>
//   )
// }
