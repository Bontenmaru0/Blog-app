import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logoutThunk } from '../features/auth/authSlice'
import { useRef } from 'react'
import UserProfile, { type ProfileOffcanvasHandle } from './UserProfileOffcanvas'

export default function Nav() {
  const { user, logoutError, logoutLoading } = useAppSelector((state) => state.auth)
  const { profile, fetchProfileLoading } = useAppSelector((state) => state.profiles)
  const fullName = profile?.full_name ?? ''
  const dispatch = useAppDispatch()

  const profileRef = useRef<ProfileOffcanvasHandle>(null)

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap()
      window.showToast('See you next time 👋', 'Logged out successfully.', 'success')
    } catch (err) {
      window.showToast('Error', logoutError || 'Logout failed', 'error')
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Modern Samurai / Blog</Link>

          {user ? (
            <>
              {/* Visible only on md+ screens */}
              <div className="d-none d-md-flex align-items-center">
                <span className="navbar-text" style={{ cursor: 'pointer' }}>
                  <span className="no-select" onClick={() => profileRef.current?.open()}>
                    {fetchProfileLoading? 'LOADING...' : fullName.toUpperCase()}
                  </span> | {' '}
                  {logoutLoading ? (
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
                      LOG OUT
                    </a>
                  )}
                </span>
              </div>

              {/* Hamburger for mobile (visible only on sm screens) */}
              <button
                className="btn btn-outline-dark d-md-none"
                type="button"
                onClick={() => profileRef.current?.open()}
              >
                ☰
              </button>
            </>
          ) : (
            <div className="d-flex">
              <span className="navbar-text">
                <Link className="text-decoration-none" to="/login">LOG IN</Link>{' '}
                |{' '}
                <Link className="text-decoration-none" to="/register">REGISTER</Link>
              </span>
            </div>
          )}
        </div>
      </nav>

      <UserProfile ref={profileRef} />
    </>
  )
}
