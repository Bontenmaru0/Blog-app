import { supabase } from "../../lib/supabase";

interface CommentImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
}

export interface Comment {
  id: string;

  article_id: string;
  image_id: string | null;

  user_id: string;
  parent_id: string | null;

  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  depth: number;

  reply_count: number;
  total_article_comments: number;
  total_image_comments: number;

  image: CommentImage[] | null;
}

export interface FetchCommentsResponse {
  data: Comment[];
  total: number;
}

export const fetchArticleComments = async (
  articleId: string
): Promise<Comment[]> => {
  const { data, error } = await supabase.rpc("get_article_comments", {
    p_article_id: articleId,
  });

  if (error) throw error;
  // console.log(data)
  return data ?? [];
};

export const fetchImagesComments = async (
  articleId: string,
  imageId: string
): Promise<Comment[]> => {
  const { data, error } = await supabase.rpc("get_images_comments", {
    p_article_id: articleId,
    p_image_id: imageId
  });

  if (error) throw error;
  // console.log("fetchImagesComments data:", data);
  return (data ?? []).map((comment: Comment) => ({
    ...comment,
    image: comment.image?.[0] ?? null
  }));
};

export const createComment = async (
  articleId: string,
  content: string | null,
  imageId: string | null,
  parentId: string | null,
  comment_image: File | null
): Promise<Comment> => {

  const filePath = `photos/${Date.now()}_${comment_image?.name}`;

  let uploadedUrls: string | null = null;

  if (comment_image){
    const { data, error } = await supabase.storage
        .from('comment_images')
        .upload(filePath, comment_image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('comment_images')
        .getPublicUrl(data.path);

      uploadedUrls = urlData.publicUrl;
  }

  const { data, error } = await supabase.rpc(
    "insert_comment",
    {
      p_article_id: articleId,
      p_content: content,
      p_image_id: imageId,
      p_parent_id: parentId,
      p_comment_image: uploadedUrls
    }
  );
  console.log("Comments service: ", comment_image)
  // console.log("Comments service: ", data)

  if (error) throw error;
  return data;
};


export const updateComment = async (
  commentId: string,
  content: string,
  stats: string,
  newImage: File | null,
  removedImage: string | null,
  articleId: string | null
): Promise<Comment> => {

  let uploadedUrl: string | null = null;

  // remove old image from storage
  if (removedImage) {
    const filePath = removedImage.split('/comment_images/')[1];

    if (filePath) {
      const { error } = await supabase.storage
        .from('comment_images')
        .remove([filePath]);

      if (error) throw error;
    }
  }

  // upload new image
  if (newImage) {
    const filePath = `photos/${Date.now()}_${newImage.name}`;

    const { data, error } = await supabase.storage
      .from('comment_images')
      .upload(filePath, newImage);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('comment_images')
      .getPublicUrl(data.path);

    uploadedUrl = urlData.publicUrl;
  }

  // update DB
  const { data, error } = await supabase.rpc(
    "update_comment",
    {
      p_comment_id: commentId,
      p_content: content,
      p_status: stats,
      p_new_image: uploadedUrl,   // ✅ URL or null
      p_removed_image: removedImage,
      p_article_id: articleId
    }
  );

  if (error) throw error;
  return data;
};


export const deleteComment = async (commentId: string, removedImage: string): Promise<void> => {

  if (removedImage) {
    const filePath = removedImage.split('/comment_images/')[1];

    if (filePath) {
      const { error } = await supabase.storage
        .from('comment_images')
        .remove([filePath]);

      if (error) throw error;
    }
  }

  const { error } = await supabase.rpc(
    "delete_comment",
    { p_comment_id: commentId }
  );

  if (error) throw error;
};

