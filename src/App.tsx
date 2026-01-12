import { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Provider store={store}>
      {isLogin ? <Login /> : <Register />}
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </Provider>
  )
}

export default App
