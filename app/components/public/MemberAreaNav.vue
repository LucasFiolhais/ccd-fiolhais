<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'

const {
  member,
  loadMemberUser,
  signOutMember
} = useSupabaseMemberAuth()

const links = [
  {
    label: 'Dados pessoais',
    to: '/area-socio'
  },
  {
    label: 'Quotas',
    to: '/area-socio/quotas'
  },
  {
    label: 'Eventos',
    to: '/area-socio/eventos'
  }
]

const handleLogout = async () => {
  await signOutMember()

  await navigateTo('/socios/login')
}

onMounted(async () => {
  await loadMemberUser()
})
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-gray-500">
          Área do Sócio
        </p>

        <p class="font-semibold text-gray-950">
          {{ member?.fullName || 'Sócio' }}
        </p>

        <p
          v-if="member?.number"
          class="text-sm text-gray-500"
        >
          Sócio nº {{ member.number }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          variant="outline"
        >
          {{ link.label }}
        </UButton>

        <UButton
          color="neutral"
          variant="soft"
          @click="handleLogout"
        >
          Terminar sessão
        </UButton>
      </div>
    </div>
  </UCard>
</template>