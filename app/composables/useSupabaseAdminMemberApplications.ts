export type MemberApplicationStatus = 'new' | 'approved' | 'rejected'

export interface MemberApplication {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  notes?: string
  wantsNotifications: boolean
  acceptsDataTreatment: boolean
  status: MemberApplicationStatus
  createdAt: string
}

interface SupabaseMemberApplicationRow {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  birth_date: string | null
  notes: string | null
  wants_notifications: boolean
  accepts_data_treatment: boolean
  status: MemberApplicationStatus
  created_at: string
}

interface SupabaseMemberNumberRow {
  number: string
}

const mapMemberApplication = (
  application: SupabaseMemberApplicationRow
): MemberApplication => {
  return {
    id: application.id,
    fullName: application.full_name,
    email: application.email,
    phone: application.phone,
    address: application.address,
    birthDate: application.birth_date || undefined,
    notes: application.notes || undefined,
    wantsNotifications: application.wants_notifications,
    acceptsDataTreatment: application.accepts_data_treatment,
    status: application.status,
    createdAt: application.created_at
  }
}

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10)
}

const getCurrentYear = () => {
  return new Date().getFullYear()
}

const getNextMemberNumber = (members: SupabaseMemberNumberRow[]) => {
  const numericNumbers = members
    .map((member) => Number(member.number))
    .filter((number) => Number.isFinite(number))

  if (!numericNumbers.length) {
    return '001'
  }

  const nextNumber = Math.max(...numericNumbers) + 1

  return String(nextNumber).padStart(3, '0')
}

export const useSupabaseAdminMemberApplications = () => {
  const getMemberApplications = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        applications: []
      }
    }

    const { data, error } = await supabase
      .from('member_applications')
      .select(`
        id,
        full_name,
        email,
        phone,
        address,
        birth_date,
        notes,
        wants_notifications,
        accepts_data_treatment,
        status,
        created_at
      `)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        applications: []
      }
    }

    return {
      success: true,
      error: null,
      applications: (data || []).map((application) => {
        return mapMemberApplication(application as SupabaseMemberApplicationRow)
      })
    }
  }

  const updateMemberApplicationStatus = async (
    applicationId: string,
    status: MemberApplicationStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('member_applications')
      .update({
        status
      })
      .eq('id', applicationId)

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

  const createMemberFromApplication = async (application: MemberApplication) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        memberNumber: null
      }
    }

    const { data: existingMembers, error: membersError } = await supabase
      .from('members')
      .select('number')

    if (membersError) {
      return {
        success: false,
        error: membersError.message,
        memberNumber: null
      }
    }

    const memberNumber = getNextMemberNumber(
      (existingMembers || []) as SupabaseMemberNumberRow[]
    )

    const { data: createdMember, error: createMemberError } = await supabase
      .from('members')
      .insert({
        number: memberNumber,
        full_name: application.fullName,
        email: application.email,
        phone: application.phone,
        address: application.address,
        birth_date: application.birthDate || null,
        joined_at: getTodayDate(),
        status: 'active',
        notes: application.notes || null
      })
      .select('id, number')
      .single()

    if (createMemberError) {
      return {
        success: false,
        error: createMemberError.message,
        memberNumber: null
      }
    }

    const { error: quotaError } = await supabase
      .from('member_quotas')
      .insert({
        member_id: createdMember.id,
        year: getCurrentYear(),
        amount: 12,
        status: 'pending'
      })

    if (quotaError) {
      return {
        success: false,
        error: quotaError.message,
        memberNumber: null
      }
    }

    const statusResult = await updateMemberApplicationStatus(
      application.id,
      'approved'
    )

    if (!statusResult.success) {
      return {
        success: false,
        error: statusResult.error,
        memberNumber: null
      }
    }

    return {
      success: true,
      error: null,
      memberNumber: createdMember.number as string
    }
  }

  return {
    getMemberApplications,
    updateMemberApplicationStatus,
    createMemberFromApplication
  }
}