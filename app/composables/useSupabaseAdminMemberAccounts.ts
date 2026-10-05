interface InviteMemberAccountResponse {
  success: boolean
  alreadyLinked: boolean
  message: string
}

export const useSupabaseAdminMemberAccounts = () => {
  const inviteMemberAccount = async (
    memberId: string
  ) => {
    const supabase =
      useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase ainda não está configurado.'
      }
    }

    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase.auth.getSession()

    if (
      sessionError ||
      !sessionData.session
    ) {
      return {
        success: false,
        error:
          'A sessão de administração expirou.'
      }
    }

    try {
      const result =
        await $fetch<InviteMemberAccountResponse>(
          '/api/admin/members/invite',
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`
            },

            body: {
              memberId
            }
          }
        )

      return {
        success: true,
        error: null,
        alreadyLinked:
          result.alreadyLinked,
        message:
          result.message
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.data?.statusMessage ||
          error?.statusMessage ||
          error?.message ||
          'Não foi possível criar a conta.'
      }
    }
  }

  return {
    inviteMemberAccount
  }
}