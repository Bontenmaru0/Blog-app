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

export const checkSessionThunk = createAsyncThunk(
  'auth/checkSession',
  async () => {
    return await getSession()
  }
)

export const userThunk = createAsyncThunk(
  'auth/user',
  async () => {
    return await getUserInfo()
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    return await registerWithProfile(email, password)
  }
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    return await loginUser(email, password)
  }
)

export const logoutThunk = createAsyncThunk(
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
      .addCase(checkSessionThunk.pending, (state) => {
        state.checkingSessionLoading = true
        state.sessionError = null
      })
      .addCase(checkSessionThunk.fulfilled, (state, action) => {
        state.user = action.payload.session?.user || null
        state.checkingSessionLoading = false
      })
      .addCase(checkSessionThunk.rejected, (state, action) => {
        state.checkingSessionLoading = false
        state.sessionError = action.error.message || 'Session check failed'
      })
      // user info cases
      .addCase(userThunk.pending, (state) => {
        state.userInfoLoading = true
        state.sessionError = null
      })
      .addCase(userThunk.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.userInfoLoading = false
      })
      .addCase(userThunk.rejected, (state, action) => {
        state.userInfoLoading = false
        state.sessionError = action.error.message || 'User info fetch failed'
      })
      //register cases
      .addCase(registerThunk.pending, (state) => {
        state.registerLoading = true
        state.registerError = null
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.registerLoading = false
        state.registerError = null
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerLoading = false
        state.registerError = action.error.message || 'Registration failed'
      })
      // Login cases
      .addCase(loginThunk.pending, (state) => {
        state.logginLoading = true
        state.loginError = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.logginLoading = false
        state.loginError = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.logginLoading = false
        state.loginError = action.error.message || 'Login failed'
      })
      //logout cases
      .addCase(logoutThunk.pending, (state) => {
        state.logoutLoading = true
        state.logoutError = null
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.logoutLoading = false
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.logoutLoading = false
        state.logoutError = 'Logout failed'
      })
    },
})

export default authSlice.reducer
