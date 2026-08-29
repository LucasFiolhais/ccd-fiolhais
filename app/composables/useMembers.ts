import type {
  CreateMemberInput,
  MemberItem,
  UpdateMemberInput
} from '~/types/member' 
import { usePersistedState } from './usePersistedState'
const initialMembers: MemberItem[] = [
  {
    id: 1,
    number: '001',
    fullName: 'Ana Carvalho',
    email: 'ana@email.com',
    phone: '912 345 678',
    address: 'Fiolhais',
    birthDate: '1998-04-12',
    joinedAt: '2024-01-15',
    status: 'active',
    notes: 'Sócia ativa e participante nos eventos.',
    quotas: [
      {
        year: 2026,
        amount: 12,
        status: 'paid',
        paidAt: '2026-02-10'
      },
      {
        year: 2025,
        amount: 12,
        status: 'paid',
        paidAt: '2025-02-04'
      }
    ]
  },
  {
    id: 2,
    number: '002',
    fullName: 'João Martins',
    email: 'joao@email.com',
    phone: '913 456 789',
    address: 'Fiolhais',
    joinedAt: '2024-03-20',
    status: 'pending',
    notes: 'Pedido de sócio ainda por validar.',
    quotas: [
      {
        year: 2026,
        amount: 12,
        status: 'overdue'
      },
      {
        year: 2025,
        amount: 12,
        status: 'paid',
        paidAt: '2025-03-02'
      }
    ]
  },
  {
    id: 3,
    number: '003',
    fullName: 'Maria Fernandes',
    email: 'maria@email.com',
    phone: '914 567 890',
    address: 'Oliveira do Hospital',
    joinedAt: '2023-11-08',
    status: 'active',
    quotas: [
      {
        year: 2026,
        amount: 12,
        status: 'pending'
      },
      {
        year: 2025,
        amount: 12,
        status: 'paid',
        paidAt: '2025-01-19'
      }
    ]
  }
]

export const useMembers = () => {
  const members = usePersistedState<MemberItem[]>('members', initialMembers)

  const getMembers = () => {
    return members.value
  }

  const getMemberByNumber = (number: string) => {
    return members.value.find((member) => member.number === number)
  }

  const getCurrentQuota = (member: MemberItem, year = new Date().getFullYear()) => {
    return member.quotas.find((quota) => quota.year === year)
  }

  const markQuotaAsPaid = (memberNumber: string, year: number) => {
    const member = getMemberByNumber(memberNumber)

    if (!member) {
      return
    }

    const quota = member.quotas.find((item) => item.year === year)

    if (!quota) {
      return
    }

    quota.status = 'paid'
    quota.paidAt = new Date().toISOString().slice(0, 10)
  }

  const generateNextMemberNumber = () => {
  const lastNumber = members.value.reduce((max, member) => {
    const parsedNumber = Number(member.number)

    if (Number.isNaN(parsedNumber)) {
      return max
    }

    return Math.max(max, parsedNumber)
  }, 0)

  return String(lastNumber + 1).padStart(3, '0')
}

const createMember = (input: CreateMemberInput) => {
  const currentYear = new Date().getFullYear()

  const nextId =
    members.value.length > 0
      ? Math.max(...members.value.map((member) => member.id)) + 1
      : 1

  const newMember: MemberItem = {
    id: nextId,
    number: generateNextMemberNumber(),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    birthDate: input.birthDate || undefined,
    joinedAt: new Date().toISOString().slice(0, 10),
    status: input.status,
    notes: input.notes?.trim() || undefined,
    quotas: [
      {
        year: currentYear,
        amount: 12,
        status: 'pending'
      }
    ]
  }

  members.value.push(newMember)

  return newMember
}

const ensureQuotaForMember = (memberNumber: string, year: number, amount = 12) => {
  const member = getMemberByNumber(memberNumber)

  if (!member) {
    return
  }

  const existingQuota = member.quotas.find((quota) => quota.year === year)

  if (existingQuota) {
    return existingQuota
  }

  const newQuota = {
    year,
    amount,
    status: 'pending' as const
  }

  member.quotas.push(newQuota)

  return newQuota
}

const generateAnnualQuotas = (year: number, amount = 12) => {
  members.value.forEach((member) => {
    ensureQuotaForMember(member.number, year, amount)
  })
}

const updateMember = (memberNumber: string, input: UpdateMemberInput) => {
  const member = getMemberByNumber(memberNumber)

  if (!member) {
    return null
  }

  member.fullName = input.fullName
  member.email = input.email
  member.phone = input.phone
  member.address = input.address
  member.birthDate = input.birthDate || undefined
  member.status = input.status
  member.notes = input.notes?.trim() || undefined

  return member
}

const deactivateMember = (memberNumber: string) => {
  const member = getMemberByNumber(memberNumber)

  if (!member) {
    return null
  }

  member.status = 'inactive'

  return member
}

const deleteMember = (memberNumber: string) => {
  const memberExists = members.value.some((member) => member.number === memberNumber)

  if (!memberExists) {
    return false
  }

  members.value = members.value.filter((member) => member.number !== memberNumber)

  return true
}

return {
  members,
  getMembers,
  getMemberByNumber,
  getCurrentQuota,
  createMember,
  updateMember,
  markQuotaAsPaid,
  ensureQuotaForMember,
  generateAnnualQuotas,
  deactivateMember,
  deleteMember
}
}