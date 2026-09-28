export type MemberAreaStatus =
  | 'pending'
  | 'active'
  | 'inactive'

export type MemberAreaQuotaStatus =
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'exempt'

export type MemberAreaRegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'

export type MemberAreaPaymentStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'

export interface MemberAreaQuota {
  id: string
  year: number
  amount: number
  status: MemberAreaQuotaStatus
  paidAt?: string
}

export interface MemberAreaData {
  id: string
  number: string
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  joinedAt: string
  status: MemberAreaStatus
  notes?: string
  quotas: MemberAreaQuota[]
  currentQuota?: MemberAreaQuota
}

export interface MemberAreaEventRegistration {
  id: string
  eventId: string
  eventSlug?: string
  eventTitle: string
  eventDate?: string
  eventDateLabel: string
  eventTimeLabel?: string
  eventLocation: string
  seats: number
  status: MemberAreaRegistrationStatus
  paymentStatus: MemberAreaPaymentStatus
  createdAt: string
}

interface SupabaseMemberAreaQuotaRow {
  id: string
  year: number
  amount: number
  status: MemberAreaQuotaStatus
  paid_at: string | null
}

interface SupabaseMemberAreaRow {
  id: string
  number: string
  full_name: string
  email: string
  phone: string
  address: string
  birth_date: string | null
  joined_at: string
  status: MemberAreaStatus
  notes: string | null
  member_quotas:
    | SupabaseMemberAreaQuotaRow[]
    | null
}

interface SupabaseMemberIdRow {
  id: string
}

interface SupabaseRegistrationEventRow {
  id: string
  slug: string
  title: string
  event_date: string | null
  date_label: string
  time_label: string | null
  event_time: string | null
  location: string
}

type SupabaseRelation<T> =
  | T
  | T[]
  | null

interface SupabaseMemberRegistrationRow {
  id: string
  event_id: string
  seats: number
  status: MemberAreaRegistrationStatus
  payment_status: MemberAreaPaymentStatus
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

const mapMemberAreaQuota = (
  quota: SupabaseMemberAreaQuotaRow
): MemberAreaQuota => {
  return {
    id: quota.id,
    year: quota.year,
    amount: Number(quota.amount),
    status: quota.status,
    paidAt: quota.paid_at || undefined
  }
}

const mapMemberAreaData = (
  member: SupabaseMemberAreaRow
): MemberAreaData => {
  const currentYear = new Date().getFullYear()

  const quotas = (member.member_quotas || [])
    .map((quota) => {
      return mapMemberAreaQuota(quota)
    })
    .sort((firstQuota, secondQuota) => {
      return secondQuota.year - firstQuota.year
    })

  return {
    id: member.id,
    number: member.number,
    fullName: member.full_name,
    email: member.email,
    phone: member.phone,
    address: member.address,
    birthDate: member.birth_date || undefined,
    joinedAt: member.joined_at,
    status: member.status,
    notes: member.notes || undefined,
    quotas,
    currentQuota: quotas.find((quota) => {
      return quota.year === currentYear
    })
  }
}

const mapEventRegistration = (
  registration: SupabaseMemberRegistrationRow
): MemberAreaEventRegistration => {
  const event = getSingleRelation(
    registration.events
  )

  return {
    id: registration.id,
    eventId: registration.event_id,
    eventSlug: event?.slug,
    eventTitle:
      event?.title || 'Evento indisponível',
    eventDate: event?.event_date || undefined,
    eventDateLabel:
      event?.date_label || 'Data indisponível',
    eventTimeLabel:
      event?.time_label ||
      event?.event_time ||
      undefined,
    eventLocation:
      event?.location || 'Local indisponível',
    seats: registration.seats,
    status: registration.status,
    paymentStatus: registration.payment_status,
    createdAt: registration.created_at
  }
}

export const useSupabaseMemberArea = () => {
  const getAuthenticatedMemberId = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        memberId: null
      }
    }

    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return {
        success: false,
        error: 'Não existe uma sessão autenticada.',
        memberId: null
      }
    }

    const {
      data: memberData,
      error: memberError
    } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (memberError) {
      return {
        success: false,
        error: memberError.message,
        memberId: null
      }
    }

    if (!memberData) {
      return {
        success: true,
        error: null,
        memberId: null
      }
    }

    const memberRow =
      memberData as SupabaseMemberIdRow

    return {
      success: true,
      error: null,
      memberId: memberRow.id
    }
  }

  const getMyMemberData = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
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
      return {
        success: false,
        error: 'Não existe uma sessão autenticada.',
        member: null
      }
    }

    const {
      data,
      error
    } = await supabase
      .from('members')
      .select(`
        id,
        number,
        full_name,
        email,
        phone,
        address,
        birth_date,
        joined_at,
        status,
        notes,
        member_quotas (
          id,
          year,
          amount,
          status,
          paid_at
        )
      `)
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (error) {
      return {
        success: false,
        error: error.message,
        member: null
      }
    }

    if (!data) {
      return {
        success: true,
        error: null,
        member: null
      }
    }

    return {
      success: true,
      error: null,
      member: mapMemberAreaData(
        data as unknown as SupabaseMemberAreaRow
      )
    }
  }

  const getMyEventRegistrations = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        registrations: []
      }
    }

    const memberResult =
      await getAuthenticatedMemberId()

    if (!memberResult.success) {
      return {
        success: false,
        error: memberResult.error,
        registrations: []
      }
    }

    if (!memberResult.memberId) {
      return {
        success: false,
        error:
          'Não existe nenhum sócio associado a esta conta.',
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
        seats,
        status,
        payment_status,
        created_at,
        events (
          id,
          slug,
          title,
          event_date,
          date_label,
          time_label,
          event_time,
          location
        )
      `)
      .eq(
        'member_id',
        memberResult.memberId
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
      registrations: (data || []).map(
        (registration) => {
          return mapEventRegistration(
            registration as unknown as SupabaseMemberRegistrationRow
          )
        }
      )
    }
  }

  return {
    getMyMemberData,
    getMyEventRegistrations
  }
}