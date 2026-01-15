// src/features/blog/blogService.ts
import { supabase } from '../../lib/supabase'

export interface Article {
  id: string
  title: string
  content: string
  created_at: string
}

export interface FetchArticlesResponse {
  data: Article[]
  total: number
}

export const fetchArticles = async (
  search: string | null = null,
  limit: number = 5,
  page: number = 1
): Promise<FetchArticlesResponse> => {
  const params = new URLSearchParams()

  if (search) params.append('search', search)
  params.append('limit', limit.toString())
  params.append('page', page.toString())

  const FUNCTION_URL =
    'https://smbwpkseveluqyqillgq.supabase.co/functions/v1/get-article'

  const res = await fetch(`${FUNCTION_URL}?${params.toString()}`)

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const json = await res.json()

  return {
    data: Array.isArray(json.data)
      ? json.data.map((a: any) => ({
          ...a,
          created_at: a.created_at,
        }))
      : [],
    total: typeof json.total === 'number' ? json.total : 0,
  }
}

export const createArticle = async (title: string, content: string) => {
  const { data, error } = await supabase.rpc('create_article', {
    p_title: title,
    p_content: content,
  })
  if (error) throw error
  return data
}

export const deleteArticle = async (articleId: string) => {
  const { error } = await supabase.rpc('delete_article', {
    p_article_id: articleId,
  })
  if (error) throw error
  return articleId
}
