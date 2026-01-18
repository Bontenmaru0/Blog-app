import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createProfileThunk, fetchProfileThunk } from '../features/profiles/profilesSlice'
import { logoutThunk } from '../features/auth/authSlice'

export default function UserProfile() {
  const { createProfileLoading, createProfileError } = useAppSelector((state) => state.profiles)
  const { user } = useAppSelector((state) => state.auth)
  const id = user?.id

  const [ full_name, setFullName] = useState('')
  const [ bio, setBio] = useState('')

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // ✅ On mount, fetch profile to prevent "glitch"
  useEffect(() => {
    if (!user) return

    const checkProfile = async () => {
      try {
        const profileResult = await dispatch(fetchProfileThunk()).unwrap()
        if (profileResult) {
          navigate('/', { replace: true }) // already has profile → redirect
        }
      } catch (err) {
        // profile doesn't exist yet → stay on create profile page
      }
    }

    checkProfile()
  }, [user, dispatch, navigate])

  const submitUserProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await dispatch(createProfileThunk({ id, full_name, bio })).unwrap()
      window.showToast('Profile created!', 'You can start blogging now.', 'success')
      navigate('/', { replace: true }) // redirect after successful creation
    } catch (err) {
      // ❌ error → already handled by slice
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap()
      window.showToast('See you next time 👋', 'Logged out successfully.', 'success')
      navigate('/MainPage', { replace: true })
    } catch (err) {
      window.showToast('Error', 'Logout failed', 'error')
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <form
              onSubmit={submitUserProfile}
              className="p-4 border border-dark"
              style={{ backgroundColor: '#fff' }}
            >
              <h2 className="text-center mb-1 fw-normal">Create Your Profile</h2>
              <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                Create your profile to start blogging.
              </p>

              {createProfileError && (
                <div className="text-center text-dark mb-3" style={{ fontSize: '0.85rem' }}>
                  {createProfileError}
                </div>
              )}

              <div className="mb-3">
                <input
                  required
                  type="text"
                  className="form-control border-dark rounded-0"
                  placeholder="Profile Name"
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={createProfileLoading}
                />
              </div>
              <div className="mb-3">
                <textarea
                  required
                  className="form-control border-dark rounded-0 bio-textarea"
                  placeholder="Your bio, your rules..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={createProfileLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 mt-2"
                disabled={createProfileLoading}
              >
                {createProfileLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>

              <div className="text-center mt-4" style={{ fontSize: '0.85rem' }}>
                <Link to="/register" className="text-dark text-decoration-none">
                  Create account
                </Link>
                <span className="mx-2 text-muted">|</span>
                <Link
                  to="/MainPage"
                  className="text-dark text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault()
                    handleLogout()
                  }}
                >
                  Back to Blog
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
