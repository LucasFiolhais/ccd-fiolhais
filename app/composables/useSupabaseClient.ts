import { createClient } from '@supabase/supabase-js'

export const useSupabaseClient = () => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase ainda não está configurado. Verifica o ficheiro .env.')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}