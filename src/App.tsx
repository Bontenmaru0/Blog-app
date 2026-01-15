import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './app/store'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { checkSessionThunk } from './features/auth/authSlice'
import Login from './pages/Login'
import Register from './pages/Register'
import MainPage from './pages/MainPage'

function AppContent() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkSessionThunk())
  }, [dispatch])
  


  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
