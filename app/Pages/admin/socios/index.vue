<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const members = [
  {
    number: '001',
    name: 'Ana Carvalho',
    email: 'ana@email.com',
    phone: '912 345 678',
    status: 'Ativo',
    quota: 'Pago'
  },
  {
    number: '002',
    name: 'João Martins',
    email: 'joao@email.com',
    phone: '913 456 789',
    status: 'Pendente',
    quota: 'Em atraso'
  }
]
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Sócios
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão de sócios
        </h1>

        <p class="mt-2 text-gray-600">
          Lista de sócios, contactos, estado e situação das quotas.
        </p>
      </div>

      <UButton>
        Novo sócio
      </UButton>
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="px-4 py-3 font-medium">Nº</th>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Telefone</th>
              <th class="px-4 py-3 font-medium">Estado</th>
              <th class="px-4 py-3 font-medium">Quota</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="member in members"
              :key="member.number"
            >
              <td class="px-4 py-4 font-medium text-gray-950">
                {{ member.number }}
              </td>

              <td class="px-4 py-4 text-gray-700">
                {{ member.name }}
              </td>

              <td class="px-4 py-4 text-gray-700">
                {{ member.email }}
              </td>

              <td class="px-4 py-4 text-gray-700">
                {{ member.phone }}
              </td>

              <td class="px-4 py-4">
                <UBadge
                  :color="member.status === 'Ativo' ? 'success' : 'warning'"
                  variant="soft"
                >
                  {{ member.status }}
                </UBadge>
              </td>

              <td class="px-4 py-4">
                <UBadge
                  :color="member.quota === 'Pago' ? 'success' : 'error'"
                  variant="soft"
                >
                  {{ member.quota }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </UContainer>
</template>