// src/features/blog/blogService.ts
import { supabase } from '../../lib/supabase'

export interface Article {
  id: string;
  title: string;
  content: string;
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

export const createArticle = async (title: string, content: string) => {
  const { data, error } = await supabase.rpc('insert_article', {
    p_title: title,
    p_content: content,
  })
  if (error) throw error
  return data
}

export const updateArticle = async (articleId: string, title: string, content: string) => {
  const { error } = await supabase.rpc('update_article', {
    p_article_id: articleId,
    p_title: title,
    p_content: content
  })
  if (error) throw error
  return articleId
}

export const deleteArticle = async (articleId: string) => {
  const { error } = await supabase.rpc('delete_article', {
    p_article_id: articleId,
  })
  if (error) throw error
  return articleId
}
