<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="flex min-h-screen">
      <AdminAppSidebar />

      <div class="min-w-0 flex-1">
        <header class="border-b border-gray-200 bg-white">
          <UContainer class="flex h-16 items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">
                Administração
              </p>

              <p class="font-semibold text-gray-950">
                Centro Cultural e Desportivo de Fiolhais
              </p>
            </div>

            <UButton
              to="/"
              variant="ghost"
            >
              Site público
            </UButton>
          </UContainer>
        </header>

        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>