import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchArticlesThunk, updateArticleThunk, deleteArticleThunk } from '../features/blog/blogSlice'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import CreatePostCard from '../components/CreatePostCard'
import EditPostCard from '../components/EditPostCard'
import { useNavigate } from 'react-router-dom'
import { fetchProfileThunk } from '../features/profiles/profilesSlice'
import ArticleImageGrid from '../components/ArticleImageGrid'
import type { GridImage } from '../components/ArticleImageGrid'
import ImageViewerModal from '../components/ArticleDetailsOnView/ImageViewerModal'
import CommentSection from '../components/ArticleDetailsOnView/CommentSection'
import { resetCommentsState } from '../features/comments/commentsSlice'

export default function MainPage() {
  const { user } = useAppSelector((state) => state.auth)
  const { articles, total, contentLoading, blogError } = useAppSelector((state) => state.blog)
  
  const [searchTerm, setSearchTitle] = useState('')
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState<{
    image: GridImage
    index: number
    article: any
  } | null>(null)

  const deleteLoadingById = useAppSelector(
    (state) => state.blog.deleteArticleLoadingById
  )

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
 
    const checkProfile = async () => {
      try {
        const profileResult = await dispatch(fetchProfileThunk()).unwrap()
        if (!profileResult) {
          navigate('/profile', { replace: true }) // first-time user
        }
      } catch (err) {
        navigate('/profile', { replace: true }) // no profile → redirect
      }
    }

    checkProfile()
  }, [user, dispatch, navigate])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 800)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [page, setPage] = useState(1)
  const limit = isMobile ? 3 : 5
  useEffect(() => {
    dispatch(fetchArticlesThunk({ search: searchTerm, limit, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, searchTerm, page])

  useEffect(() => {
  if (!user) {
      setPage(1)
    }
  }, [user])

  const [isCreating, setIsCreating] = useState(false)

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const handleUpdate = async (
    articleId: string,
    data: { 
      title: string
      content: string
      files: File[]
      removedImages: string[]
    }
  ) => {
    try {
      await dispatch(
        updateArticleThunk({
          id: articleId,
          title: data.title,
          content: data.content,
          files: data.files,
          removedImages: data.removedImages,
        })
      ).unwrap()

      await dispatch(fetchArticlesThunk({ search: searchTerm, limit, page }))

      window.showToast('Success', 'Article updated successfully.', 'success')
      setEditingArticleId(null)
    } catch (err: any) {
      const message =
        err?.message ||
        err ||
        'Failed to update article. Something went wrong.'
 
      window.showToast('Error', message, 'error')
    }
  }

  const handleDelete = async (articleId: string) => {
  try {
    await dispatch(deleteArticleThunk(articleId)).unwrap()
    window.showToast('Deleted', 'Article deleted successfully.', 'success')

    // after deletion, fetch articles for the current page
    const resultAction = await dispatch(
      fetchArticlesThunk({ search: searchTerm, limit, page })
    ).unwrap()

    // if the current page becomes empty and it's not the first page, go back one page
    if (resultAction.data.length === 0 && page > 1) {
      setPage(page - 1)
    }

  } catch (err: any) {
    const message =
      err?.message || err || 'Failed to delete article. Something went wrong.'
    window.showToast('Error', message, 'error')
  } finally {
    setConfirmDeleteId(null)
  }
}
  return (
    <div className="d-flex flex-column min-vh-100">
      <Nav />

      <main className="flex-grow-1 container py-4 col-12 col-lg-6 col-md-10" >
        <div className="d-flex justify-content-end p-1 bg-dark">
          <div className="input-group rounded-0"> {/*style={{ maxWidth: '250px' }}*/}
            <input
              type="text"
              className="form-control rounded-0"
              placeholder="Search Title"
              value={searchTerm}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <span className="input-group-text rounded-0">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h1 className="display-4">Where Ideas Take Shape</h1>
            <p className="lead">
              Short reads on focus, discipline, and everyday wisdom.
            </p>

            <div className="mt-4">
              <div className="d-flex align-items-center gap-2 mb-3 justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <h3 className="mb-0">
                    {searchTerm
                      ? `Search results for "${searchTerm}"`
                      : page === 1
                      ? 'Recent Posts'
                      : 'Older Posts'}
                  </h3>
                  {contentLoading && (
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      loading contents…
                    </span>
                  )}
                </div>

                {user && (
                  <button
                    className="btn btn-outline-dark btn-md rounded-0"
                    onClick={() => setIsCreating(true)}
                  >
                    Create Post
                  </button>
                )}
              </div>

              {blogError && <p className="text-danger">{blogError}</p>}

              <CreatePostCard
                visible={isCreating}
                onCancel={() => setIsCreating(false)}
              />

              {!contentLoading && articles.length === 0 && !blogError && (
                <p className="text-muted">No available articles. Stay tuned!</p>
              )}

              {articles.map((article: any) => {
                const isDeleting = !!deleteLoadingById[article.id]
                const isEditing = editingArticleId === article.id

                return (
                  <div key={article.id} className="card mb-3 rounded-0">
                    <div className="card-body position-relative">
                      {isEditing ? (
                        <EditPostCard
                          article={{
                            ...article,
                            images: article.images ?? [],
                            title: article.title ?? '',
                            content: article.content ?? '',
                            author: article.full_name ?? article.author ?? 'Unknown',
                          }}
                          onCancel={() => setEditingArticleId(null)}
                          onConfirmSave={(data) => handleUpdate(article.id, data)}
                        />
                      ) : (
                      <div>
                        <h4>{article.title ?? 'Untitled'}</h4>
                        <p>{article.content ?? ''}</p>

                        {/* Images*/}
                        <ArticleImageGrid
                          images={article.images ?? []}
                          onImageClick={(img, index) =>
                            setSelectedImage({
                              image: img,
                              index,
                              article,
                            })
                          }
                        />
                        <small className="text-muted d-block mt-2 mb-2">
                          Published by {article.full_name ?? article.author ?? 'Unknown'} •{' '}
                          {article.created_at ? timeAgo(article.created_at) : 'Unknown date'}
                        </small>

                        {/* comments*/}
                        <CommentSection 
                          key={article.id}
                          articleId={article.id}
                        />

                        {user && article.author_id === user.id && (
                          <div className="d-flex gap-2 mt-2 justify-content-end flex-wrap flex-sm-nowrap">
                            <button
                              className="btn btn-link p-0 text-dark text-decoration-none"
                              onClick={() => setEditingArticleId(article.id)}
                            >
                              EDIT
                            </button>
                            <span className="mx-1">|</span>
                            {confirmDeleteId !== article.id ? (
                              <button
                                className="btn btn-link p-0 text-dark text-decoration-none"
                                onClick={() => setConfirmDeleteId(article.id)}
                              >
                                DELETE
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn btn-link p-0 text-success text-decoration-none"
                                  disabled={isDeleting}
                                  onClick={() => handleDelete(article.id)}
                                >
                                  {isDeleting ? 'DELETING…' : 'YES'}
                                </button>
                                <span className="mx-1">-</span>
                                <button
                                  className="btn btn-link text-secondary p-0 text-decoration-none"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  NO
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                )
              })}

              {total > 0 && (
                <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
                  {(() => {
                    const totalPages = Math.ceil(total / limit)

                    // dynamic window: 3 pages if width <= 800, otherwise 5
                    const pageWindow = window.innerWidth <= 800 ? 3 : 5

                    let startPage = Math.max(1, page - Math.floor(pageWindow / 2))
                    let endPage = Math.min(totalPages, startPage + pageWindow - 1)
                    startPage = Math.max(1, endPage - pageWindow + 1)

                    const pages = Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    )

                    return (
                      <>
                        <button
                          className="btn btn-outline-dark rounded-0"
                          disabled={page === 1}
                          onClick={() => setPage(1)}
                        >
                          &lt;&lt;
                        </button>

                        <button
                          className="btn btn-outline-dark rounded-0"
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          &lt;
                        </button>

                        {pages.map((pNum) => (
                          <button
                            key={pNum}
                            style={{ borderRadius: 0 }}
                            className={`btn ${
                              pNum === page ? 'btn-dark' : 'btn-outline-dark rounded-0'
                            }`}
                            onClick={() => setPage(pNum)}
                          >
                            {pNum}
                          </button>
                        ))}

                        <button
                          className="btn btn-outline-dark rounded-0"
                          disabled={page === totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          &gt;
                        </button>

                        <button
                          className="btn btn-outline-dark rounded-0"
                          disabled={page === totalPages}
                          onClick={() => setPage(totalPages)}
                        > 
                          &gt;&gt;
                        </button>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {selectedImage && (
        <ImageViewerModal
          images={selectedImage.article.images}
          startIndex={selectedImage.index}
          article={selectedImage.article}
          onClose={() => {
            setSelectedImage(null);
            dispatch(resetCommentsState());
          }}
        />
      )}
      <Footer />
    </div>
  )

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
}

