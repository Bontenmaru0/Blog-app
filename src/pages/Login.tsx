import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.ts'
import { login } from '../features/auth/authSlice'

export default function Login() {
  const dispatch = useAppDispatch()
  const { loading, loginError } = useAppSelector((state) => state.auth)  // Access auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <h2 className="text-center mb-4">Login</h2>

            {/* Display error message if login fails */}
            {loginError && <div className="alert alert-danger">{loginError}</div>}

            <div className="mb-3">
              <input
                required
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center mt-3">Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link> | <Link to="/MainPage" className="text-decoration-none">Back to Main Page</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
