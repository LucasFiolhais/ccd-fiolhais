<script setup lang="ts">
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'

definePageMeta({
  layout: false
})

useHead({
  title: 'Login Administração'
})

const { signIn, loadUser, isAdmin } = useSupabaseAuth()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

onMounted(async () => {
  await loadUser()

  if (isAdmin.value) {
    await navigateTo('/admin')
  }
})

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.email.trim()) {
    errors.email = 'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Insere um email válido.'
  }

  if (!form.password) {
    errors.password = 'A palavra-passe é obrigatória.'
  }

  return !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await signIn(form.email.trim(), form.password)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível iniciar sessão.'
    return
  }

  await navigateTo('/admin')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
      <NuxtLink
        to="/"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar ao site
      </NuxtLink>

      <div class="mt-8">
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-3 text-3xl font-bold text-gray-950">
          Entrar no backoffice
        </h1>

        <p class="mt-3 leading-7 text-gray-700">
          Acede com uma conta autorizada para gerir conteúdos, sócios, eventos e mensagens.
        </p>
      </div>

      <div
        v-if="submitError"
        class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
      >
        <p class="font-bold">
          Erro no login
        </p>

        <p class="mt-1 text-sm">
          {{ submitError }}
        </p>
      </div>

      <form
        class="mt-8 space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label class="text-sm font-semibold text-gray-800">
            Email
          </label>

          <input
            v-model="form.email"
            type="email"
            placeholder="admin@exemplo.com"
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
            Palavra-passe
          </label>

          <input
            v-model="form.password"
            type="password"
            placeholder="A tua palavra-passe"
            class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            :class="errors.password ? 'border-red-400' : 'border-gray-300'"
          >

          <p
            v-if="errors.password"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.password }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'A entrar...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>