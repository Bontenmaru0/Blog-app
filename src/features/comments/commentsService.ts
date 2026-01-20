import { supabase } from "../../lib/supabase";

export interface Comment {
  id: string;
  article_id: string;
  image_id: string | null;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string;

  // 👇 ADD THESE
  depth: number;
  reply_count: number;
  total_article_comments: number;
  total_image_comments: number;
}

export interface FetchCommentsResponse {
  data: Comment[];
  total: number;
}

export const fetchComments = async (
  articleId: string,
  imageId: string | null
): Promise<Comment[]> => {
  const { data, error } = await supabase.rpc("get_comments", {
    p_article_id: articleId,
    p_image_id: imageId,
  });

  if (error) throw error;
  return data ?? [];
};

export const createComment = async (
  articleId: string,
  imageId: string | null,
  parentId: string | null,
  content: string
): Promise<Comment> => {
  const { data, error } = await supabase.rpc(
    "insert_comment",
    {
      p_article_id: articleId,
      p_content: content,
      p_image_id: imageId,
      p_parent_id: parentId
    }
  );

  if (error) throw error;
  return data;
};


export const updateComment = async (
  commentId: string,
  content: string,
  stats: string
): Promise<Comment> => {
  const { data, error } = await supabase.rpc(
    "update_comment",
    {
      p_comment_id: commentId,
      p_content: content,
      p_status: stats
    }
  );

  if (error) throw error;
  return data;
};


export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase.rpc(
    "delete_comment",
    { p_comment_id: commentId }
  );

  if (error) throw error;
};

