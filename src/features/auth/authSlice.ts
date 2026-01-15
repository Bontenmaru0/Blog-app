import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {  getSession, getUserInfo, registerWithProfile, loginUser, logoutUser } from './authService'

interface AuthState {
  user: any | null
  loading: boolean
  checkingSessionLoading: boolean
  userInfoLoading: boolean
  registerLoading: boolean
  logginLoading: boolean
  logoutLoading: boolean
  sessionError: string | null
  loginError: string | null
  registerError: string | null
  logoutError: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  checkingSessionLoading: false,
  userInfoLoading: false,
  registerLoading: false,
  logginLoading: false,
  logoutLoading: false,
  sessionError: null,
  loginError: null,
  registerError: null,
  logoutError: null
}

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async () => {
    return await getSession()
  }
)

export const user = createAsyncThunk(
  'auth/user',
  async () => {
    return await getUserInfo()
  }
)

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //checkSession cases
      .addCase(checkSession.pending, (state) => {
        state.checkingSessionLoading = true
        state.sessionError = null
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.session?.user || null
        state.checkingSessionLoading = false
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.checkingSessionLoading = false
        state.sessionError = action.error.message || 'Session check failed'
      })
      // user info cases
      .addCase(user.pending, (state) => {
        state.userInfoLoading = true
        state.sessionError = null
      })
      .addCase(user.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.userInfoLoading = false
      })
      .addCase(user.rejected, (state, action) => {
        state.userInfoLoading = false
        state.sessionError = action.error.message || 'User info fetch failed'
      })
      //register cases
      .addCase(register.pending, (state) => {
        state.registerLoading = true
        state.registerError = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
        state.registerLoading = false
        state.registerError = null
      })
      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false
        state.registerError = action.error.message || 'Registration failed'
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.logginLoading = true
        state.loginError = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.logginLoading = false
        state.loginError = null
      })
      .addCase(login.rejected, (state, action) => {
        state.logginLoading = false
        state.loginError = action.error.message || 'Login failed'
      })
      //logout cases
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true
        state.logoutError = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.logoutLoading = false
      })
      .addCase(logout.rejected, (state) => {
        state.logoutLoading = false
        state.logoutError = 'Logout failed'
      })
    },
})

export default authSlice.reducer
