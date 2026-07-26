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
  <aside class="flex min-h-screen w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
    <div class="border-b border-gray-200 p-6">
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3"
      >
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          CCD
        </div>

        <div>
          <p class="font-bold text-gray-950">
            Backoffice
          </p>

          <p class="text-xs text-gray-500">
            CCD Fiolhais
          </p>
        </div>
      </NuxtLink>
    </div>

    <nav class="flex-1 space-y-1 p-4">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block rounded-xl px-4 py-3 text-sm font-medium transition"
        :class="isActive(link.to)
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="border-t border-gray-200 p-4">
      <UButton
        to="/"
        variant="outline"
        block
      >
        Ver site público
      </UButton>
    </div>
  </aside>
</template>