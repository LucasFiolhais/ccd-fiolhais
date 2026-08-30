<script setup lang="ts">
const route = useRoute()

const links = [
  {
    label: 'Dashboard',
    to: '/admin'
  },
  {
    label: 'Sócios',
    to: '/admin/socios'
  },
  {
    label: 'Eventos',
    to: '/admin/eventos'
  },
  {
    label: 'Quotas',
    to: '/admin/quotas'
  },
  {
    label: 'Mural',
    to: '/admin/mural'
  },
  {
    label: 'Sistema',
    to: '/admin/sistema'
  }
]

const isActive = (to: string) => {
  if (to === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(to)
}
</script>

<template>
  <aside class="hidden min-h-screen w-72 border-r border-gray-800 bg-[var(--ccd-black)] p-5 text-white lg:flex lg:flex-col">
    <NuxtLink
      to="/admin"
      class="flex items-center gap-3"
    >
      <img
        src="/images/ccd-logo.png"
        alt="Logótipo do CCD Fiolhais"
        class="h-16 w-auto"
      >

      <div>
        <p class="font-bold leading-tight">
          CCD Fiolhais
        </p>

        <p class="text-xs text-gray-400">
          Backoffice
        </p>
      </div>
    </NuxtLink>

    <nav class="mt-10 space-y-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block rounded-xl px-4 py-3 text-sm font-medium transition"
        :class="isActive(link.to)
          ? 'ccd-gold-gradient text-black'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="mt-auto">
      <UButton
        to="/"
        variant="outline"
        block
        class="border-amber-500 text-amber-300 hover:bg-amber-500 hover:text-black"
      >
        Ver site público
      </UButton>
    </div>
  </aside>
</template>