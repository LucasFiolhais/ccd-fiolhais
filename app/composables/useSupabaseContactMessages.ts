interface CreateContactMessageInput {
  fullName: string
  email: string
  message: string
}

export const useSupabaseContactMessages = () => {
  const supabase = useSupabaseClient()

  const createContactMessage = async (input: CreateContactMessageInput) => {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        full_name: input.fullName,
        email: input.email,
        message: input.message
      })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      error: null
    }
  }

  return {
    createContactMessage
  }
}