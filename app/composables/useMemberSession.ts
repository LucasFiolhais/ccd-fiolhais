import { useMembers } from '~/composables/useMembers'

export const useMemberSession = () => {
  const { getMemberByNumber } = useMembers()

  const currentMemberNumber = useState<string | null>('current-member-number', () => null)

  const currentMember = computed(() => {
    if (!currentMemberNumber.value) {
      return null
    }

    return getMemberByNumber(currentMemberNumber.value) || null
  })

  const isLoggedIn = computed(() => {
    return !!currentMember.value
  })

  const loginAsMember = (memberNumber: string) => {
    const member = getMemberByNumber(memberNumber)

    if (!member) {
      return false
    }

    currentMemberNumber.value = member.number

    return true
  }

  const logout = () => {
    currentMemberNumber.value = null
  }

  return {
    currentMemberNumber,
    currentMember,
    isLoggedIn,
    loginAsMember,
    logout
  }
}