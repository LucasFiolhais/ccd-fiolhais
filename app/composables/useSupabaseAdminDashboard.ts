export type DashboardMessageStatus = 'new' | 'read' | 'archived'
export type DashboardApplicationStatus = 'new' | 'approved' | 'rejected'
export type DashboardEventStatus = 'draft' | 'open' | 'soon' | 'sold_out' | 'closed'

export interface DashboardRecentMessage {
  id: string
  fullName: string
  email: string
  status: DashboardMessageStatus
  createdAt: string
}

export interface DashboardRecentApplication {
  id: string
  fullName: string
  email: string
  phone: string
  status: DashboardApplicationStatus
  createdAt: string
}

export interface DashboardRecentEvent {
  id: string
  slug: string
  title: string
  dateLabel: string
  eventDate?: string
  status: DashboardEventStatus
  isPublished: boolean
  createdAt: string
}

export interface AdminDashboardData {
  stats: {
    totalMembers: number
    activeMembers: number
    pendingApplications: number
    unpaidQuotas: number
    openEvents: number
    newMessages: number
    pendingRegistrations: number
    paidQuotaAmount: number
  }
  recentMessages: DashboardRecentMessage[]
  recentApplications: DashboardRecentApplication[]
  recentEvents: DashboardRecentEvent[]
}

interface SupabaseMessageRow {
  id: string
  full_name: string
  email: string
  status: DashboardMessageStatus
  created_at: string
}

interface SupabaseApplicationRow {
  id: string
  full_name: string
  email: string
  phone: string
  status: DashboardApplicationStatus
  created_at: string
}

interface SupabaseEventRow {
  id: string
  slug: string
  title: string
  date_label: string
  event_date: string | null
  status: DashboardEventStatus
  is_published: boolean
  created_at: string
}

interface SupabasePaidQuotaRow {
  amount: number
}

const mapMessage = (
  message: SupabaseMessageRow
): DashboardRecentMessage => {
  return {
    id: message.id,
    fullName: message.full_name,
    email: message.email,
    status: message.status,
    createdAt: message.created_at
  }
}

const mapApplication = (
  application: SupabaseApplicationRow
): DashboardRecentApplication => {
  return {
    id: application.id,
    fullName: application.full_name,
    email: application.email,
    phone: application.phone,
    status: application.status,
    createdAt: application.created_at
  }
}

const mapEvent = (
  event: SupabaseEventRow
): DashboardRecentEvent => {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    dateLabel: event.date_label,
    eventDate: event.event_date || undefined,
    status: event.status,
    isPublished: event.is_published,
    createdAt: event.created_at
  }
}

export const useSupabaseAdminDashboard = () => {
  const getDashboardData = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        data: null
      }
    }

    const currentYear = new Date().getFullYear()

    const [
      totalMembersResult,
      activeMembersResult,
      pendingApplicationsResult,
      unpaidQuotasResult,
      openEventsResult,
      newMessagesResult,
      pendingRegistrationsResult,
      paidQuotasResult,
      recentMessagesResult,
      recentApplicationsResult,
      recentEventsResult
    ] = await Promise.all([
      supabase
        .from('members')
        .select('*', {
          count: 'exact',
          head: true
        }),

      supabase
        .from('members')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('status', 'active'),

      supabase
        .from('member_applications')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('status', 'new'),

      supabase
        .from('member_quotas')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('year', currentYear)
        .in('status', ['pending', 'overdue']),

      supabase
        .from('events')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('status', 'open'),

      supabase
        .from('contact_messages')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('status', 'new'),

      supabase
        .from('event_registrations')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('status', 'pending'),

      supabase
        .from('member_quotas')
        .select('amount')
        .eq('year', currentYear)
        .eq('status', 'paid'),

      supabase
        .from('contact_messages')
        .select(`
          id,
          full_name,
          email,
          status,
          created_at
        `)
        .order('created_at', {
          ascending: false
        })
        .limit(5),

      supabase
        .from('member_applications')
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          created_at
        `)
        .order('created_at', {
          ascending: false
        })
        .limit(5),

      supabase
        .from('events')
        .select(`
          id,
          slug,
          title,
          date_label,
          event_date,
          status,
          is_published,
          created_at
        `)
        .order('created_at', {
          ascending: false
        })
        .limit(5)
    ])

    const results = [
      totalMembersResult,
      activeMembersResult,
      pendingApplicationsResult,
      unpaidQuotasResult,
      openEventsResult,
      newMessagesResult,
      pendingRegistrationsResult,
      paidQuotasResult,
      recentMessagesResult,
      recentApplicationsResult,
      recentEventsResult
    ]

    const failedResult = results.find((result) => {
      return Boolean(result.error)
    })

    if (failedResult?.error) {
      return {
        success: false,
        error: failedResult.error.message,
        data: null
      }
    }

    const paidQuotaAmount = (
      (paidQuotasResult.data || []) as SupabasePaidQuotaRow[]
    ).reduce((total, quota) => {
      return total + Number(quota.amount)
    }, 0)

    const dashboardData: AdminDashboardData = {
      stats: {
        totalMembers: totalMembersResult.count || 0,
        activeMembers: activeMembersResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        unpaidQuotas: unpaidQuotasResult.count || 0,
        openEvents: openEventsResult.count || 0,
        newMessages: newMessagesResult.count || 0,
        pendingRegistrations: pendingRegistrationsResult.count || 0,
        paidQuotaAmount
      },

      recentMessages: (
        (recentMessagesResult.data || []) as SupabaseMessageRow[]
      ).map((message) => {
        return mapMessage(message)
      }),

      recentApplications: (
        (recentApplicationsResult.data || []) as SupabaseApplicationRow[]
      ).map((application) => {
        return mapApplication(application)
      }),

      recentEvents: (
        (recentEventsResult.data || []) as SupabaseEventRow[]
      ).map((event) => {
        return mapEvent(event)
      })
    }

    return {
      success: true,
      error: null,
      data: dashboardData
    }
  }

  return {
    getDashboardData
  }
}