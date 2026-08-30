<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()

const hasSupabaseUrl = computed(() => {
  return Boolean(config.public.supabaseUrl)
})

const hasSupabaseAnonKey = computed(() => {
  return Boolean(config.public.supabaseAnonKey)
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Sistema
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Estado da configuração
      </h1>

      <p class="mt-2 text-gray-600">
        Consulta o estado das configurações necessárias para preparar o site oficial.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

        <p class="text-sm font-medium text-gray-600">
          URL do Supabase
        </p>

        <p class="mt-3 text-2xl font-bold text-gray-950">
          {{ hasSupabaseUrl ? 'Configurado' : 'Por configurar' }}
        </p>

        <p class="mt-2 text-sm text-gray-500">
          Indica se a variável NUXT_PUBLIC_SUPABASE_URL já existe.
        </p>
      </div>

      <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

        <p class="text-sm font-medium text-gray-600">
          Chave pública do Supabase
        </p>

        <p class="mt-3 text-2xl font-bold text-gray-950">
          {{ hasSupabaseAnonKey ? 'Configurada' : 'Por configurar' }}
        </p>

        <p class="mt-2 text-sm text-gray-500">
          Indica se a variável NUXT_PUBLIC_SUPABASE_ANON_KEY já existe.
        </p>
      </div>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-950">
        Próximo passo
      </h2>

      <p class="mt-3 leading-7 text-gray-700">
        Depois de criares o projeto no Supabase e preencheres as variáveis no ficheiro .env,
        esta página deve indicar que a URL e a chave pública estão configuradas.
      </p>

      <p class="mt-3 leading-7 text-gray-700">
        Só depois disso faz sentido começar a migrar sócios, eventos, quotas e publicações
        do localStorage para a base de dados.
      </p>
    </div>
  </UContainer>
</template>