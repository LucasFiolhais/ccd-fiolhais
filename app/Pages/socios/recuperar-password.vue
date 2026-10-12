<script setup lang="ts">
useHead({
  title: 'Recuperar Palavra-passe'
})

const email = ref('')

const isSubmitting = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value =
      'Introduz o teu endereço de email.'

    return
  }

  const supabase = useSupabaseClient()

  if (!supabase) {
    errorMessage.value =
      'Supabase ainda não está configurado.'

    return
  }

  const config = useRuntimeConfig()

  isSubmitting.value = true

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email.value.trim(),
      {
        redirectTo:
          `${config.public.siteUrl}/socios/nova-password`
      }
    )

  isSubmitting.value = false

  if (error) {
    console.error(
      'Erro ao pedir recuperação:',
      error
    )

    errorMessage.value =
      'Não foi possível enviar o email de recuperação.'

    return
  }

  successMessage.value =
    'Se existir uma conta associada a esse email, receberás uma mensagem com as instruções para definir uma nova palavra-passe.'

  email.value = ''
}
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
            Recuperar palavra-passe
          </h1>

          <p class="mt-3 text-gray-600">
            Introduz o email associado à tua conta de sócio.
          </p>
        </div>

        <form
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-5 p-6">
            <div
              v-if="errorMessage"
              class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
            >
              <p class="font-bold">
                Não foi possível enviar o email
              </p>

              <p class="mt-2">
                {{ errorMessage }}
              </p>
            </div>

            <div
              v-if="successMessage"
              class="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900"
            >
              <p class="font-bold">
                Pedido enviado
              </p>

              <p class="mt-2">
                {{ successMessage }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Email
              </label>

              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="email@exemplo.pt"
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
                  ? 'A enviar...'
                  : 'Enviar email de recuperação'
              }}
            </button>

            <div class="text-center">
              <NuxtLink
                to="/socios/login"
                class="text-sm font-semibold text-amber-700 hover:text-amber-600"
              >
                ← Voltar ao login
              </NuxtLink>
            </div>
          </div>
        </form>
      </div>
    </UContainer>
  </section>
</template>