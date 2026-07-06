<template>
    <header class="border-b border-gray-200 bg-white/90 backdrop-blur">
        <UContainer class="flex h-12 items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white font-bold">
                    CCD
                </div>

                <div>
                    <p class="font-bold leading-tight">CCD Fiolhais</p>
                    <p class="text-xs text-gray-500">Cultura, Desporto e Comunidade</p>
                </div>
            </NuxtLink>

            <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
                <NuxtLink to="/" class="hover:text-primary">
                    Início
                </NuxtLink>

                <NuxtLink to="/agenda" class="hover:text-primary">
                    Agenda
                </NuxtLink>

                <NuxtLink to="/mural" class="hover:text-primary">
                    Mural
                </NuxtLink>

                <NuxtLink to="/area-socio" class="hover:text-primary">
                    Área do Sócio
                </NuxtLink>
            </nav>

            <div class="hidden items-center gap-3 md:flex">
                <UButton to="/socios/aderir" variant="outline">
                    Tornar-me Sócio
                </UButton>
            </div>
            
        </UContainer>
    </header>
</template>