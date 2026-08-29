<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => {
  return props.error.statusCode === 404
})

const title = computed(() => {
  if (isNotFound.value) {
    return 'Página não encontrada'
  }

  return 'Ocorreu um erro'
})

const description = computed(() => {
  if (isNotFound.value) {
    return 'A página que procuras não existe ou foi movida.'
  }

  return 'Ocorreu um problema inesperado. Podes voltar à página inicial e tentar novamente.'
})

const handleBackHome = async () => {
  await clearError({
    redirect: '/'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div class="w-full rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <img
          src="/images/ccd-logo.png"
          alt="Logótipo do Centro Cultural e Desportivo de Fiolhais"
          class="mx-auto h-24 w-auto"
        >

        <p class="mt-8 text-sm font-semibold uppercase tracking-wide text-amber-600">
          Erro {{ error.statusCode }}
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          {{ title }}
        </h1>

        <p class="mx-auto mt-4 max-w-xl leading-7 text-gray-700">
          {{ description }}
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
            @click="handleBackHome"
          >
            Voltar ao início
          </button>

          <NuxtLink
            to="/agenda"
            class="rounded-xl border border-amber-500 px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            Ver agenda
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>