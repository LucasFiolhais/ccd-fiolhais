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

  return {
    getMemberApplications,
    updateMemberApplicationStatus
  }
}