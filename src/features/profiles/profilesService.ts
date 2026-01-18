import { supabase } from '../../lib/supabase' 

export const fetchProfile = async () => {
  const {data, error} = await supabase.rpc('get_user_profile');
  if (error) {
    throw error;
  }
  return data;
}

export const createProfile = async (id: string, full_name: string, bio: string) => {
  const { data, error } = await supabase.rpc('insert_profile', { p_id: id, p_full_name: full_name, p_bio: bio });
  if (error) {
    throw error;
  }
  return data;
}