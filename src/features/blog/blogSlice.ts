// src/features/blog/blogSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchArticles, createArticle, deleteArticle, } from './blogService'

interface BlogContentState {
  articles: any[]
  total: number
  contentLoading: boolean
  blogError: string | null

  insertArticleLoading: boolean
  insertArticleError: string | null

  deleteArticleLoadingById: Record<string, boolean>
  deleteArticleError: string | null
}

const initialState: BlogContentState = {
  articles: [],
  total: 0,
  contentLoading: false,
  blogError: null,

  insertArticleLoading: false,
  insertArticleError: null,

  deleteArticleLoadingById: {},
  deleteArticleError: null,
}

export const fetchArticlesThunk = createAsyncThunk(
  'blog/fetchArticles',
  async ({
    search,
    limit,
    page,
  }: {
    search?: string | null
    limit?: number
    page?: number
  }) => {
    return fetchArticles(search || null, limit || 5, page || 1)
  }
)

export const createArticleThunk = createAsyncThunk(
  'blog/createArticle',
  async ({ title, content }: { title: string; content: string }) => {
    return createArticle(title, content)
  }
)

export const deleteArticleThunk = createAsyncThunk(
  'blog/deleteArticle',
  async (articleId: string) => {
    return deleteArticle(articleId)
  }
)

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchArticlesThunk.pending, (state) => {
        state.contentLoading = true
      })
      .addCase(fetchArticlesThunk.fulfilled, (state, action) => {
        state.contentLoading = false
        state.articles = action.payload.data
        state.total = action.payload.total
      })
      .addCase(fetchArticlesThunk.rejected, (state, action) => {
        state.contentLoading = false
        state.blogError = action.error.message || 'Fetch failed'
      })

      // CREATE
      .addCase(createArticleThunk.pending, (state) => {
        state.insertArticleLoading = true
      })
      .addCase(createArticleThunk.fulfilled, (state) => {
        state.insertArticleLoading = false
      })
      .addCase(createArticleThunk.rejected, (state, action) => {
        state.insertArticleLoading = false
        state.insertArticleError =
          action.error.message || 'Create failed'
      })

      // DELETE (PER ARTICLE)
      .addCase(deleteArticleThunk.pending, (state, action) => {
        state.deleteArticleLoadingById[action.meta.arg] = true
      })
      .addCase(deleteArticleThunk.fulfilled, (state, action) => {
        delete state.deleteArticleLoadingById[action.meta.arg]
        state.articles = state.articles.filter(
          (a) => a.id !== action.meta.arg
        )
      })
      .addCase(deleteArticleThunk.rejected, (state, action) => {
        delete state.deleteArticleLoadingById[action.meta.arg]
        state.deleteArticleError =
          action.error.message || 'Delete failed'
      })
  },
})

export default blogSlice.reducer
