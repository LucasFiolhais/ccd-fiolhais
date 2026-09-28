import type { User } from '@supabase/supabase-js'

export type MemberAuthStatus = 'pending' | 'active' | 'inactive'

export interface AuthenticatedMember {
  id: string
  number: string
  fullName: string
  email: string
  status: MemberAuthStatus
}

interface SupabaseAuthenticatedMemberRow {
  id: string
  number: string
  full_name: string
  email: string
  status: MemberAuthStatus
}

export const useSupabaseMemberAuth = () => {
  const user = useState<User | null>(
    'supabase-member-auth-user',
    () => null
  )

  const member = useState<AuthenticatedMember | null>(
    'supabase-member-auth-member',
    () => null
  )

  const authLoaded = useState<boolean>(
    'supabase-member-auth-loaded',
    () => false
  )

  const isLoggedIn = computed(() => {
    return Boolean(user.value && member.value)
  })

  const clearMemberSession = () => {
    user.value = null
    member.value = null
  }

  const loadMemberUser = async () => {
    if (import.meta.server) {
      return {
        success: false,
        error: null,
        member: null
      }
    }

    authLoaded.value = false

    const supabase = useSupabaseClient()

    if (!supabase) {
      clearMemberSession()
      authLoaded.value = true

      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        member: null
      }
    }

    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      clearMemberSession()
      authLoaded.value = true

      return {
        success: true,
        error: null,
        member: null
      }
    }

    user.value = userData.user

    const {
      data: memberData,
      error: memberError
    } = await supabase
      .from('members')
      .select(`
        id,
        number,
        full_name,
        email,
        status
      `)
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (memberError) {
      member.value = null
      authLoaded.value = true

      return {
        success: false,
        error: memberError.message,
        member: null
      }
    }

    if (!memberData) {
      member.value = null
      authLoaded.value = true

      return {
        success: true,
        error: null,
        member: null
      }
    }

    const row =
      memberData as SupabaseAuthenticatedMemberRow

    const mappedMember: AuthenticatedMember = {
      id: row.id,
      number: row.number,
      fullName: row.full_name,
      email: row.email,
      status: row.status
    }

    member.value = mappedMember
    authLoaded.value = true

    return {
      success: true,
      error: null,
      member: mappedMember
    }
  }

  const signInMember = async (
    email: string,
    password: string
  ) => {
    if (import.meta.server) {
      return {
        success: false,
        error: 'O login só pode ser efetuado no browser.'
      }
    }

    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const {
      error: signInError
    } = await supabase.auth.signInWithPassword({
      email,
      password
    })

   if (signInError) {
  console.error('Erro no login do sócio:', signInError)

  return {
    success: false,
    error: signInError.message
  }
}

    const memberResult = await loadMemberUser()

    if (!memberResult.success) {
      await supabase.auth.signOut()
      clearMemberSession()

      return {
        success: false,
        error:
          memberResult.error ||
          'Não foi possível carregar a conta de sócio.'
      }
    }

    if (!memberResult.member) {
      await supabase.auth.signOut()
      clearMemberSession()

      return {
        success: false,
        error:
          'Esta conta não está associada a nenhum sócio.'
      }
    }

    return {
      success: true,
      error: null
    }
  }

  const signOutMember = async () => {
    if (import.meta.server) {
      return
    }

    const supabase = useSupabaseClient()

    if (supabase) {
      await supabase.auth.signOut()
    }

    clearMemberSession()
    authLoaded.value = true
  }

  return {
    user,
    member,
    authLoaded,
    isLoggedIn,
    loadMemberUser,
    signInMember,
    signOutMember
  }
}