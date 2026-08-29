<template>
  <div class="rounded-2xl border bg-[var(--ccd-soft)] p-4 text-sm text-gray-900 ccd-border-gold">
    <div class="flex gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ccd-gold-gradient text-lg text-black">
        ⚠️
      </div>

      <div>
        <p class="font-semibold">
          Modo demonstração
        </p>

        <p class="mt-1 text-gray-700">
          Os dados desta versão são mockados e ficam guardados apenas no browser através de localStorage.
          Mais tarde, esta informação poderá ser ligada ao Supabase.
        </p>
      </div>
    </div>
  </div>
</template>