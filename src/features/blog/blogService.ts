import { supabase } from '../../lib/supabase'

export interface Article {
  id: string;
  title: string;
  content: string;
  images: string[];
  created_at: string;
}

export interface FetchArticlesResponse {
  data: Article[];
  total: number;
}
// const { data: session } = await supabase.auth.getSession()
// console.log('SESSION UID:', session?.session?.user?.id)

export const fetchArticles = async (
  limit: number = 5,
  page: number = 1,
  search: string | null = null,
  only_mine = false
): Promise<FetchArticlesResponse> => {
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc('get_articles', {
    p_limit: limit,
    p_offset: offset,
    p_search: search,
    p_only_mine: only_mine
  })
  // console.log('only_mine:', only_mine, typeof only_mine)
  // console.log('RPC raw data', data)
  // console.log('RPC error', error)
  if (error) {
    throw error;
  }

  return {
    data: Array.isArray(data?.data) ? data.data : [],
    total: typeof data?.total === 'number' ? data.total : 0,
  };
}


// export const fetchArticles = async (
//   search: string | null = null,
//   limit: number = 5,
//   page: number = 1
// ): Promise<FetchArticlesResponse> => {
//   const params = new URLSearchParams()

//   if (search) params.append('search', search)
//   params.append('limit', limit.toString())
//   params.append('page', page.toString())

//   const FUNCTION_URL =
//     'https://smbwpkseveluqyqillgq.supabase.co/functions/v1/get-article'

//   const res = await fetch(`${FUNCTION_URL}?${params.toString()}`)

//   if (!res.ok) {
//     throw new Error(await res.text())
//   }

//   const json = await res.json()

//   return {
//     data: Array.isArray(json.data)
//       ? json.data.map((a: any) => ({
//           ...a,
//           created_at: a.created_at,
//         }))
//       : [],
//     total: typeof json.total === 'number' ? json.total : 0,
//   }
// }

export const createArticle = async (
  title: string,
  content: string,
  files: File[] // uploaded images
): Promise<Article> => {
  const { data: sessionData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!sessionData?.user) throw new Error('User not logged in');

  const userId = sessionData.user.id;

  let uploadedUrls: string[] = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const filePath = `articles/${crypto.randomUUID()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('article_images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('article_images')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }
  }

  // Call the updated RPC with the current user ID
  const { data, error } = await supabase.rpc('insert_article', {
    p_title: title,
    p_content: content,
    p_images: uploadedUrls,
    p_user_id: userId
  });

  if (error) throw error;
  return data[0];
};

export const updateArticle = async (
  articleId: string,
  title: string,
  content: string,
  files: File[],
  removedImages: string[]
) => {
  // new images
  const uploadedUrls: string[] = []

  for (const file of files) {
    const path = `articles/${articleId}/${crypto.randomUUID()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('article_images')
      .upload(path, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('article_images')
      .getPublicUrl(path)

    uploadedUrls.push(data.publicUrl)
  }

  // delete removed images
  if (removedImages.length > 0) {
    const paths = removedImages
      .map(getArticleImagePath)
      .filter((p): p is string => Boolean(p))

      console.log('ON UPDATE - STORAGE PATHS:', paths)
    if (paths.length > 0) {
      await supabase.storage
        .from('article_images')
        .remove(paths)
    }
  }
  
  const { error } = await supabase.rpc('update_article', {
    p_article_id: articleId,
    p_title: title,
    p_content: content,
    p_new_images: uploadedUrls,
    p_removed_images: removedImages,
  })

  if (error) throw error

  return { id: articleId }
}

export const deleteArticle = async (articleId: string, removedImages: string[]) => {

  if (removedImages.length > 0) {
    const paths = removedImages
      .map(getArticleImagePath)
      .filter((p): p is string => Boolean(p))

    console.log('ON DELETE - STORAGE PATHS:', paths)
    if (paths.length > 0) {
      await supabase.storage
        .from('article_images')
        .remove(paths)
    }
  }
  
  const { error } = await supabase.rpc('delete_article', {
    p_article_id: articleId,
  })
  if (error) throw error
  return articleId
}


//helper for deletion
const getArticleImagePath = (url: string) => {
  const marker = '/article_images/'
  const idx = url.indexOf(marker)
  return idx !== -1 ? url.slice(idx + marker.length) : null
}