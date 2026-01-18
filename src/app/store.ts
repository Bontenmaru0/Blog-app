import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import blogReducer from '../features/blog/blogSlice.ts'
import profilesReducer from '../features/profiles/profilesSlice.ts'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    profiles: profilesReducer
  },
})

// ✅ Export types for hooks.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;