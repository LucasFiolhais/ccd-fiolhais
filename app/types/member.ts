export type MemberStatus = 'active' | 'pending' | 'inactive'
export type QuotaStatus = 'paid' | 'pending' | 'overdue' | 'exempt'

export interface MemberQuota {
  year: number
  amount: number
  status: QuotaStatus
  paidAt?: string
}

export interface MemberItem {
  id: number
  number: string
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  joinedAt: string
  status: MemberStatus
  quotas: MemberQuota[]
  notes?: string
}

export interface CreateMemberInput {
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  status: MemberStatus
  notes?: string
}
export interface UpdateMemberInput {
  fullName: string
  email: string
  phone: string
  address: string
  birthDate?: string
  status: MemberStatus
  notes?: string
}