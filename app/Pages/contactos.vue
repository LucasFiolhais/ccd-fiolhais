<script setup lang="ts">
import { useSupabaseContactMessages } from '~/composables/useSupabaseContactMessages'

useHead({
  title: 'Contactos'
})

const { createContactMessage } = useSupabaseContactMessages()

const form = reactive({
  fullName: '',
  email: '',
  message: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.message = ''
  submitError.value = ''
  successMessage.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.fullName.trim()) {
    errors.fullName = 'O nome é obrigatório.'
  }

  if (!form.email.trim()) {
    errors.email = 'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Insere um email válido.'
  }

  if (!form.message.trim()) {
    errors.message = 'A mensagem é obrigatória.'
  } else if (form.message.trim().length < 10) {
    errors.message = 'A mensagem deve ter pelo menos 10 caracteres.'
  }

  return !errors.fullName && !errors.email && !errors.message
}

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.message = ''
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await createContactMessage({
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    message: form.message.trim()
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível enviar a mensagem.'
    return
  }

  successMessage.value = 'A tua mensagem foi enviada com sucesso. O CCD Fiolhais responderá assim que possível.'
  resetForm()
}
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Contactos
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          Fala com o CCD Fiolhais
        </h1>

        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
          Entra em contacto com o Centro Cultural e Desportivo de Fiolhais para informações
          sobre sócios, eventos, quotas, iniciativas ou colaboração com a associação.
        </p>
      </UContainer>
    </section>

    <section class="py-16">
      <UContainer>
        <div class="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div class="space-y-6">
            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-gray-950">
                Informações da associação
              </h2>

              <div class="mt-6 space-y-5">
                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Nome
                  </p>

                  <p class="mt-1 text-gray-950">
                    Centro Cultural e Desportivo de Fiolhais
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Email
                  </p>

                  <p class="mt-1 text-gray-950">
                    geral@ccdfiolhais.pt
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Telefone
                  </p>

                  <p class="mt-1 text-gray-950">
                    A definir
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Localidade
                  </p>

                  <p class="mt-1 text-gray-950">
                    Fiolhais, Portugal
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-gray-950">
                Redes sociais
              </h2>

              <p class="mt-3 leading-7 text-gray-700">
                Adiciona aqui as ligações oficiais do CCD Fiolhais, como Facebook,
                Instagram ou outras plataformas usadas pela associação.
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <NuxtLink
                  to="/"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Facebook
                </NuxtLink>

                <NuxtLink
                  to="/"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Instagram
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-2xl font-bold text-gray-950">
                Pedido de contacto
              </h2>

              <p class="mt-3 leading-7 text-gray-700">
                Preenche o formulário para enviar uma mensagem ao CCD Fiolhais.
                A mensagem será guardada na base de dados oficial.
              </p>
            </div>

            <div
              v-if="successMessage"
              class="m-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
            >
              <p class="font-bold">
                Mensagem enviada
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
                Erro ao enviar
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
                  Nome
                </label>

                <input
                  v-model="form.fullName"
                  type="text"
                  placeholder="O teu nome"
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
                  Mensagem
                </label>

                <textarea
                  v-model="form.message"
                  rows="6"
                  placeholder="Escreve a tua mensagem..."
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.message ? 'border-red-400' : 'border-gray-300'"
                />

                <p
                  v-if="errors.message"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.message }}
                </p>
              </div>

              <button
                type="submit"
                class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'A enviar...' : 'Enviar mensagem' }}
              </button>
            </form>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>