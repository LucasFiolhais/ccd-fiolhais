<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const quotas = [
  {
    year: 2026,
    total: 120,
    paid: 82,
    pending: 38
  },
  {
    year: 2025,
    total: 110,
    paid: 104,
    pending: 6
  }
]
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Quotas
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão de quotas
        </h1>

        <p class="mt-2 text-gray-600">
          Acompanhar pagamentos anuais e identificar quotas em atraso.
        </p>
      </div>

      <UButton>
        Gerar quotas
      </UButton>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UCard
        v-for="quota in quotas"
        :key="quota.year"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-950">
              Quotas {{ quota.year }}
            </h2>

            <UBadge variant="soft">
              {{ quota.pending }} pendentes
            </UBadge>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Total
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ quota.total }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Pagas
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ quota.paid }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Pendentes
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ quota.pending }}
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton variant="outline">
              Ver detalhes
            </UButton>

            <UButton variant="soft">
              Avisar pendentes
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>