import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logoutThunk } from '../features/auth/authSlice'
import { useRef } from 'react'
import UserProfile, { type ProfileOffcanvasHandle, } from '../components/UserProfile'

export default function Nav() {
  const { user, loading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const profileRef = useRef<ProfileOffcanvasHandle>(null)

  const handleLogout = async () => {
    try {
        await dispatch(logoutThunk()).unwrap()
      window.showToast('See you next time 👋', 'Logged out successfully.', 'success')
    } catch (err) {
        window.showToast('Error', 'Logout failed', 'error')
    }
  }

  return (
    <>
  <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top border-bottom">
    <div className="container-fluid">
      <Link className="navbar-brand" to="/">Modern Samurai / Blog</Link>

      {user ? (
        <div className="d-flex">
          <span
            className="navbar-text"
            style={{ cursor: 'pointer' }}
            onClick={() => profileRef.current?.open()}
          >
            {user.email} |{' '}
            {loading ? (
              <span>Logging out...</span>
            ) : (
              <a
                href="#"
                className="text-decoration-none"
                onClick={(e) => {
                  e.preventDefault()
                  handleLogout()
                }}
              >
                Logout
              </a>
            )}
          </span>
        </div>
      ) : (
        <div className="d-flex">
          <span className="navbar-text">
            <Link className="text-decoration-none" to="/login">
              LOGIN
            </Link>{' '}
            |{' '}
            <Link className="text-decoration-none" to="/register">
              REGISTER
            </Link>
          </span>
        </div>
      )}
    </div>
  </nav>

  <UserProfile ref={profileRef} />
</>
  )
}
