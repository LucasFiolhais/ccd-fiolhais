<script setup lang="ts">
import AppSidebar from '~/components/admin/AppSidebar.vue'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'

const {
  profile,
  isAdmin,
  loadUser,
  signOut
} = useSupabaseAuth()

const isCheckingAuth = ref(true)

onMounted(async () => {
  await loadUser()

  if (!isAdmin.value) {
    await navigateTo('/admin/login')
    return
  }

  isCheckingAuth.value = false
})

const handleLogout = async () => {
  await signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div
    v-if="isCheckingAuth"
    class="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900"
  >
    <div class="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <p class="text-lg font-bold text-gray-950">
        A verificar acesso...
      </p>

      <p class="mt-2 text-sm text-gray-600">
        Estamos a confirmar a tua sessão de administração.
      </p>
    </div>
  </div>

  <div
    v-else-if="isAdmin"
    class="min-h-screen bg-gray-50 text-gray-900"
  >
    <div class="flex min-h-screen">
      <AppSidebar />

      <div class="admin-light-theme min-w-0 flex-1 bg-gray-50">
        <header class="border-b border-gray-200 bg-white">
          <UContainer class="flex h-16 items-center justify-between gap-4">
            <div>
              <p class="text-sm text-gray-500">
                Administração
              </p>

              <p class="font-semibold text-gray-950">
                Centro Cultural e Desportivo de Fiolhais
              </p>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden text-right md:block">
                <p class="text-sm font-semibold text-gray-950">
                  {{ profile?.full_name }}
                </p>

                <p class="text-xs text-gray-500">
                  {{ profile?.role }}
                </p>
              </div>

              <UButton
                to="/"
                variant="ghost"
              >
                Site público
              </UButton>

              <button
                type="button"
                class="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                @click="handleLogout"
              >
                Sair
              </button>
            </div>
          </UContainer>
        </header>

        <UContainer class="pt-6">
          <SharedMockDataNotice />
        </UContainer>

        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>