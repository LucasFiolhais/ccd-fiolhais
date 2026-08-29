<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'pt-PT'
  },
  titleTemplate: (title) => {
    return title ? `${title} · CCD Fiolhais` : 'CCD Fiolhais'
  },
  meta: [
    {
      name: 'description',
      content: 'Plataforma web do Centro Cultural e Desportivo de Fiolhais para eventos, sócios, quotas e mural da comunidade.'
    },
    {
      name: 'theme-color',
      content: '#c99a1e'
    },
    {
      property: 'og:title',
      content: 'Centro Cultural e Desportivo de Fiolhais'
    },
    {
      property: 'og:description',
      content: 'Site público e backoffice de demonstração para gestão comunitária do CCD de Fiolhais.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>