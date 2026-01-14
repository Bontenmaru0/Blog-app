import { supabase } from '../../lib/supabase' 

export const upsertProfile = async (id: string, full_name: string, nickname: string) => {
  const { data, error } = await supabase.rpc('upsert_profile', { p_id: id, p_full_name: full_name, p_nickname: nickname })
  if (error) {
    throw error
  }
  return data
}