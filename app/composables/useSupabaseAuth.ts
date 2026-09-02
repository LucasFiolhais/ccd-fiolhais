import type { User } from '@supabase/supabase-js'

type ProfileRole = 'member' | 'direction' | 'admin'

interface SupabaseProfile {
  id: string
  full_name: string
  role: ProfileRole
}

export const useSupabaseAuth = () => {
  const user = useState<User | null>('supabase-auth-user', () => null)
  const profile = useState<SupabaseProfile | null>('supabase-auth-profile', () => null)
  const authLoaded = useState<boolean>('supabase-auth-loaded', () => false)

  const isLoggedIn = computed(() => {
    return Boolean(user.value)
  })

  const isAdmin = computed(() => {
    return profile.value?.role === 'admin' || profile.value?.role === 'direction'
  })

  const loadUser = async () => {
    if (import.meta.server) {
      return null
    }

    authLoaded.value = false

    const supabase = useSupabaseClient()

    if (!supabase) {
      user.value = null
      profile.value = null
      authLoaded.value = true
      return null
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      user.value = null
      profile.value = null
      authLoaded.value = true
      return null
    }

    user.value = userData.user

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userData.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Erro ao carregar perfil:', profileError.message)
      profile.value = null
      authLoaded.value = true
      return userData.user
    }

    profile.value = profileData as SupabaseProfile | null
    authLoaded.value = true

    return userData.user
  }

  const signOut = async () => {
    if (import.meta.server) {
      return
    }

    const supabase = useSupabaseClient()

    if (supabase) {
      await supabase.auth.signOut()
    }

    user.value = null
    profile.value = null
    authLoaded.value = true
  }

  const signIn = async (email: string, password: string) => {
    if (import.meta.server) {
      return {
        success: false,
        error: 'O login só pode ser feito no browser.'
      }
    }

    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    await loadUser()

    if (!isAdmin.value) {
      await signOut()

      return {
        success: false,
        error: 'Esta conta não tem permissões de administração.'
      }
    }

    return {
      success: true,
      error: null
    }
  }

  return {
    user,
    profile,
    authLoaded,
    isLoggedIn,
    isAdmin,
    loadUser,
    signIn,
    signOut
  }
}