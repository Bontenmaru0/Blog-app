import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loginThunk } from '../features/auth/authSlice'
import { fetchProfileThunk } from '../features/profiles/profilesSlice'

export default function Login() {
  const { logginLoading, loginError } = useAppSelector((state) => state.auth)

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(loginThunk({ email, password })).unwrap();

      if (logginLoading){
        return
      }

      const profileResult = await dispatch(fetchProfileThunk()).unwrap();

      if (!profileResult || profileResult.length === 0) {
        navigate('/profile', { replace: true }); // first-time user
      } else {
        navigate('/', { replace: true }); // returning user
      }

      window.showToast('Welcome back', 'Login successfully!', 'success');
    } catch (err) {
        // ❌ error → do nothing here (UI already shows loginError)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <form
              onSubmit={submitLogin}
              className="p-4 border border-dark"
              style={{ backgroundColor: '#fff' }}
            >
              {/* Title */}
              <h2 className="text-center mb-1 fw-normal">Modern Samurai</h2>
              <p
                className="text-center text-muted mb-4"
                style={{ fontSize: '0.9rem' }}
              >
                Enter with focus and intent
              </p>

              {/* Error */}
              {loginError && (
                <div
                  className="text-center text-dark mb-3"
                  style={{ fontSize: '0.85rem' }}
                >
                  {loginError}
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
                  disabled={logginLoading}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control border-dark rounded-0"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={logginLoading}
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 mt-2"
                disabled={logginLoading}
              >
                {logginLoading ? 'Entering...' : 'Enter'}
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
