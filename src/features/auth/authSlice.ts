import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerWithProfile, loginUser, logoutUser, getSession } from './authService'

interface AuthState {
  user: any | null
  loading: boolean
  sessionError: string | null
  loginError: string | null
  registerError: string | null
  logoutError: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  sessionError: null,
  loginError: null,
  registerError: null,
  logoutError: null
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    return await registerWithProfile(email, password)
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    return await loginUser(email, password)
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await logoutUser()
  }
)

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async () => {
    return await getSession()
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //checkSession cases
      .addCase(checkSession.pending, (state) => {
        state.loading = true
        state.sessionError = null
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.session?.user || null
        state.loading = false
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false
        state.sessionError = action.error.message || 'Session check failed'
      })
      //register cases
      .addCase(register.pending, (state) => {
        state.loading = true
        state.registerError = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
        state.registerError = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.registerError = action.error.message || 'Registration failed'
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true
        state.loginError = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
        state.loginError = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.loginError = action.error.message || 'Login failed'
      })
      //logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.logoutError = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.loading = false
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false
        state.logoutError = 'Logout failed'
      })
    },
})

export default authSlice.reducer
