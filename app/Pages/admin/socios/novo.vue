<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import type { MemberStatus } from '~/types/member'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { createMember } = useMembers()

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
  if (!validateForm()) {
    return
  }

  const newMember = createMember({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    birthDate: form.birthDate,
    status: form.status,
    notes: form.notes
  })

  await router.push(`/admin/socios/${newMember.number}`)
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      to="/admin/socios"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar aos sócios
    </UButton>

    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Novo sócio
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Criar sócio
      </h1>

      <p class="mt-2 text-gray-600">
        Regista manualmente um novo sócio no backoffice. Mais tarde este formulário será ligado ao Supabase.
      </p>
    </div>

    <form
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
                placeholder="Ex: Lucas Fiolhais"
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
                  placeholder="email@exemplo.com"
                  size="lg"
                />
              </UFormField>

              <UFormField
                label="Telefone"
                :error="errors.phone"
              >
                <UInput
                  v-model="form.phone"
                  placeholder="912 345 678"
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
                placeholder="Rua, número, localidade e código postal"
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
                placeholder="Ex: pedido recebido por telefone, sócio antigo, observações da direção..."
                size="lg"
                :rows="4"
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

          <div class="space-y-5">
            <UFormField label="Estado">
              <USelect
                v-model="form.status"
                :items="statusOptions"
                size="lg"
              />
            </UFormField>

            <div class="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <p>
                Por defeito, o novo sócio fica com uma quota do ano atual em estado
                <strong>Pendente</strong>.
              </p>

              <p class="mt-2">
                Depois, na ficha do sócio, podes usar o botão
                <strong>Marcar como paga</strong>.
              </p>
            </div>
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
              Novo sócio
            </p>

            <h3 class="mt-2 text-xl font-bold text-gray-950">
              {{ form.fullName || 'Nome do sócio' }}
            </h3>

            <div class="mt-4 space-y-2 text-sm text-gray-600">
              <p>
                {{ form.email || 'email@exemplo.com' }}
              </p>

              <p>
                {{ form.phone || 'Telefone' }}
              </p>

              <p>
                {{ form.address || 'Morada' }}
              </p>
            </div>
          </div>

          <template #footer>
            <UButton
              type="submit"
              size="lg"
              block
            >
              Criar sócio
            </UButton>
          </template>
        </UCard>
      </div>
    </form>
  </UContainer>
</template>