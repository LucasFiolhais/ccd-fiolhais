<script setup lang="ts">
import { U } from 'vue-router/dist/index-BQLwgiyK.js';

</script>

<template>
    <footer class="mt-20 border-t border-gray-200 bg-gray-50">
        <UContainer class="grid gap-8 py-10 md:grid-cols-3">
            <div>
                <h2 class="font-bold">CCD Fiolhais</h2>
                <p class="mt-3 text-sm text-gray-600">
                    Centro Cultural e Desportivo de Fiolhais, uma associação dedicada à comunidade, às tradições e à organização de eventos em Fiolhais.
                </p>
            </div>

            <div>
                <h3 class="font-semibold">Navegação</h3>
                <ul class="mt-3 space-y-2 text-sm text-gray-600">
                    <li>
                        <NuxtLink to="/agenda" class="hover:text-primary">Agenda de Eventos</NuxtLink>
                    </li>

                    <li>
                        <NuxtLink to="/socios/aderir" class="hover:text-primary">Tornar-me Sócio</NuxtLink>
                    </li>

                    <li>
                        <NuxtLink to="/mural" class="hover:text-primary">Mural de Fiolhais</NuxtLink>
                    </li>
                </ul>
            </div>

            <div>
                <h3 class="font-semibold">Contactos</h3>
                <p class="mt-3 text-sm text-gray-600">Fiolhais, Santa Marta de Penaguião, Portugal</p>
                <p class="mt-2 text-sm text-gray-600">Email: ccdfiolhais@gmail.com</p>
            </div>
        </UContainer>

        <div class="border-t border-gray-200">
            <UContainer class="py-4 text-sm text-gray-500">
            © {{ new Date().getFullYear() }} Centro Cultural e Desportivo de Fiolhais. Todos os direitos reservados.
            </UContainer>
        </div>
    
    </footer>
</template>