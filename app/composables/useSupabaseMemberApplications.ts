interface CreateMemberApplicationInput {
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  notes?: string
  wantsNotifications: boolean
  acceptsDataTreatment: boolean
}

export const useSupabaseMemberApplications = () => {
  const supabase = useSupabaseClient()

  const createMemberApplication = async (input: CreateMemberApplicationInput) => {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('member_applications')
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        birth_date: input.birthDate || null,
        notes: input.notes || null,
        wants_notifications: input.wantsNotifications,
        accepts_data_treatment: input.acceptsDataTreatment
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
    createMemberApplication
  }
}