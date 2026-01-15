// src/features/blog/blogSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchArticles } from './blogService'

interface BlogContentState {
  articles: any[]        // array ONLY
  total: number
  contentLoading: boolean
  blogError: string | null
}

const initialState: BlogContentState = {
  articles: [],
  total: 0,
  contentLoading: false,
  blogError: null,
}

export const getArticles = createAsyncThunk(
  'blog/getArticles',
  async ({ search, limit, page }: { search?: string | null; limit?: number; page?: number }) => {
    return await fetchArticles(search || null, limit || 10, page || 1)
  }
)

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getArticles.pending, (state) => {
        state.contentLoading = true
        state.blogError = null
      })
      .addCase(getArticles.fulfilled, (state, action) => {
        state.contentLoading = false
        state.articles = action.payload.data   // array
        state.total = action.payload.total
      })
      .addCase(getArticles.rejected, (state, action) => {
        state.contentLoading = false
        state.blogError = action.error.message || 'Failed to fetch articles'
      })
  },
})

export default blogSlice.reducer
