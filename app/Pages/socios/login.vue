<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'

const {
  isLoggedIn,
  loadMemberUser,
  signInMember
} = useSupabaseMemberAuth()

useHead({
  title: 'Área do Sócio'
})

const email = ref('')
const password = ref('')

const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')

const handleSubmit = async () => {
  submitError.value = ''

  if (!email.value.trim()) {
    submitError.value = 'Introduz o teu email.'
    return
  }

  if (!password.value) {
    submitError.value = 'Introduz a tua palavra-passe.'
    return
  }

  isSubmitting.value = true

  const result = await signInMember(
    email.value.trim(),
    password.value
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível iniciar sessão.'

    return
  }

  await navigateTo('/area-socio')
}

onMounted(async () => {
  await loadMemberUser()

  isLoading.value = false

  if (isLoggedIn.value) {
    await navigateTo('/area-socio')
  }
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

          <p class="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            CCD Fiolhais
          </p>

          <h1 class="mt-2 text-3xl font-black text-gray-950">
            Área do Sócio
          </h1>

          <p class="mt-3 text-gray-600">
            Inicia sessão para consultar os teus dados, quotas e inscrições.
          </p>
        </div>

        <div
          v-if="isLoading"
          class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
        >
          A verificar sessão...
        </div>

        <form
          v-else
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
          @submit.prevent="handleSubmit"
        >
          <div
            v-if="submitError"
            class="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
          >
            <p class="font-bold">
              Não foi possível iniciar sessão
            </p>

            <p class="mt-2">
              {{ submitError }}
            </p>
          </div>

          <div class="space-y-5 p-6">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Email
              </label>

              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="email@exemplo.com"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Palavra-passe
              </label>

              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'A entrar...' : 'Entrar' }}
            </button>
          </div>

          <div class="border-t border-gray-200 p-6 text-center">
            <p class="text-sm text-gray-600">
              Ainda não és sócio?
            </p>

            <NuxtLink
              to="/socios/aderir"
              class="mt-2 inline-block font-semibold text-amber-700 hover:text-amber-600"
            >
              Enviar pedido de adesão
            </NuxtLink>
          </div>
        </form>
      </div>
    </UContainer>
  </section>
</template>