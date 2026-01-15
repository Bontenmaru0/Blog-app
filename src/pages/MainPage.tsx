import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getArticles } from '../features/blog/blogSlice'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import CreatePostCard from '../components/CreatePost'

export default function MainPage() {
  const { user } = useAppSelector((state) => state.auth)
  const { articles, total, contentLoading, blogError } = useAppSelector((state) => state.blog)
  const dispatch = useAppDispatch()

  const [searchTerm, setSearchTitle] = useState('')
  const [page, setPage] = useState(1)

  const [isCreating, setIsCreating] = useState(false)

  const limit = 5
  // const isLastPage = page * limit >= total

  useEffect(() => {
    dispatch(getArticles({ search: searchTerm, limit: 5, page }))
  }, [dispatch, searchTerm, page])

  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  }, [page])

  return (
    <div className="d-flex flex-column min-vh-100">
      <Nav />
      <main className="flex-grow-1 container py-4">
        {/* Search bar */}
        <div className="d-flex justify-content-end p-3 bg-dark">
          <div className="input-group rounded-0" style={{ maxWidth: '250px' }}>
            <input
              type="text"
              className="form-control rounded-0"
              placeholder="Search"
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

            {/* Recent Posts */}
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

                <button
                  className="btn btn-outline-dark btn-md rounded-0"
                  onClick={() => setIsCreating(true)}
                >
                  Create Post
                </button>
              </div>

              {blogError && <p className="text-danger">{blogError}</p>}

              {/*triggered by create post button */}
              <CreatePostCard
                visible={isCreating}
                onCancel={() => setIsCreating(false)}
              />

              {!contentLoading && articles.length === 0 && !blogError && (
                <p className="text-muted">No available articles. Stay tuned!</p>
              )}

              {articles.map((article: any) => (
                <div key={article._id} className="card mb-3 rounded-0">
                  <div className="card-body position-relative">
                    <h4 className="card-title">{article.title}</h4>
                    <p className="card-text">{article.content}</p>
                    <small className="text-muted">
                      Published By {article.author} •{' '}
                      {article.created_at.toLocaleDateString()}
                    </small>

                    {user && (
                      <div className="position-absolute bottom-0 end-0 mb-2 me-2">
                        <Link className="text-dark" to="/">EDIT</Link> |{' '}
                        <Link className="text-dark" to="/">DELETE</Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 🔢 PAGINATION (UNCHANGED, FULL) */}
              {total > 0 && (
                <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
                  {(() => {
                    const totalPages = Math.ceil(total / limit)
                    const pageWindow = 5
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
                              pNum === page ? 'btn-dark' : 'btn-outline-dark'
                            }`}
                            onClick={() => setPage(pNum)}
                          >
                            {pNum}
                          </button>
                        ))}

                        <button
                          className="btn btn-outline-dark"
                          disabled={page === totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
