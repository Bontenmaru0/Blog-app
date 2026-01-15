// src/features/blog/blogService.ts

export interface Article {
  id: string
  title: string
  content: string
  created_at: Date
  // add other fields if you have them
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

  if (search) params.append("search", search)
  params.append("limit", limit.toString())
  params.append("page", page.toString())

  const FUNCTION_URL = "https://smbwpkseveluqyqillgq.supabase.co/functions/v1/get-article"

  const res = await fetch(`${FUNCTION_URL}?${params.toString()}`)

  if (!res.ok) {
    const text = await res.text()
    console.error("Edge function error:", text)
    throw new Error(`Failed to fetch articles: ${text}`)
  }

  const json = await res.json()

  const articlesWithDate = Array.isArray(json.data)
    ? json.data.map((article: Article) => ({
        ...article,
        created_at: new Date(article.created_at),
      }))
    : []

  // runtime safety (extra protection)
  return {
    data: articlesWithDate,
    total: typeof json.total === "number" ? json.total : 0,
  }
}
