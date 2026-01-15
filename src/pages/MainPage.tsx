import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchArticlesThunk, deleteArticleThunk } from '../features/blog/blogSlice'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import CreatePostCard from '../components/CreatePost'
// import EditPostCard from '../components/EditPost'

export default function MainPage() {
  const { user } = useAppSelector((state) => state.auth)
  const { articles, total, contentLoading, blogError } = useAppSelector(
    (state) => state.blog
  )

  const [searchTerm, setSearchTitle] = useState('')
  const [page, setPage] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const deleteLoadingById = useAppSelector(
    (state) => state.blog.deleteArticleLoadingById
  )

  const limit = 5
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchArticlesThunk({ search: searchTerm, limit, page }))
  }, [dispatch, searchTerm, page])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // ✅ ADDED: delete handler with toast
  const handleDelete = async (articleId: string) => {
    try {
      await dispatch(deleteArticleThunk(articleId)).unwrap()
      window.showToast('Deleted', 'Article deleted successfully.', 'success')
    } catch {
      window.showToast('Error', 'Failed to delete article. Something went wrong', 'error')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Nav />

      <main className="flex-grow-1 container py-4">
        <div className="d-flex justify-content-end p-3 bg-dark">
          <div className="input-group rounded-0" style={{ maxWidth: '250px' }}>
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
                      loading…
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
                const formattedDateTime = new Date(article.created_at).toLocaleString()

                return (
                  <div key={article.id} className="card mb-3 rounded-0">
                    <div className="card-body position-relative">
                      <h4>{article.title}</h4>
                      <p>{article.content}</p>
                      <small className="text-muted">
                      Published by {article.author} • {formattedDateTime}
                      </small>

                      {user && (
                        <div className="position-absolute bottom-0 end-0 mb-2 me-2">
                          {confirmDeleteId !== article.id ? (
                            <button
                              className="btn btn-link p-0 text-dark"
                              onClick={() => setConfirmDeleteId(article.id)}
                            >
                              DELETE
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-link p-0 text-danger me-2"
                                disabled={isDeleting}
                                onClick={() => handleDelete(article.id)} // ✅ changed
                              >
                                {isDeleting ? 'DELETING…' : 'YES'}
                              </button>
                              <button
                                className="btn btn-link p-0"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                NO
                              </button>
                            </>
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
                    const pageWindow = 5
                    let startPage = Math.max(
                      1,
                      page - Math.floor(pageWindow / 2)
                    )
                    let endPage = Math.min(
                      totalPages,
                      startPage + pageWindow - 1
                    )
                    startPage = Math.max(1, endPage - pageWindow + 1)

                    const pages = Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    )

                    return (
                      <>
                        <button
                          className="btn btn-outline-dark"
                          disabled={page === 1}
                          onClick={() => setPage(1)}
                        >
                          &lt;&lt;
                        </button>

                        <button
                          className="btn btn-outline-dark"
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          &lt;
                        </button>

                        {pages.map((pNum) => (
                          <button
                            key={pNum}
                            className={`btn ${
                              pNum === page
                                ? 'btn-dark'
                                : 'btn-outline-dark'
                            }`}
                            onClick={() => setPage(pNum)}
                          >
                            {pNum}
                          </button>
                        ))}

                        <button
                          className="btn btn-outline-dark"
                          disabled={page === totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          &gt;
                        </button>

                        <button
                          className="btn btn-outline-dark"
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

      <Footer />
    </div>
  )
}
