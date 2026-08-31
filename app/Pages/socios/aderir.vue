<script setup lang="ts">
import { useSupabaseMemberApplications } from '~/composables/useSupabaseMemberApplications'

useHead({
  title: 'Tornar-me Sócio'
})

const { createMemberApplication } = useSupabaseMemberApplications()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  notes: '',
  wantsNotifications: true,
  acceptsDataTreatment: false
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  acceptsDataTreatment: ''
})

const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

const benefits = [
  {
    title: 'Apoiar a comunidade',
    description: 'A tua inscrição ajuda o CCD a organizar eventos, convívios e iniciativas locais.',
    emoji: '🤝'
  },
  {
    title: 'Manter tradições vivas',
    description: 'Ser sócio é contribuir para preservar festas, encontros e costumes de Fiolhais.',
    emoji: '🌿'
  },
  {
    title: 'Participar mais de perto',
    description: 'No futuro, poderás consultar quotas, dados pessoais e inscrições na área do sócio.',
    emoji: '🎟️'
  }
]

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.address = ''
  errors.acceptsDataTreatment = ''
  submitError.value = ''
  successMessage.value = ''
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

  if (!form.acceptsDataTreatment) {
    errors.acceptsDataTreatment = 'Tens de autorizar o tratamento dos dados para concluir o pedido.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.address &&
    !errors.acceptsDataTreatment
  )
}

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.birthDate = ''
  form.notes = ''
  form.wantsNotifications = true
  form.acceptsDataTreatment = false
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await createMemberApplication({
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    birthDate: form.birthDate || undefined,
    notes: form.notes.trim() || undefined,
    wantsNotifications: form.wantsNotifications,
    acceptsDataTreatment: form.acceptsDataTreatment
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível enviar o pedido de inscrição.'
    return
  }

  successMessage.value = 'O teu pedido de inscrição foi enviado com sucesso. A direção do CCD Fiolhais irá analisar o pedido assim que possível.'
  resetForm()
}
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer class="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Sócios
          </p>

          <h1 class="mt-3 text-4xl font-bold text-gray-950">
            Torna-te sócio do CCD de Fiolhais
          </h1>

          <p class="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
            Ser sócio é ajudar a manter viva a atividade cultural, desportiva e comunitária
            de Fiolhais. A tua participação ajuda a associação a organizar eventos,
            preservar tradições e criar novos momentos de encontro.
          </p>

          <div class="mt-10 space-y-4">
            <div
              v-for="benefit in benefits"
              :key="benefit.title"
              class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
            >
              <div class="flex gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl">
                  {{ benefit.emoji }}
                </div>

                <div>
                  <h2 class="font-bold text-gray-950">
                    {{ benefit.title }}
                  </h2>

                  <p class="mt-2 leading-7 text-gray-700">
                    {{ benefit.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p class="font-bold">
              Pedido sujeito a validação
            </p>

            <p class="mt-2">
              O envio deste formulário não confirma automaticamente a inscrição como sócio.
              O pedido será analisado pela direção do CCD Fiolhais.
            </p>
          </div>
        </div>

        <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Pedido de inscrição de sócio
            </h2>

            <p class="mt-2 leading-7 text-gray-700">
              Preenche os teus dados. O pedido será guardado na base de dados oficial
              para posterior validação.
            </p>
          </div>

          <div
            v-if="successMessage"
            class="m-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
          >
            <p class="font-bold">
              Pedido enviado
            </p>

            <p class="mt-2">
              {{ successMessage }}
            </p>
          </div>

          <div
            v-if="submitError"
            class="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
          >
            <p class="font-bold">
              Erro ao enviar pedido
            </p>

            <p class="mt-2">
              {{ submitError }}
            </p>
          </div>

          <form
            class="space-y-5 p-6"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Nome completo
              </label>

              <input
                v-model="form.fullName"
                type="text"
                placeholder="Ex: Lucas Fiolhais"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.fullName ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.fullName"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.fullName }}
              </p>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Email
                </label>

                <input
                  v-model="form.email"
                  type="email"
                  placeholder="email@exemplo.com"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.email ? 'border-red-400' : 'border-gray-300'"
                >

                <p
                  v-if="errors.email"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.email }}
                </p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Telefone
                </label>

                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="912 345 678"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.phone ? 'border-red-400' : 'border-gray-300'"
                >

                <p
                  v-if="errors.phone"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.phone }}
                </p>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Morada
              </label>

              <textarea
                v-model="form.address"
                rows="3"
                placeholder="Rua, número, localidade e código postal"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.address ? 'border-red-400' : 'border-gray-300'"
              />

              <p
                v-if="errors.address"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.address }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Data de nascimento
              </label>

              <input
                v-model="form.birthDate"
                type="date"
                class="mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Observações
              </label>

              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Podes deixar alguma informação adicional."
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label class="flex gap-3 text-sm text-gray-700">
                <input
                  v-model="form.wantsNotifications"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600"
                >

                <span>
                  Quero receber avisos sobre eventos, assembleias e iniciativas do CCD.
                </span>
              </label>

              <label class="mt-3 flex gap-3 text-sm text-gray-700">
                <input
                  v-model="form.acceptsDataTreatment"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600"
                >

                <span>
                  Autorizo o tratamento dos meus dados para efeitos de inscrição como sócio.
                </span>
              </label>

              <p
                v-if="errors.acceptsDataTreatment"
                class="mt-2 text-sm text-red-600"
              >
                {{ errors.acceptsDataTreatment }}
              </p>
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'A enviar pedido...' : 'Enviar pedido de inscrição' }}
            </button>
          </form>
        </div>
      </UContainer>
    </section>
  </div>
</template>