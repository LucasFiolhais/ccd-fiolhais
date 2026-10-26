<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'
import {
  useSupabaseMemberArea,
  type MemberAreaData,
  type MemberAreaQuotaStatus,
  type MemberAreaStatus
} from '~/composables/useSupabaseMemberArea'

const {
  isLoggedIn,
  loadMemberUser,
  signOutMember
} = useSupabaseMemberAuth()

const {
  getMyMemberData,
  updateMyContactData
} = useSupabaseMemberArea()

useHead({
  title: 'Área do Sócio'
})

const member = ref<MemberAreaData | null>(null)

const isLoading = ref(true)
const loadError = ref('')

const isEditing = ref(false)
const isSaving = ref(false)

const saveError = ref('')
const saveSuccess = ref('')

const editForm = reactive({
  phone: '',
  address: ''
})

const currentYear = new Date().getFullYear()

const getMemberStatusLabel = (
  status: MemberAreaStatus
) => {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  return 'Inativo'
}

const getMemberStatusClass = (
  status: MemberAreaStatus
) => {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const getQuotaStatusLabel = (
  status: MemberAreaQuotaStatus
) => {
  if (status === 'paid') {
    return 'Paga'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  if (status === 'overdue') {
    return 'Em atraso'
  }

  return 'Isenta'
}

const getQuotaStatusClass = (
  status: MemberAreaQuotaStatus
) => {
  if (status === 'paid') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'overdue') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Não indicada'
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long'
  }).format(date)
}

const paidQuotas = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return quota.status === 'paid'
  }).length
})

const loadArea = async () => {
  isLoading.value = true
  loadError.value = ''

  await loadMemberUser()

  if (!isLoggedIn.value) {
    isLoading.value = false

    await navigateTo('/socios/login')
    return
  }

  const result = await getMyMemberData()

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar a área do sócio.'

    return
  }

  if (!result.member) {
    await signOutMember()
    await navigateTo('/socios/login')
    return
  }

  member.value = result.member
}

const startEditing = () => {
  if (!member.value) {
    return
  }

  editForm.phone = member.value.phone
  editForm.address = member.value.address

  saveError.value = ''
  saveSuccess.value = ''

  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  saveError.value = ''

  if (member.value) {
    editForm.phone = member.value.phone
    editForm.address = member.value.address
  }
}

const saveContactData = async () => {
  saveError.value = ''
  saveSuccess.value = ''

  if (!editForm.phone.trim()) {
    saveError.value = 'Introduz o teu telefone.'
    return
  }

  if (!editForm.address.trim()) {
    saveError.value = 'Introduz a tua morada.'
    return
  }

  isSaving.value = true

  const result = await updateMyContactData({
    phone: editForm.phone,
    address: editForm.address
  })

  isSaving.value = false

  if (!result.success) {
    saveError.value =
      result.error ||
      'Não foi possível atualizar os teus dados.'

    return
  }

  if (member.value) {
    member.value.phone = editForm.phone.trim()
    member.value.address = editForm.address.trim()
  }

  isEditing.value = false

  saveSuccess.value =
    'Os teus dados foram atualizados com sucesso.'
}

const handleLogout = async () => {
  await signOutMember()
  await navigateTo('/socios/login')
}

