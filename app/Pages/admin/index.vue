<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const stats = [
  {
    label: 'Sócios',
    value: 0,
    description: 'Total de sócios registados'
  },
  {
    label: 'Eventos',
    value: 3,
    description: 'Eventos criados no sistema'
  },
  {
    label: 'Inscrições',
    value: 0,
    description: 'Inscrições em eventos'
  },
  {
    label: 'Quotas em atraso',
    value: 0,
    description: 'Pagamentos pendentes'
  }
]

const recentActions = [
  'Estrutura inicial do backoffice criada',
  'Página de eventos disponível',
  'Formulário de inscrição em eventos criado',
  'Página de adesão de sócio criada'
]
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Dashboard
      </p>

      <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-950">
        Painel de administração
      </h1>

      <p class="mt-2 text-gray-600">
        Visão geral da gestão de sócios, eventos, quotas e inscrições.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :description="stat.description"
      />
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold text-gray-950">
            Próximos passos
          </h2>
        </template>

        <div class="space-y-4">
          <div class="rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-950">
              Gestão de sócios
            </h3>

            <p class="mt-1 text-sm text-gray-600">
              Criar lista de sócios, filtros, ficha individual e estado das quotas.
            </p>
          </div>

          <div class="rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-950">
              Gestão de eventos
            </h3>

            <p class="mt-1 text-sm text-gray-600">
              Criar e editar eventos, consultar inscritos e marcar pagamentos.
            </p>
          </div>

          <div class="rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-950">
              Base de dados
            </h3>

            <p class="mt-1 text-sm text-gray-600">
              Ligar o projeto ao Supabase para guardar sócios, eventos e inscrições.
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-bold text-gray-950">
            Atividade recente
          </h2>
        </template>

        <ul class="space-y-3">
          <li
            v-for="action in recentActions"
            :key="action"
            class="rounded-xl bg-gray-50 p-3 text-sm text-gray-700"
          >
            {{ action }}
          </li>
        </ul>
      </UCard>
    </div>
  </UContainer>
</template>