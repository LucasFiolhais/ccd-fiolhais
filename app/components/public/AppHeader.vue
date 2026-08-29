<script setup lang="ts">
const route = useRoute()

const links = [
  {
    label: 'Início',
    to: '/'
  },
  {
    label: 'Agenda',
    to: '/agenda'
  },
  {
    label: 'Sócios',
    to: '/socios/aderir'
  },
  {
    label: 'Mural',
    to: '/mural'
  },
  {
    label: 'Área do Sócio',
    to: '/area-socio'
  },
  {
    label: 'Contactos',
    to: '/contactos'
  }
]

const isActive = (to: string) => {
  if (to === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(to)
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white/95 backdrop-blur">
    <UContainer class="flex h-24 items-center justify-between">
      <NuxtLink
        to="/"
        class="flex items-center gap-4"
      >
        <img
          src="/images/ccd-logo.png"
          alt="Logótipo do Centro Cultural e Desportivo de Fiolhais"
          class="h-16 w-auto"
        >

        <div>
          <p class="font-bold leading-tight text-gray-950">
            CCD Fiolhais
          </p>

          <p class="text-xs text-gray-500">
            Cultura, Desporto e Comunidade
          </p>
        </div>
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="transition hover:text-amber-600"
          :class="isActive(link.to) ? 'ccd-text-gold' : 'text-gray-700'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <UButton
          to="/socios/aderir"
          variant="outline"
        >
          Tornar-me sócio
        </UButton>

        <UButton to="/admin">
          Admin
        </UButton>
      </div>
    </UContainer>
  </header>
</template>