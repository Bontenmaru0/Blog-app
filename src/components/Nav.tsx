import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'

export default function Nav() {
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/"> Modern Samurai / Blog</Link>
        {user ? (
          <div className="d-flex">
            <span className="navbar-text">{user.email} | {loading ? <span>Logging out...</span> : <a className="text-decoration-none" href="#" onClick={() => dispatch(logout())}>Logout</a>}</span>
          </div>
        ) : (
          <div className="d-flex">
            <span className="navbar-text"><Link className="text-decoration-none" to="/login">LOGIN</Link> | <Link className="text-decoration-none" to="/register">REGISTER</Link></span>
          </div>
        )}
      </div>
    </nav>
  )
}