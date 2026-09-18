export interface CreatePublicEventRegistrationInput {
  eventId: string
  fullName: string
  email: string
  phone: string
  memberNumber?: string
  seats: number
  notes?: string
}

export const useSupabaseEventRegistrations = () => {
  const createEventRegistration = async (
    input: CreatePublicEventRegistrationInput
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    if (input.seats < 1) {
      return {
        success: false,
        error: 'O número de lugares deve ser superior a zero.'
      }
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: input.eventId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        member_number: input.memberNumber || null,
        seats: input.seats,
        notes: input.notes || null,
        status: 'pending',
        payment_status: 'pending'
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
    createEventRegistration
  }
}