onMounted(async () => {
  await loadArea()
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-12">
    <UContainer>
      <div
        v-if="isLoading"
        class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar a tua área...
      </div>

      <div
        v-else-if="loadError"
        class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <p class="font-bold">
          Não foi possível carregar a área do sócio
        </p>

        <p class="mt-2">
          {{ loadError }}
        </p>
      </div>

      <div
        v-else-if="member"
        class="space-y-8"
      >
        <header
          class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
              Área do Sócio
            </p>

            <h1 class="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">
              Olá, {{ member.fullName }}
            </h1>

            <p class="mt-3 text-gray-600">
              Sócio nº {{ member.number }}
            </p>

            <span
              class="mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold"
              :class="getMemberStatusClass(member.status)"
            >
              {{ getMemberStatusLabel(member.status) }}
            </span>
          </div>

          <button
            type="button"
            class="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="handleLogout"
          >
            Terminar sessão
          </button>
        </header>

        <nav class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            to="/area-socio"
            class="rounded-2xl border border-amber-400 bg-amber-50 p-5"
          >
            <p class="text-2xl">👤</p>

            <p class="mt-3 font-bold text-gray-950">
              Resumo
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Dados do meu perfil
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/quotas"
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">💶</p>

            <p class="mt-3 font-bold text-gray-950">
              Quotas
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Consultar pagamentos
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/eventos"
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">🎟️</p>

            <p class="mt-3 font-bold text-gray-950">
              Eventos
            </p>

            <p class="mt-1 text-sm text-gray-600">
              As minhas inscrições
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/seguranca"
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">🔐</p>

            <p class="mt-3 font-bold text-gray-950">
              Segurança
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Palavra-passe da conta
            </p>
          </NuxtLink>
        </nav>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <p class="text-sm font-semibold text-gray-500">
              Número de sócio
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ member.number }}
            </p>
          </div>

          <div
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <p class="text-sm font-semibold text-gray-500">
              Quotas pagas
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ paidQuotas }}
            </p>
          </div>

          <div
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <p class="text-sm font-semibold text-gray-500">
              Quota {{ currentYear }}
            </p>

            <div
              v-if="member.currentQuota"
              class="mt-3"
            >
              <span
                class="inline-flex rounded-full border px-3 py-1 text-sm font-bold"
                :class="getQuotaStatusClass(member.currentQuota.status)"
              >
                {{ getQuotaStatusLabel(member.currentQuota.status) }}
              </span>
            </div>

            <p
              v-else
              class="mt-3 font-semibold text-gray-500"
            >
              Ainda não registada
            </p>
          </div>
        </div>

        <section
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
        >
          <div
            class="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="text-2xl font-bold text-gray-950">
                Os meus dados
              </h2>

              <p class="mt-2 text-gray-600">
                Informação atualmente registada na associação.
              </p>
            </div>

            <button
              v-if="!isEditing"
              type="button"
              class="rounded-xl border border-amber-400 bg-white px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
              @click="startEditing"
            >
              Editar dados
            </button>
          </div>

          <div
            v-if="saveSuccess"
            class="mx-6 mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900"
          >
            <p class="font-bold">
              Dados atualizados
            </p>

            <p class="mt-1">
              {{ saveSuccess }}
            </p>
          </div>

          <div
            v-if="saveError"
            class="mx-6 mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
          >
            <p class="font-bold">
              Não foi possível guardar
            </p>

            <p class="mt-1">
              {{ saveError }}
            </p>
          </div>

          <div
            v-if="!isEditing"
            class="grid gap-4 p-6 md:grid-cols-2"
          >
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Nome
              </p>

              <p class="mt-1 text-gray-950">
                {{ member.fullName }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Email
              </p>

              <p class="mt-1 break-all text-gray-950">
                {{ member.email }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Telefone
              </p>

              <p class="mt-1 text-gray-950">
                {{ member.phone }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Data de nascimento
              </p>

              <p class="mt-1 text-gray-950">
                {{ formatDate(member.birthDate) }}
              </p>
            </div>

            <div
              class="rounded-2xl bg-gray-50 p-4 md:col-span-2"
            >
              <p class="text-sm font-semibold text-gray-500">
                Morada
              </p>

              <p class="mt-1 whitespace-pre-line text-gray-950">
                {{ member.address }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Sócio desde
              </p>

              <p class="mt-1 text-gray-950">
                {{ formatDate(member.joinedAt) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Estado
              </p>

              <p class="mt-1 text-gray-950">
                {{ getMemberStatusLabel(member.status) }}
              </p>
            </div>
          </div>

          <form
            v-else
            class="space-y-6 p-6"
            @submit.prevent="saveContactData"
          >
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Nome
              </p>

              <p class="mt-1 text-gray-950">
                {{ member.fullName }}
              </p>

              <p class="mt-2 text-xs text-gray-500">
                Para alterar o nome, contacta a direção do CCD.
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Email
              </p>

              <p class="mt-1 break-all text-gray-950">
                {{ member.email }}
              </p>

              <p class="mt-2 text-xs text-gray-500">
                O email da conta não pode ser alterado nesta página.
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Telefone
              </label>

              <input
                v-model="editForm.phone"
                type="tel"
                autocomplete="tel"
                placeholder="912 345 678"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Morada
              </label>

              <textarea
                v-model="editForm.address"
                rows="4"
                autocomplete="street-address"
                placeholder="Rua, número, localidade e código postal"
                class="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              ></textarea>
            </div>

            <div
              class="flex flex-col gap-3 sm:flex-row sm:justify-end"
            >
              <button
                type="button"
                class="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSaving"
                @click="cancelEditing"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSaving"
              >
                {{
                  isSaving
                    ? 'A guardar...'
                    : 'Guardar alterações'
                }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </UContainer>
  </section>
</template>