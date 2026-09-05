export type AdminMemberStatus = 'pending' | 'active' | 'inactive'
export type AdminQuotaStatus = 'pending' | 'paid' | 'overdue' | 'exempt'

export interface AdminMemberQuota {
  id: string
  year: number
  amount: number
  status: AdminQuotaStatus
  paidAt?: string
}

export interface AdminMember {
  id: string
  number: string
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  joinedAt: string
  status: AdminMemberStatus
  notes?: string
  quotas: AdminMemberQuota[]
  currentQuota?: AdminMemberQuota
}

interface SupabaseMemberQuotaRow {
  id: string
  year: number
  amount: number
  status: AdminQuotaStatus
  paid_at: string | null
}

interface SupabaseMemberRow {
  id: string
  number: string
  full_name: string
  email: string
  phone: string
  address: string
  birth_date: string | null
  joined_at: string
  status: AdminMemberStatus
  notes: string | null
  member_quotas: SupabaseMemberQuotaRow[] | null
}

const getCurrentYear = () => {
  return new Date().getFullYear()
}

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10)
}

const mapQuota = (quota: SupabaseMemberQuotaRow): AdminMemberQuota => {
  return {
    id: quota.id,
    year: quota.year,
    amount: Number(quota.amount),
    status: quota.status,
    paidAt: quota.paid_at || undefined
  }
}

const mapMember = (
  member: SupabaseMemberRow,
  currentYear: number
): AdminMember => {
  const quotas = (member.member_quotas || [])
    .map((quota) => mapQuota(quota))
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
    currentQuota: quotas.find((quota) => quota.year === currentYear)
  }
}

export const useSupabaseAdminMembers = () => {
  const getMembers = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        members: []
      }
    }

    const currentYear = getCurrentYear()

    const { data, error } = await supabase
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
      .order('number', {
        ascending: true
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        members: []
      }
    }

    return {
      success: true,
      error: null,
      members: (data || []).map((member) => {
        return mapMember(member as SupabaseMemberRow, currentYear)
      })
    }
  }

  const getMemberByNumber = async (memberNumber: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        member: null
      }
    }

    const currentYear = getCurrentYear()

    const { data, error } = await supabase
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
      .eq('number', memberNumber)
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
      member: mapMember(data as SupabaseMemberRow, currentYear)
    }
  }

  const updateMemberStatus = async (
    memberId: string,
    status: AdminMemberStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('members')
      .update({
        status
      })
      .eq('id', memberId)

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

  const updateQuotaStatus = async (
    quotaId: string,
    status: AdminQuotaStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('member_quotas')
      .update({
        status,
        paid_at: status === 'paid' ? getTodayDate() : null
      })
      .eq('id', quotaId)

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

  const createCurrentYearQuota = async (memberId: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('member_quotas')
      .insert({
        member_id: memberId,
        year: getCurrentYear(),
        amount: 12,
        status: 'pending'
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
    getMembers,
    getMemberByNumber,
    updateMemberStatus,
    updateQuotaStatus,
    createCurrentYearQuota
  }
}