import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { registerThunk } from '../features/auth/authSlice'
import { fetchProfileThunk } from '../features/profiles/profilesSlice'

export default function Register() {
  const { registerLoading, registerError } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')

  const passwordsMatch =
    password.length === 0 ||
    verifyPassword.length === 0 ||
    password === verifyPassword

  const showPasswordError =
    password.length > 0 &&
    verifyPassword.length > 0 &&
    password !== verifyPassword

    
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return

    try {
        await dispatch(registerThunk({ email, password })).unwrap()

        if (registerLoading){
          return
        }

        const profileResult = await dispatch(fetchProfileThunk()).unwrap();
        if (!profileResult || profileResult.length === 0) {
          navigate('/profile', { replace: true }); // first-time user
        } else {
          navigate('/', { replace: true }); // returning user
        }
        window.showToast('Welcome aboard 👋', 'Registered successfully, we are logged you in.', 'success')
    } catch (err) {
        // ❌ error → do nothing here (UI already shows registerError)
    }
  } 

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <form
              onSubmit={handleSubmit}
              className="p-4 border border-dark"
              style={{ backgroundColor: '#fff' }}
            >
              {/* Title */}
              <h2 className="text-center mb-1 fw-normal">Modern Samurai</h2>
              <p
                className="text-center text-muted mb-4"
                style={{ fontSize: '0.9rem' }}
              >
                Begin your discipline
              </p>

              {/* Errors */}
              {showPasswordError && (
                <div
                  className="text-center text-dark mb-3"
                  style={{ fontSize: '0.85rem' }}
                >
                  Passwords do not match
                </div>
              )}

              {registerError && (
                <div
                  className="text-center text-dark mb-3"
                  style={{ fontSize: '0.85rem' }}
                >
                  {registerError}
                </div>
              )}

              {/* Email */}
              <div className="mb-3">
                <input
                  required
                  type="email"
                  className="form-control border-dark rounded-0"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerLoading}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <input
                  required
                  type="password"
                  className="form-control border-dark rounded-0"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={registerLoading}
                />
              </div>

              {/* Verify Password */}
              <div className="mb-3">
                <input
                  required
                  type="password"
                  className="form-control border-dark rounded-0"
                  placeholder="Verify Password"
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  disabled={registerLoading}
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 mt-2"
                disabled={registerLoading || !passwordsMatch}
              >
                {registerLoading ? 'Registering...' : 'Begin'}
              </button>

              {/* Links */}
              <div
                className="text-center mt-4"
                style={{ fontSize: '0.85rem' }}
              >
                <Link to="/login" className="text-dark text-decoration-none">
                  Login
                </Link>
                <span className="mx-2 text-muted">|</span>
                <Link to="/MainPage" className="text-dark text-decoration-none">
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
