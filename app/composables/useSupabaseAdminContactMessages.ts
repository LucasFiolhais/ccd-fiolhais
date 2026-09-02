export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
  id: string
  fullName: string
  email: string
  message: string
  status: ContactMessageStatus
  createdAt: string
}

interface SupabaseContactMessageRow {
  id: string
  full_name: string
  email: string
  message: string
  status: ContactMessageStatus
  created_at: string
}

const mapContactMessage = (message: SupabaseContactMessageRow): ContactMessage => {
  return {
    id: message.id,
    fullName: message.full_name,
    email: message.email,
    message: message.message,
    status: message.status,
    createdAt: message.created_at
  }
}

export const useSupabaseAdminContactMessages = () => {
  const getContactMessages = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        messages: []
      }
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .select(`
        id,
        full_name,
        email,
        message,
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
        messages: []
      }
    }

    return {
      success: true,
      error: null,
      messages: (data || []).map((message) => {
        return mapContactMessage(message as SupabaseContactMessageRow)
      })
    }
  }

  const updateContactMessageStatus = async (
    messageId: string,
    status: ContactMessageStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('contact_messages')
      .update({
        status
      })
      .eq('id', messageId)

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
    getContactMessages,
    updateContactMessageStatus
  }
}