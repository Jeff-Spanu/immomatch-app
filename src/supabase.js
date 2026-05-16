import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cfeoamiobreykwiantyh.supabase.co"

const supabaseKey = "sb_publishable_P6rvbVp4tfldP07b3ABogw_mTQReJ_V"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)