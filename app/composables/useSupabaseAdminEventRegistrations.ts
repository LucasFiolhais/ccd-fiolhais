export type AdminRegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'

export type AdminRegistrationPaymentStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'

export interface AdminEventRegistration {
  id: string
  eventId: string
  eventSlug?: string
  eventTitle: string
  eventDate?: string
  eventDateLabel: string
  eventLocation: string
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

interface SupabaseRegistrationEventRow {
  id: string
  slug: string
  title: string
  event_date: string | null
  date_label: string
  location: string
}

type SupabaseRelation<T> =
  | T
  | T[]
  | null

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
  events: SupabaseRelation<SupabaseRegistrationEventRow>
}

const getSingleRelation = <T>(
  relation: SupabaseRelation<T>
) => {
  if (!relation) {
    return null
  }

  if (Array.isArray(relation)) {
    return relation[0] || null
  }

  return relation
}

const mapRegistration = (
  registration: SupabaseEventRegistrationRow
): AdminEventRegistration => {
  const event = getSingleRelation(
    registration.events
  )

  return {
    id: registration.id,
    eventId: registration.event_id,
    eventSlug: event?.slug || undefined,
    eventTitle:
      event?.title || 'Evento indisponível',
    eventDate:
      event?.event_date || undefined,
    eventDateLabel:
      event?.date_label || 'Data indisponível',
    eventLocation:
      event?.location || 'Local indisponível',
    fullName: registration.full_name,
    email: registration.email,
    phone: registration.phone,
    memberNumber:
      registration.member_number || undefined,
    seats: registration.seats,
    notes:
      registration.notes || undefined,
    status: registration.status,
    paymentStatus:
      registration.payment_status,
    createdAt: registration.created_at
  }
}

export const useSupabaseAdminEventRegistrations = () => {
  const getAllRegistrations = async () => {
    const supabase =
      useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase ainda não está configurado.',
        registrations: []
      }
    }

    const {
      data,
      error
    } = await supabase
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
        created_at,
        events (
          id,
          slug,
          title,
          event_date,
          date_label,
          location
        )
      `)
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
      registrations:
        (data || []).map(
          (registration) => {
            return mapRegistration(
              registration as unknown as SupabaseEventRegistrationRow
            )
          }
        )
    }
  }

  const getRegistrationsByEventId =
    async (
      eventId: string
    ) => {
      const supabase =
        useSupabaseClient()

      if (!supabase) {
        return {
          success: false,
          error:
            'Supabase ainda não está configurado.',
          registrations: []
        }
      }

      const {
        data,
        error
      } = await supabase
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
          created_at,
          events (
            id,
            slug,
            title,
            event_date,
            date_label,
            location
          )
        `)
        .eq(
          'event_id',
          eventId
        )
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
        registrations:
          (data || []).map(
            (registration) => {
              return mapRegistration(
                registration as unknown as SupabaseEventRegistrationRow
              )
            }
          )
      }
    }

  const updateRegistrationStatus =
    async (
      registrationId: string,
      status: AdminRegistrationStatus
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
        error
      } = await supabase
        .from('event_registrations')
        .update({
          status
        })
        .eq(
          'id',
          registrationId
        )

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

  const updatePaymentStatus =
    async (
      registrationId: string,
      paymentStatus:
        AdminRegistrationPaymentStatus
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
        error
      } = await supabase
        .from('event_registrations')
        .update({
          payment_status:
            paymentStatus
        })
        .eq(
          'id',
          registrationId
        )

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
    getAllRegistrations,
    getRegistrationsByEventId,
    updateRegistrationStatus,
    updatePaymentStatus
  }
}