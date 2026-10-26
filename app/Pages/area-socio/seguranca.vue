<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'

const {
  isLoggedIn,
  loadMemberUser,
  signOutMember
} = useSupabaseMemberAuth()

useHead({
  title: 'Segurança da Conta'
})

const isLoading = ref(true)
const isSubmitting = ref(false)

const password = ref('')
const confirmPassword = ref('')

const submitError = ref('')
const successMessage = ref('')

const validatePassword = () => {
  submitError.value = ''

  if (!password.value) {
    submitError.value =
      'Introduz a nova palavra-passe.'

    return false
  }

  if (password.value.length < 8) {
    submitError.value =
      'A palavra-passe deve ter pelo menos 8 caracteres.'

    return false
  }

  if (!confirmPassword.value) {
    submitError.value =
      'Confirma a nova palavra-passe.'

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
  successMessage.value = ''

  if (!validatePassword()) {
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

  const {
    error
  } = await supabase.auth.updateUser({
    password: password.value
  })

  isSubmitting.value = false

  if (error) {
    console.error(
      'Erro ao alterar palavra-passe:',
      error
    )

    submitError.value =
      'Não foi possível alterar a palavra-passe.'

    return
  }

  password.value = ''
  confirmPassword.value = ''

  successMessage.value =
    'A palavra-passe foi alterada com sucesso.'
}

const handleLogout = async () => {
  await signOutMember()
  await navigateTo('/socios/login')
}

onMounted(async () => {
  await loadMemberUser()

  if (!isLoggedIn.value) {
    isLoading.value = false
    await navigateTo('/socios/login')
    return
  }

  isLoading.value = false
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-12">
    <UContainer>
      <div
        v-if="isLoading"
        class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A verificar sessão...
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <header
          class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600"
            >
              Área do Sócio
            </p>

            <h1
              class="mt-2 text-3xl font-black text-gray-950 sm:text-4xl"
            >
              Segurança da conta
            </h1>

            <p class="mt-3 max-w-2xl text-gray-600">
              Gere a palavra-passe utilizada para aceder à tua conta.
            </p>
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
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              👤
            </p>

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
            <p class="text-2xl">
              💶
            </p>

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
            <p class="text-2xl">
              🎟️
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Eventos
            </p>

            <p class="mt-1 text-sm text-gray-600">
              As minhas inscrições
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/seguranca"
            class="rounded-2xl border border-amber-400 bg-amber-50 p-5"
          >
            <p class="text-2xl">
              🔐
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Segurança
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Palavra-passe da conta
            </p>
          </NuxtLink>
        </nav>

        <section
          class="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white shadow-sm"
        >
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Alterar palavra-passe
            </h2>

            <p class="mt-2 text-gray-600">
              Define uma nova palavra-passe para a tua conta de sócio.
            </p>
          </div>

          <form
            class="space-y-6 p-6"
            @submit.prevent="handleSubmit"
          >
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
              <label
                class="text-sm font-semibold text-gray-800"
              >
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
              <label
                class="text-sm font-semibold text-gray-800"
              >
                Confirmar nova palavra-passe
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
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? 'A guardar...'
                  : 'Alterar palavra-passe'
              }}
            </button>
          </form>
        </section>

        <section
          class="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 class="text-lg font-bold text-gray-950">
            Esqueceste-te da palavra-passe?
          </h2>

          <p class="mt-2 text-sm text-gray-600">
            Se perderes o acesso à conta, podes utilizar o processo de recuperação por email.
          </p>

          <NuxtLink
            to="/socios/recuperar-password"
            class="mt-4 inline-block text-sm font-bold text-amber-700 hover:text-amber-600"
          >
            Recuperar palavra-passe
          </NuxtLink>
        </section>
      </div>
    </UContainer>
  </section>
</template>