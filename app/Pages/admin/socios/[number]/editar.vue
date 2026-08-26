<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import type { MemberStatus } from '~/types/member'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const { getMemberByNumber, updateMember } = useMembers()

const member = computed(() => {
  return getMemberByNumber(String(route.params.number))
})

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  status: 'pending' as MemberStatus,
  notes: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: ''
})

const statusOptions = [
  {
    label: 'Ativo',
    value: 'active'
  },
  {
    label: 'Pendente',
    value: 'pending'
  },
  {
    label: 'Inativo',
    value: 'inactive'
  }
]

watchEffect(() => {
  if (!member.value) {
    return
  }

  form.fullName = member.value.fullName
  form.email = member.value.email
  form.phone = member.value.phone
  form.address = member.value.address
  form.birthDate = member.value.birthDate || ''
  form.status = member.value.status
  form.notes = member.value.notes || ''
})

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.address = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.fullName.trim()) {
    errors.fullName = 'O nome completo é obrigatório.'
  }

  if (!form.email.trim()) {
    errors.email = 'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Insere um email válido.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'O telefone é obrigatório.'
  }

  if (!form.address.trim()) {
    errors.address = 'A morada é obrigatória.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.address
  )
}

const handleSubmit = async () => {
  if (!member.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  const updatedMember = updateMember(member.value.number, {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    birthDate: form.birthDate,
    status: form.status,
    notes: form.notes
  })

  if (!updatedMember) {
    return
  }

  await router.push(`/admin/socios/${updatedMember.number}`)
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      :to="member ? `/admin/socios/${member.number}` : '/admin/socios'"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar à ficha
    </UButton>

    <div
      v-if="member"
      class="mb-8"
    >
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Editar sócio nº {{ member.number }}
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Editar dados do sócio
      </h1>

      <p class="mt-2 text-gray-600">
        Atualiza os dados pessoais, estado e notas internas do sócio.
      </p>
    </div>

    <form
      v-if="member"
      class="grid gap-8 lg:grid-cols-[1fr_360px]"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Dados pessoais
            </h2>
          </template>

          <div class="space-y-5">
            <UFormField
              label="Nome completo"
              :error="errors.fullName"
            >
              <UInput
                v-model="form.fullName"
                size="lg"
              />
            </UFormField>

            <div class="grid gap-5 md:grid-cols-2">
              <UFormField
                label="Email"
                :error="errors.email"
              >
                <UInput
                  v-model="form.email"
                  type="email"
                  size="lg"
                />
              </UFormField>

              <UFormField
                label="Telefone"
                :error="errors.phone"
              >
                <UInput
                  v-model="form.phone"
                  size="lg"
                />
              </UFormField>
            </div>

            <UFormField
              label="Morada"
              :error="errors.address"
            >
              <UTextarea
                v-model="form.address"
                size="lg"
              />
            </UFormField>

            <UFormField label="Data de nascimento">
              <UInput
                v-model="form.birthDate"
                type="date"
                size="lg"
              />
            </UFormField>

            <UFormField label="Notas internas">
              <UTextarea
                v-model="form.notes"
                size="lg"
                :rows="5"
              />
            </UFormField>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Estado do sócio
            </h2>
          </template>

          <UFormField label="Estado">
            <USelect
              v-model="form.status"
              :items="statusOptions"
              size="lg"
            />
          </UFormField>

          <div class="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <p>
              O estado permite distinguir sócios ativos, pedidos pendentes e sócios inativos.
            </p>

            <p class="mt-2">
              Esta informação é usada na lista de sócios, dashboard e filtros do backoffice.
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Pré-visualização
            </h2>
          </template>

          <div class="rounded-2xl border border-gray-200 p-5">
            <p class="text-sm font-semibold uppercase tracking-wide text-primary">
              Sócio nº {{ member.number }}
            </p>

            <h3 class="mt-2 text-xl font-bold text-gray-950">
              {{ form.fullName || 'Nome do sócio' }}
            </h3>

            <div class="mt-4 space-y-2 text-sm text-gray-600">
              <p>{{ form.email || 'email@exemplo.com' }}</p>
              <p>{{ form.phone || 'Telefone' }}</p>
              <p>{{ form.address || 'Morada' }}</p>
            </div>
          </div>

          <template #footer>
            <div class="space-y-3">
              <UButton
                type="submit"
                size="lg"
                block
              >
                Guardar alterações
              </UButton>

              <UButton
                :to="`/admin/socios/${member.number}`"
                variant="outline"
                block
              >
                Cancelar
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </form>

    <UCard
      v-else
      class="text-center"
    >
      <h1 class="text-2xl font-bold text-gray-950">
        Sócio não encontrado
      </h1>

      <p class="mt-2 text-gray-600">
        Não foi possível encontrar o sócio indicado.
      </p>

      <UButton
        to="/admin/socios"
        class="mt-6"
      >
        Voltar aos sócios
      </UButton>
    </UCard>
  </UContainer>
</template>