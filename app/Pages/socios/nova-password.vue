<script setup lang="ts">
useHead({
  title: 'Nova Palavra-passe'
})

const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(true)
const isSubmitting = ref(false)

const sessionAvailable = ref(false)

const loadError = ref('')
const submitError = ref('')
const successMessage = ref('')

const prepareSession = async () => {
  if (import.meta.server) {
    return
  }

  const supabase = useSupabaseClient()

  if (!supabase) {
    loadError.value =
      'Supabase ainda não está configurado.'

    isLoading.value = false
    return
  }

  try {
    const url =
      new URL(window.location.href)

    const code =
      url.searchParams.get('code')

    if (code) {
      const {
        error
      } = await supabase.auth
        .exchangeCodeForSession(code)

      if (error) {
        throw error
      }
    }

    if (window.location.hash) {
      const params =
        new URLSearchParams(
          window.location.hash.substring(1)
        )

      const accessToken =
        params.get('access_token')

      const refreshToken =
        params.get('refresh_token')

      if (
        accessToken &&
        refreshToken
      ) {
        const {
          error
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (error) {
          throw error
        }

        window.history.replaceState(
          {},
          document.title,
          '/socios/nova-password'
        )
      }
    }

    const {
      data,
      error
    } = await supabase.auth.getSession()

    if (
      error ||
      !data.session
    ) {
      loadError.value =
        'O link de recuperação é inválido ou expirou.'

      return
    }

    sessionAvailable.value = true
  } catch (error) {
    console.error(
      'Erro ao validar recuperação:',
      error
    )

    loadError.value =
      'Não foi possível validar o link de recuperação.'
  } finally {
    isLoading.value = false
  }
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

  const {
    error
  } = await supabase.auth.updateUser({
    password: password.value
  })

  isSubmitting.value = false

  if (error) {
    submitError.value =
      'Não foi possível alterar a palavra-passe.'

    console.error(error)
    return
  }

  successMessage.value =
    'Palavra-passe alterada com sucesso.'

  setTimeout(async () => {
    await navigateTo('/area-socio')
  }, 1000)
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
          <div
            class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-white p-4 shadow-sm"
          >
            <img
              src="/images/ccd-logo.png"
              alt="CCD Fiolhais"
              class="max-h-full max-w-full object-contain"
            >
          </div>

          <p class="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Área do Sócio
          </p>

          <h1 class="mt-2 text-3xl font-black text-gray-950">
            Nova palavra-passe
          </h1>

          <p class="mt-3 text-gray-600">
            Define uma nova palavra-passe para a tua conta.
          </p>
        </div>

        <div
          v-if="isLoading"
          class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
        >
          A validar pedido...
        </div>

        <div
          v-else-if="loadError"
          class="rounded-3xl border border-red-200 bg-white p-6 shadow-sm"
        >
          <div
            class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
          >
            <p class="font-bold">
              Não foi possível validar o pedido
            </p>

            <p class="mt-2">
              {{ loadError }}
            </p>
          </div>

          <NuxtLink
            to="/socios/recuperar-password"
            class="mt-5 block text-center font-semibold text-amber-700 hover:text-amber-600"
          >
            Pedir novo link de recuperação
          </NuxtLink>
        </div>

        <form
          v-else
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-5 p-6">
            <div
              v-if="submitError"
              class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
            >
              <p class="font-bold">
                Não foi possível alterar a palavra-passe
              </p>

              <p class="mt-2">
                {{ submitError }}
              </p>
            </div>

            <div
              v-if="successMessage"
              class="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900"
            >
              <p class="font-bold">
                Palavra-passe atualizada
              </p>

              <p class="mt-2">
                {{ successMessage }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Nova palavra-passe
              </label>

              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >

              <p class="mt-2 text-xs text-gray-500">
                Utiliza pelo menos 8 caracteres.
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Confirmar palavra-passe
              </label>

              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting || !!successMessage"
            >
              {{
                isSubmitting
                  ? 'A guardar...'
                  : 'Guardar nova palavra-passe'
              }}
            </button>
          </div>
        </form>
      </div>
    </UContainer>
  </section>
</template>