import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchArticleComments, fetchImagesComments, createComment, updateComment, deleteComment, type Comment, } from "./commentsService";

// payload for create comment
interface CreateCommentPayload {
  articleId: string;
  content: string | null;
  imageId: string | null;
  parentId: string | null;
  comment_image: File | null;
}

// state
interface CommentState {
  // article-level comments keyed by articleId
  articleComments: Record<string, Comment[]>;
  articleTotals: Record<string, number>;

  // image-level comments keyed by imageId
  imageComments: Record<string, Comment[]>;
  imageTotals: Record<string, number>;

  // loading/error states (separate for article & image)
  articleContentLoading: boolean;
  articleContentError: string | null;

  imageContentLoading: boolean;
  imageContentError: string | null;

  insertCommentLoading: boolean;
  insertCommentError: string | null;

  updateCommentLoading: boolean;
  updateCommentError: string | null;

  deleteCommentLoading: boolean;
  deleteCommentError: string | null;
}

const initialState: CommentState = {
  articleComments: {},
  articleTotals: {},
  imageComments: {},
  imageTotals: {},

  articleContentLoading: false,
  articleContentError: null,
  imageContentLoading: false,
  imageContentError: null,

  insertCommentLoading: false,
  insertCommentError: null,
  updateCommentLoading: false,
  updateCommentError: null,
  deleteCommentLoading: false,
  deleteCommentError: null,
};

// helpers
function addCommentToMap(commentsMap: Record<string, Comment[]>, totalsMap: Record<string, number>, comment: Comment) {
  const key = comment.image_id ?? comment.article_id;
  commentsMap[key] = [comment, ...(commentsMap[key] || [])];
  totalsMap[key] = (totalsMap[key] || 0) + 1;
}

function updateCommentInMap(commentsMap: Record<string, Comment[]>, comment: Comment) {
  const key = comment.image_id ?? comment.article_id;
  const idx = commentsMap[key]?.findIndex(c => c.id === comment.id);
  if (idx !== undefined && idx !== -1) {
    commentsMap[key][idx] = comment;
  }
}

function deleteCommentFromMap(commentsMap: Record<string, Comment[]>, totalsMap: Record<string, number>, commentId: string) {
  Object.keys(commentsMap).forEach((key) => {
    commentsMap[key] = commentsMap[key].filter(c => c.id !== commentId);
    totalsMap[key] = Math.max(0, (totalsMap[key] || 0) - 1);
  });
}

// thunks 
export const fetchArticleCommentsThunk = createAsyncThunk<Comment[], { articleId: string }>(
  "comments/fetchArticleComments",
  async ({ articleId }) => fetchArticleComments(articleId)
);

export const fetchImagesCommentsThunk = createAsyncThunk<Comment[], { articleId: string; imageId: string }>(
  "comments/fetchImagesComments",
  async ({ articleId, imageId }) => fetchImagesComments(articleId, imageId)
);

export const createCommentThunk = createAsyncThunk("comments/insertComment", async (payload: CreateCommentPayload) => {
  return createComment(payload.articleId, payload.content, payload.imageId, payload.parentId, payload.comment_image);
});

export const updateCommentThunk = createAsyncThunk(
  "comments/updateComment",
  async (params: { commentId: string; content: string; stats: string, newImage: File | null, removedImage: string | null, articleId: string | null }) => updateComment(params.commentId, params.content, params.stats, params.newImage, params.removedImage, params.articleId)
);

export const deleteCommentThunk = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId, removedImage }: { commentId: string, removedImage: string }) => {
    await deleteComment(commentId, removedImage);
    return commentId;
  }
);

// slice
const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch article comments
    builder
      .addCase(fetchArticleCommentsThunk.pending, (state) => {
        state.articleContentLoading = true;
        state.articleContentError = null;
      })
      .addCase(fetchArticleCommentsThunk.fulfilled, (state, action) => {
        state.articleContentLoading = false;
        const { articleId } = action.meta.arg;
        const payload = action.payload ?? [];
        state.articleComments[articleId] = payload;
        state.articleTotals[articleId] = payload.length > 0 ? payload[0].total_article_comments : 0;
      })
      .addCase(fetchArticleCommentsThunk.rejected, (state, action) => {
        state.articleContentLoading = false;
        state.articleContentError = action.error.message ?? "Failed to fetch article comments.";
      });

    // fetch image comments
    builder
      .addCase(fetchImagesCommentsThunk.pending, (state) => {
        state.imageContentLoading = true;
        state.imageContentError = null;
      })
      .addCase(fetchImagesCommentsThunk.fulfilled, (state, action) => {
        state.imageContentLoading = false;
        const { imageId } = action.meta.arg;
        const payload = action.payload ?? [];
        state.imageComments[imageId] = payload;
        state.imageTotals[imageId] = payload.length > 0 ? payload[0].total_image_comments : 0;
      })
      .addCase(fetchImagesCommentsThunk.rejected, (state, action) => {
        state.imageContentLoading = false;
        state.imageContentError = action.error.message ?? "Failed to fetch image comments.";
      });

    // create
    builder
      .addCase(createCommentThunk.pending, (state) => {
        state.insertCommentLoading = true;
        state.insertCommentError = null;
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        state.insertCommentLoading = false;
        addCommentToMap(
          action.payload.image_id ? state.imageComments : state.articleComments,
          action.payload.image_id ? state.imageTotals : state.articleTotals,
          action.payload
        );
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.insertCommentLoading = false;
        state.insertCommentError = action.error.message ?? "Failed to create comment.";
      });

    // update
    builder
      .addCase(updateCommentThunk.pending, (state) => {
        state.updateCommentLoading = true;
        state.updateCommentError = null;
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        state.updateCommentLoading = false;
        updateCommentInMap(
          action.payload.image_id ? state.imageComments : state.articleComments,
          action.payload
        );
      })
      .addCase(updateCommentThunk.rejected, (state, action) => {
        state.updateCommentLoading = false;
        state.updateCommentError = action.error.message ?? "Failed to update comment.";
      });

    // delete
    builder
      .addCase(deleteCommentThunk.pending, (state) => {
        state.deleteCommentLoading = true;
        state.deleteCommentError = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
        deleteCommentFromMap(state.articleComments, state.articleTotals, action.payload);
        deleteCommentFromMap(state.imageComments, state.imageTotals, action.payload);
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.deleteCommentLoading = false;
        state.deleteCommentError = action.error.message ?? "Failed to delete comment.";
      });
  },
});

export default commentsSlice.reducer;
