<script setup lang="ts">
import { U } from 'vue-router/dist/index-BQLwgiyK.js';

</script>

<template>
  <footer class="border-t border-gray-200 bg-white">
    <UContainer class="py-10">
      <div class="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div class="flex items-center gap-3">
            <img
              src="/images/ccd-logo.png"
              alt="Logótipo do CCD Fiolhais"
              class="h-14 w-auto"
            >

            <div>
              <p class="font-bold text-gray-950">
                CCD Fiolhais
              </p>

              <p class="text-sm text-gray-500">
                Cultura, Desporto e Comunidade
              </p>
            </div>
          </div>

          <p class="mt-4 max-w-md text-sm leading-6 text-gray-600">
            Site oficial do Centro Cultural e Desportivo de Fiolhais para divulgação
            de eventos, gestão de sócios e partilha de memórias da comunidade.
          </p>
        </div>

        <div>
          <h2 class="font-semibold text-gray-950">
            Navegação
          </h2>

          <div class="mt-4 space-y-2 text-sm">
            <NuxtLink
              to="/agenda"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Agenda
            </NuxtLink>

            <NuxtLink
              to="/mural"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Mural
            </NuxtLink>

            <NuxtLink
              to="/socios/aderir"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Tornar-me sócio
            </NuxtLink>

            <NuxtLink
              to="/contactos"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Contactos
            </NuxtLink>
          </div>
        </div>

        <div>
          <h2 class="font-semibold text-gray-950">
            Informação
          </h2>

          <div class="mt-4 space-y-2 text-sm">
            <NuxtLink
              to="/privacidade"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Política de Privacidade
            </NuxtLink>

            <NuxtLink
              to="/termos"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Termos de Utilização
            </NuxtLink>

            <NuxtLink
              to="/admin"
              class="block text-gray-600 transition hover:text-amber-600"
            >
              Administração
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-500">
        © {{ new Date().getFullYear() }} Centro Cultural e Desportivo de Fiolhais.
        Todos os direitos reservados.
      </div>
    </UContainer>
  </footer>
</template>