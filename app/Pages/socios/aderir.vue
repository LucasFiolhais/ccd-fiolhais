<script setup lang="ts">
const benefits = [
  {
    title: 'Apoiar a comunidade',
    description: 'A tua inscrição ajuda o CCD a organizar eventos, convívios e iniciativas locais.',
    emoji: '🤝'
  },
  {
    title: 'Manter tradições vivas',
    description: 'Ser sócio é contribuir para preservar festas, encontros e costumes de Fiolhais.',
    emoji: '🌿'
  },
  {
    title: 'Participar mais de perto',
    description: 'No futuro, poderás consultar quotas, dados pessoais e inscrições na área do sócio.',
    emoji: '🎟️'
  }
]
</script>

<template>
  <div>
    <section class="bg-gray-50">
      <UContainer class="grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">
            Sócios
          </p>

          <h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Torne-se sócio do CCD de Fiolhais
          </h1>

          <p class="mt-5 text-lg leading-8 text-gray-600">
            Ser sócio é ajudar a manter viva a atividade cultural, desportiva e comunitária
            de Fiolhais. A tua participação ajuda a associação a organizar eventos,
            preservar tradições e criar novos momentos de encontro.
          </p>

          <div class="mt-8 grid gap-4">
            <UCard
              v-for="benefit in benefits"
              :key="benefit.title"
            >
              <div class="flex gap-4">
                <div class="text-3xl">
                  {{ benefit.emoji }}
                </div>

                <div>
                  <h2 class="font-bold text-gray-950">
                    {{ benefit.title }}
                  </h2>

                  <p class="mt-1 text-sm text-gray-600">
                    {{ benefit.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <PublicMemberSignupForm />
      </UContainer>
    </section>

    <section class="py-16">
      <UContainer>
        <div class="grid gap-6 md:grid-cols-3">
          <UCard>
            <template #header>
              Pedido online
            </template>

            <p class="text-sm text-gray-600">
              O interessado preenche o formulário diretamente no site.
            </p>
          </UCard>

          <UCard>
            <template #header>
              Validação pela direção
            </template>

            <p class="text-sm text-gray-600">
              Mais tarde, a administração poderá aprovar ou rejeitar pedidos no backoffice.
            </p>
          </UCard>

          <UCard>
            <template #header>
              Área do sócio
            </template>

            <p class="text-sm text-gray-600">
              No futuro, cada sócio poderá consultar os seus dados, quotas e inscrições.
            </p>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>