import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchArticles, createArticle, updateArticle, deleteArticle, } from './blogService'

interface BlogContentState {
  articles: any[];
  total: number;
  contentLoading: boolean;
  blogError: string | null;

  insertArticleLoading: boolean;
  insertArticleError: string | null;

  updateArticleLoadingById: Record<string, boolean>;
  updateArticleError: string | null;

  deleteArticleLoadingById: Record<string, boolean>;
  deleteArticleError: string | null;
}

const initialState: BlogContentState = {
  articles: [],
  total: 0,
  contentLoading: false,
  blogError: null,

  insertArticleLoading: false,
  insertArticleError: null,

  updateArticleLoadingById: {},
  updateArticleError: null,

  deleteArticleLoadingById: {},
  deleteArticleError: null,
}

export const fetchArticlesThunk = createAsyncThunk(
  'blog/fetchArticles',
  async ({
    limit,
    page,
    search,
    only_mine
  }: {
    search?: string | null
    limit?: number
    page?: number
    only_mine?: boolean
  }) => {
    return fetchArticles(limit || 5, page || 1, search || null, only_mine || false);
  }
)

export const createArticleThunk = createAsyncThunk(
  'blog/createArticle',
  async ({ title, content, images }: { title: string; content: string; images : File[]}) => {
    return createArticle(title, content, images)
  }
)

export const updateArticleThunk = createAsyncThunk<
  any,
  {
    id: string
    title: string
    content: string
    files: File[]
    removedImages: string[]
  }
>(
  'blog/updateArticle',
  async ({ id, title, content, files, removedImages }) => {
    return updateArticle(id, title, content, files, removedImages)
  }
)

export const deleteArticleThunk = createAsyncThunk<
  string,
  {
    id: string
    removedImages: string[]
  }
>(
  'blog/deleteArticle',
  async ({ id, removedImages }) => {
    return deleteArticle(id, removedImages)
  }
)

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchArticlesThunk.pending, (state) => {
        state.contentLoading = true;
      })
      .addCase(fetchArticlesThunk.fulfilled, (state, action) => {
        state.contentLoading = false;
        state.articles = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchArticlesThunk.rejected, (state, action) => {
        state.contentLoading = false;
        state.blogError = action.error.message || 'Failed to fetch data. Something went wrong.';
      })

      // create
      .addCase(createArticleThunk.pending, (state) => {
        state.insertArticleLoading = true;
      })
      .addCase(createArticleThunk.fulfilled, (state) => {
        state.insertArticleLoading = false;
      })
      .addCase(createArticleThunk.rejected, (state, action) => {
        state.insertArticleLoading = false;
        state.insertArticleError =
          action.error.message || 'Creation failed. Something went wrong.';
      })

      // update (per article)
      .addCase(updateArticleThunk.pending, (state, action) => {
        state.updateArticleLoadingById[action.meta.arg.id] = true;
      })
      .addCase(updateArticleThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.articles.findIndex(a => a.id === updated.id);

        if (index !== -1) {
          state.articles[index] = updated;
        }

        delete state.updateArticleLoadingById[updated.id];
      })
      .addCase(updateArticleThunk.rejected, (state, action) => {
        delete state.updateArticleLoadingById[action.meta.arg.id];
        state.updateArticleError =
          action.error.message || 'Update failed. Something went wrong.';
      })

      // delete (per article)
      .addCase(deleteArticleThunk.pending, (state, action) => {
        state.deleteArticleLoadingById[action.meta.arg.id] = true;
      })
      .addCase(deleteArticleThunk.fulfilled, (state, action) => {
        const id = action.meta.arg.id;

        delete state.deleteArticleLoadingById[id];
        state.articles = state.articles.filter(a => a.id !== id);
      })
      .addCase(deleteArticleThunk.rejected, (state, action) => {
        delete state.deleteArticleLoadingById[action.meta.arg.id];
        state.deleteArticleError =
          action.error.message || 'Delete failed. Something went wrong.';
      })
  },
})

export default blogSlice.reducer;
