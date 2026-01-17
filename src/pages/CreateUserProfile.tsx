// import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import { useAppDispatch, useAppSelector } from '../app/hooks'
// import { loginThunk } from '../features/auth/authSlice'
import { useAppDispatch } from '../app/hooks'
import { logoutThunk } from '../features/auth/authSlice'



export default function UserProfile() {
//   const { logginLoading, loginError } = useAppSelector((state) => state.auth)

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const dispatch = useAppDispatch()
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     try {
//         await dispatch(loginThunk({ email, password })).unwrap()

//       window.showToast('Welcome back', 'Login successfully!', 'success')
//     } catch (err) {
//         // ❌ error → do nothing here (UI already shows loginError)
//     }
//   }
const dispatch = useAppDispatch()
const navigate = useNavigate()
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
            //   onSubmit={handleSubmit}
              className="p-4 border border-dark"
              style={{ backgroundColor: '#fff' }}
            >
              {/* Title */}
              <h2 className="text-center mb-1 fw-normal">Modern Samurai</h2>
              <p
                className="text-center text-muted mb-4"
                style={{ fontSize: '0.9rem' }}
              >
                Create your profile to start blogging.
              </p>

              {/* Error */}
              {/* {loginError && ( */}
                <div
                  className="text-center text-dark mb-3"
                  style={{ fontSize: '0.85rem' }}
                >
                  {/* {loginError} */}
                </div>
              {/* )} */}

              {/* Email */}
              <div className="mb-3">
                <input
                  required
                  type="text"
                  className="form-control border-dark rounded-0"
                  placeholder="Profile Name"
                //   value={email}
                //   onChange={(e) => setEmail(e.target.value)}
                //   disabled={logginLoading}
                />
              </div>
              <div className="mb-3">
                <textarea
                  required
                  className="form-control border-dark rounded-0 bio-textarea"
                  placeholder="Your bio, your rules..."
                  rows={3}
                //   value={email}
                //   onChange={(e) => setEmail(e.target.value)}
                //   disabled={logginLoading}
                />
              </div>
              {/* Button */}
              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 mt-2"
                // disabled={logginLoading}
              >
                {/* {logginLoading ? 'Entering...' : 'Enter'} */}
                Create Profile
              </button>

              {/* Links */}
              <div
                className="text-center mt-4"
                style={{ fontSize: '0.85rem' }}
              >
                <Link to="/register" className="text-dark text-decoration-none">
                  Create account
                </Link>
                <span className="mx-2 text-muted">|</span>
                <Link to="/MainPage" 
                      className="text-dark text-decoration-none"  
                      onClick={(e) => {
                        e.preventDefault()
                        handleLogout()
                      }}>
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
