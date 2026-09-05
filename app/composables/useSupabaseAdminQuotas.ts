export type AdminQuotaStatus = 'pending' | 'paid' | 'overdue' | 'exempt'
export type AdminQuotaMemberStatus = 'pending' | 'active' | 'inactive'

export interface AdminQuota {
  id: string
  memberId: string
  memberNumber: string
  memberFullName: string
  memberEmail: string
  memberPhone: string
  memberStatus: AdminQuotaMemberStatus
  year: number
  amount: number
  status: AdminQuotaStatus
  paidAt?: string
  createdAt: string
}

export interface AdminMemberWithoutQuota {
  id: string
  number: string
  fullName: string
  email: string
  phone: string
}

interface SupabaseQuotaMemberRow {
  id: string
  number: string
  full_name: string
  email: string
  phone: string
  status: AdminQuotaMemberStatus
}

type SupabaseRelation<T> = T | T[] | null

interface SupabaseQuotaRow {
  id: string
  member_id: string
  year: number
  amount: number
  status: AdminQuotaStatus
  paid_at: string | null
  created_at: string
  members: SupabaseRelation<SupabaseQuotaMemberRow>
}

interface SupabaseMemberWithQuotaYearsRow {
  id: string
  number: string
  full_name: string
  email: string
  phone: string
  member_quotas: Array<{
    id: string
    year: number
  }> | null
}

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10)
}

const getSingleRelation = <T>(relation: SupabaseRelation<T>) => {
  if (Array.isArray(relation)) {
    return relation[0] || null
  }

  return relation
}

const mapQuota = (quota: SupabaseQuotaRow): AdminQuota => {
  const member = getSingleRelation(quota.members)

  return {
    id: quota.id,
    memberId: quota.member_id,
    memberNumber: member?.number || 'Sem número',
    memberFullName: member?.full_name || 'Sócio removido',
    memberEmail: member?.email || '',
    memberPhone: member?.phone || '',
    memberStatus: member?.status || 'inactive',
    year: quota.year,
    amount: Number(quota.amount),
    status: quota.status,
    paidAt: quota.paid_at || undefined,
    createdAt: quota.created_at
  }
}

const mapMemberWithoutQuota = (
  member: SupabaseMemberWithQuotaYearsRow
): AdminMemberWithoutQuota => {
  return {
    id: member.id,
    number: member.number,
    fullName: member.full_name,
    email: member.email,
    phone: member.phone
  }
}

export const useSupabaseAdminQuotas = () => {
  const getQuotas = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        quotas: []
      }
    }

    const { data, error } = await supabase
      .from('member_quotas')
      .select(`
        id,
        member_id,
        year,
        amount,
        status,
        paid_at,
        created_at,
        members (
          id,
          number,
          full_name,
          email,
          phone,
          status
        )
      `)
      .order('year', {
        ascending: false
      })
      .order('created_at', {
        ascending: false
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        quotas: []
      }
    }

    return {
      success: true,
      error: null,
      quotas: (data || []).map((quota) => {
        return mapQuota(quota as unknown as SupabaseQuotaRow)
      })
    }
  }

  const getActiveMembersWithoutQuota = async (year: number) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        members: []
      }
    }

    const { data, error } = await supabase
      .from('members')
      .select(`
        id,
        number,
        full_name,
        email,
        phone,
        member_quotas (
          id,
          year
        )
      `)
      .eq('status', 'active')
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

    const membersWithoutQuota = ((data || []) as unknown as SupabaseMemberWithQuotaYearsRow[])
      .filter((member) => {
        return !(member.member_quotas || []).some((quota) => {
          return quota.year === year
        })
      })
      .map((member) => {
        return mapMemberWithoutQuota(member)
      })

    return {
      success: true,
      error: null,
      members: membersWithoutQuota
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

  const createQuotaForMember = async (
    memberId: string,
    year: number,
    amount = 12
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
      .insert({
        member_id: memberId,
        year,
        amount,
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

  const createMissingQuotas = async (
    year: number,
    amount = 12
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        createdCount: 0
      }
    }

    const membersResult = await getActiveMembersWithoutQuota(year)

    if (!membersResult.success) {
      return {
        success: false,
        error: membersResult.error,
        createdCount: 0
      }
    }

    if (!membersResult.members.length) {
      return {
        success: true,
        error: null,
        createdCount: 0
      }
    }

    const quotasToCreate = membersResult.members.map((member) => {
      return {
        member_id: member.id,
        year,
        amount,
        status: 'pending' as AdminQuotaStatus
      }
    })

    const { error } = await supabase
      .from('member_quotas')
      .insert(quotasToCreate)

    if (error) {
      return {
        success: false,
        error: error.message,
        createdCount: 0
      }
    }

    return {
      success: true,
      error: null,
      createdCount: quotasToCreate.length
    }
  }

  return {
    getQuotas,
    getActiveMembersWithoutQuota,
    updateQuotaStatus,
    createQuotaForMember,
    createMissingQuotas
  }
}