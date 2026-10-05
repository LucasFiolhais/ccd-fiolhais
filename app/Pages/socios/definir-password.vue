<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'

useHead({
  title: 'Definir Palavra-passe'
})

const {
  loadMemberUser
} = useSupabaseMemberAuth()

const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(true)
const isSubmitting = ref(false)

const loadError = ref('')
const submitError = ref('')
const successMessage = ref('')

const sessionAvailable = ref(false)

const prepareSession = async () => {
  if (import.meta.server) {
    return
  }

  const supabase =
    useSupabaseClient()

  if (!supabase) {
    loadError.value =
      'Supabase ainda não está configurado.'

    isLoading.value = false
    return
  }

  /*
   * Dependendo do fluxo utilizado pelo Supabase,
   * o convite pode regressar com um code na URL.
   */
  const url =
    new URL(window.location.href)

  const code =
    url.searchParams.get('code')

  if (code) {
    const {
      error: exchangeError
    } =
      await supabase.auth
        .exchangeCodeForSession(code)

    if (exchangeError) {
      console.error(
        'Erro ao trocar código por sessão:',
        exchangeError
      )
    }
  }

  const {
    data,
    error
  } =
    await supabase.auth.getSession()

  if (
    error ||
    !data.session
  ) {
    loadError.value =
      'O convite é inválido, expirou ou já foi utilizado.'

    isLoading.value = false
    return
  }

  sessionAvailable.value = true
  isLoading.value = false
}

const validatePassword = () => {
  submitError.value = ''

  if (password.value.length < 8) {
    submitError.value =
      'A palavra-passe deve ter pelo menos 8 caracteres.'

    return false
  }

  if (
    password.value !==
    confirmPassword.value
  ) {
    submitError.value =
      'As palavras-passe não coincidem.'

    return false
  }

  return true
}

const handleSubmit = async () => {
  if (
    !sessionAvailable.value ||
    !validatePassword()
  ) {
    return
  }

  const supabase =
    useSupabaseClient()

  if (!supabase) {
    submitError.value =
      'Supabase ainda não está configurado.'

    return
  }

  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const {
    error
  } =
    await supabase.auth.updateUser({
      password: password.value
    })

  isSubmitting.value = false

  if (error) {
    submitError.value =
      error.message

    return
  }

  successMessage.value =
    'Palavra-passe definida com sucesso.'

  await loadMemberUser()

  setTimeout(async () => {
    await navigateTo('/area-socio')
  }, 800)
}

onMounted(async () => {
  await prepareSession()
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-16">
    <UContainer>
      <div class="mx-auto max-w-lg">
        <div class="mb-8 text-center">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-white p-4 shadow-sm">
            <img
              src="/images/ccd-logo.png"
              alt="CCD Fiolhais"
              class="max-h-full max-w-full object-contain"
            >
          </div>

          <h1 class="mt-6 text-3xl font-black text-gray-950">
            Ativar Área do Sócio
          </h1>

          <p class="mt-3 text-gray-600">
            Define a palavra-passe que vais utilizar para entrar na tua área privada.
          </p>
        </div>

        <div
          v-if="isLoading"
          class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
        >
          A validar convite...
        </div>

        <div
          v-else-if="loadError"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
        >
          <p class="font-bold">
            Não foi possível validar o convite
          </p>

          <p class="mt-2">
            {{ loadError }}
          </p>

          <NuxtLink
            to="/socios/login"
            class="mt-5 inline-block font-semibold text-red-800 underline"
          >
            Ir para o login
          </NuxtLink>
        </div>

        <form
          v-else
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
          @submit.prevent="handleSubmit"
        >
          <div
            v-if="submitError"
            class="m-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
          >
            {{ submitError }}
          </div>

          <div
            v-if="successMessage"
            class="m-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
          >
            {{ successMessage }}
          </div>

          <div class="space-y-5 p-6">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Nova palavra-passe
              </label>

              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Confirmar palavra-passe
              </label>

              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? 'A guardar...'
                  : 'Definir palavra-passe'
              }}
            </button>
          </div>
        </form>
      </div>
    </UContainer>
  </section>
</template>