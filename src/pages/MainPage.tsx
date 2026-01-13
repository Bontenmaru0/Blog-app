import { useAppSelector } from '../app/hooks'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function MainPage() {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div className="d-flex flex-column min-vh-100">
      <Nav />
      <main className="flex-grow-1 container py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="display-4">Welcome to the Blog</h1>
            <p className="lead">This is the main page of our blog app. Here you can view and create blog posts.</p>
            {user && (
              <div className="mb-4">
                <h3>Admin Controls</h3>
                <button className="btn btn-success me-2">Create Post</button>
                <button className="btn btn-primary me-2">Edit Posts</button>
                <button className="btn btn-danger">Delete Posts</button>
              </div>
            )}
            <div className="mt-4">
              <h2>Recent Posts</h2>
              <p className="text-muted">No posts yet. Stay tuned!</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}