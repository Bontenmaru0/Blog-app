import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.ts'
import { register } from '../features/auth/authSlice'

export default function Register() {
  const dispatch = useAppDispatch()
  const { loading, registerError } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(register({ email, password }))
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <h2 className="text-center mb-4">Register</h2>

            {registerError && <div className="alert alert-danger">{registerError}</div>}

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
                required
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <p className="text-center mt-3">Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link> | <Link to="/MainPage" className="text-decoration-none">Back to Main Page</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
