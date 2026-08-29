<script setup lang="ts">
useHead({
  title: 'Contactos'
})
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Contactos
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          Fala com o CCD Fiolhais
        </h1>

        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
          Entra em contacto com o Centro Cultural e Desportivo de Fiolhais para informações
          sobre sócios, eventos, quotas, iniciativas ou colaboração com a associação.
        </p>
      </UContainer>
    </section>

    <section class="py-16">
      <UContainer>
        <div class="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div class="space-y-6">
            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-gray-950">
                Informações da associação
              </h2>

              <div class="mt-6 space-y-5">
                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Nome
                  </p>

                  <p class="mt-1 text-gray-950">
                    Centro Cultural e Desportivo de Fiolhais
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Email
                  </p>

                  <p class="mt-1 text-gray-950">
                    ccdfiolhais@gmail.com
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Telefone
                  </p>

                  <p class="mt-1 text-gray-950">
                    927 792 028
                  </p>
                </div>

                <div>
                  <p class="text-sm font-semibold text-gray-500">
                    Localidade
                  </p>

                  <p class="mt-1 text-gray-950">
                    Fiolhais, Portugal
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-gray-950">
                Redes sociais
              </h2>

              <p class="mt-3 leading-7 text-gray-700">
                Adiciona aqui as ligações oficiais do CCD Fiolhais, como Facebook,
                Instagram ou outras plataformas usadas pela associação.
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <NuxtLink
                  to="/"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Facebook
                </NuxtLink>

                <NuxtLink
                  to="/"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Instagram
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-950">
              Pedido de contacto
            </h2>

            <p class="mt-3 leading-7 text-gray-700">
              Este formulário ainda está preparado apenas visualmente. Numa fase seguinte,
              pode ser ligado ao Supabase ou a um serviço de email.
            </p>

            <form class="mt-8 space-y-5">
              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Nome
                </label>

                <input
                  type="text"
                  placeholder="O teu nome"
                  class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Mensagem
                </label>

                <textarea
                  rows="6"
                  placeholder="Escreve a tua mensagem..."
                  class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <button
                type="button"
                class="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
              >
                Enviar mensagem
              </button>
            </form>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>