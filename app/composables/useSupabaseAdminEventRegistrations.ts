export type AdminRegistrationStatus = 'pending' | 'confirmed' | 'cancelled'
export type AdminRegistrationPaymentStatus = 'pending' | 'paid' | 'cancelled'

export interface AdminEventRegistration {
  id: string
  eventId: string
  fullName: string
  email: string
  phone: string
  memberNumber?: string
  seats: number
  notes?: string
  status: AdminRegistrationStatus
  paymentStatus: AdminRegistrationPaymentStatus
  createdAt: string
}

interface SupabaseEventRegistrationRow {
  id: string
  event_id: string
  full_name: string
  email: string
  phone: string
  member_number: string | null
  seats: number
  notes: string | null
  status: AdminRegistrationStatus
  payment_status: AdminRegistrationPaymentStatus
  created_at: string
}

const mapRegistration = (
  registration: SupabaseEventRegistrationRow
): AdminEventRegistration => {
  return {
    id: registration.id,
    eventId: registration.event_id,
    fullName: registration.full_name,
    email: registration.email,
    phone: registration.phone,
    memberNumber: registration.member_number || undefined,
    seats: registration.seats,
    notes: registration.notes || undefined,
    status: registration.status,
    paymentStatus: registration.payment_status,
    createdAt: registration.created_at
  }
}

export const useSupabaseAdminEventRegistrations = () => {
  const getRegistrationsByEventId = async (eventId: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        registrations: []
      }
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
        event_id,
        full_name,
        email,
        phone,
        member_number,
        seats,
        notes,
        status,
        payment_status,
        created_at
      `)
      .eq('event_id', eventId)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        registrations: []
      }
    }

    return {
      success: true,
      error: null,
      registrations: (data || []).map((registration) => {
        return mapRegistration(
          registration as SupabaseEventRegistrationRow
        )
      })
    }
  }

  const updateRegistrationStatus = async (
    registrationId: string,
    status: AdminRegistrationStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('event_registrations')
      .update({
        status
      })
      .eq('id', registrationId)

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

  const updatePaymentStatus = async (
    registrationId: string,
    paymentStatus: AdminRegistrationPaymentStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('event_registrations')
      .update({
        payment_status: paymentStatus
      })
      .eq('id', registrationId)

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
    getRegistrationsByEventId,
    updateRegistrationStatus,
    updatePaymentStatus
  }
}