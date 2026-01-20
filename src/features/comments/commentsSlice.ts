import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
} from "./commentsService";

interface CommentState {
  comments: Comment[];
  total: number;

  contentLoading: boolean;
  contentError: string | null;

  insertCommentLoading: boolean;
  insertCommentError: string | null;

  updateCommentLoading: boolean;
  updateCommentError: string | null;

  deleteCommentLoading: boolean;
  deleteCommentError: string | null;
}

const initialState: CommentState = {
  comments: [],
  total: 0,

  contentLoading: false,
  contentError: null,

  insertCommentLoading: false,
  insertCommentError: null,

  updateCommentLoading: false,
  updateCommentError: null,

  deleteCommentLoading: false,
  deleteCommentError: null,
};

export const fetchCommentsThunk = createAsyncThunk<
  Comment[],
  { articleId: string; imageId: string | null }
>("comments/fetchComments", async ({ articleId, imageId }) => {
  return fetchComments(articleId, imageId);
});

export const createCommentThunk = createAsyncThunk(
  "comments/insertComment",
  async ({
    articleId,
    imageId,
    parentId,
    content,
  }: {
    articleId: string;
    imageId: string | null;
    parentId: string | null;
    content: string;
  }) => {
    return createComment(articleId, imageId, parentId, content);
  }
);

export const updateCommentThunk = createAsyncThunk(
  "comments/updateComment",
  async ({
    commentId,
    content,
    stats,
  }: {
    commentId: string;
    content: string;
    stats: string;
  }) => {
    return updateComment(commentId, content, stats);
  }
);

export const deleteCommentThunk = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId }: { commentId: string }) => {
    await deleteComment(commentId);
    return commentId;
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchCommentsThunk.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
        state.contentLoading = false;
        state.comments = action.payload;

        // derive totals safely
        state.total =
          action.payload.length > 0
            ? action.payload[0].total_article_comments
            : 0;
      })
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError =
          action.error.message ??
          "Failed to fetch comments. Something went wrong.";
      })

      // CREATE
      .addCase(createCommentThunk.pending, (state) => {
        state.insertCommentLoading = true;
        state.insertCommentError = null;
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        state.insertCommentLoading = false;
        state.comments.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.insertCommentLoading = false;
        state.insertCommentError =
          action.error.message ??
          "Failed to add comment. Something went wrong.";
      })

      // UPDATE
      .addCase(updateCommentThunk.pending, (state) => {
        state.updateCommentLoading = true;
        state.updateCommentError = null;
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        state.updateCommentLoading = false;
        const index = state.comments.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateCommentThunk.rejected, (state, action) => {
        state.updateCommentLoading = false;
        state.updateCommentError =
          action.error.message ??
          "Failed to update comment. Something went wrong.";
      })

      // DELETE
      .addCase(deleteCommentThunk.pending, (state) => {
        state.deleteCommentLoading = true;
        state.deleteCommentError = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
        state.comments = state.comments.filter(
          (c) => c.id !== action.payload
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.deleteCommentLoading = false;
        state.deleteCommentError =
          action.error.message ??
          "Failed to delete comment. Something went wrong.";
      });
  },
});

export default commentsSlice.reducer;
