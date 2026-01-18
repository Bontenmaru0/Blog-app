import './index.css';
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './app/store'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { checkSessionThunk } from './features/auth/authSlice'
import Login from './pages/Login'
import Register from './pages/Register'
import MainPage from './pages/MainPage'
import UserProfile from './pages/CreateUserProfile';
import { fetchProfileThunk } from './features/profiles/profilesSlice';

function AppContent() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  
  useEffect(() => {
    dispatch(checkSessionThunk());
  }, [dispatch])

  useEffect(() => {
    if (user?.id) dispatch(fetchProfileThunk());
  }, [dispatch, user?.id])
  
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App
