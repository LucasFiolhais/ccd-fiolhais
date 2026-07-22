<script setup lang="ts">
defineProps<{
    eventTitle: string
}>()

const submitted = ref(false)

const form = reactive({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    isMember: false,
    notes: ''
})

const errors = reactive({
    name: '',
    email: '',
    phone: '',
    quantity: ''
})

const cleanErrors = () => {
    errors.name= '',
    errors.email= '',
    errors.phone= '',   
    errors.quantity= ''
}

const validateForm = () => {
    cleanErrors()

    if (!form.name.trim()) {
        errors.name = 'O nome é obrigatório.'
    }

    if (!form.email.trim()) {
        errors.email = 'O email é obrigatório.'
    } else if (!form.email.includes('@')) {
        errors.email = 'Insere um email válido.'
    }

    if (!form.phone.trim()) {
        errors.phone = 'O telefone é obrigatório.'
    }

    if (!form.quantity || form.quantity < 1) {
        errors.quantity = 'Escolhe pelo menos 1 lugar.'
    }

    return !errors.name && !errors.email && !errors.phone && !errors.quantity
}

const handleSubmit = () => {
    if (!validateForm()) {
        return
    }
    submitted.value = true
}

const resetForm = () => {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.quantity = 1
    form.isMember = false
    form.notes = ''

    cleanErrors()

    submitted.value = false
}

</script>




<template>
    <UCard>
        <template #header>
            <div>
                <h2 class="text-xl font-bold text-gray-950">
                    Inscrição no Evento
                </h2>

                <p class="mt-1 text-sm text-gray-600">
                    Preenche os dados para reservar o teu lugar.
                </p>
            </div>
        </template>

        <div v-if="submitted" class="rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 class="font-semibold text-green-900">
                Incrição registada com sucesso!
            </h3>

            <p class="mt-2 text-sm text-green-800">
                Esta inscrição ainda é apenas local. Mais tarde será guardada na BD e poderá gerar pagamento por MBWAY ou referencia Multibanco
            </p>

            <UButton class="mt-4" variant="outline" @click="resetForm">
                Fazer nova inscrição
            </UButton>
        </div>
        <form v-else class="space-y-5" @submit.prevent="handleSubmit">

            <UFormField label="Nome Completo" :error="errors.name">

                <UInput v-model="form.name" placeholder="Ex: Ana Carvalho" size="lg"/>

            </UFormField>

            <UFormField label="Email" :error="errors.email">

                <UInput v-model="form.email" type="email" placeholder="email.exemplo.com" size="lg"/>

            </UFormField>

            <UFormField label="Telefone" :error="errors.phone">

                <UInput v-model="form.phone" placeholder="912 345 678" size="lg"/>

            </UFormField>

            <UFormField label="Número de Pessoas" :error="errors.quantity">

                <UInput v-model.number="form.quantity" type="number" min="1" max="10" size="lg"/>

            </UFormField>

            <div class="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
                <input 
                id="isMember"
                v-model="form.isMember"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300"
                >

            <label 
            for="isMember" 
            class="text-sm text-gray-700"
            >
            Sou sócio do CCD Fiolhais
            </label>
            </div>

            <UFormField label="Observações">
                <UTextarea 
                v-model="form.notes"
                 placeholder="Ex: Informação adicional, restrições alimentares, etc."
                 size="lg"
                 />
            </UFormField>

            <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <div clas="flex justify-between gap-4">
                    <span class="text-gray-600">Evento</span>
                    <span class="font-medium text-gray-950">{{ eventTitle }}</span>
                </div>

                <div class="mt-2 flex justify-between gap-4">
                    <span class="text-gray-600">Lugares</span>
                    <span class="font-medium text-gray-950">{{ form.quantity }}</span>
                </div>

                <div class="mt-2 flex justify-between gap-4">
                    <span class="text-gray-600">Tipo</span>
                    <span class="font-medium text-gray-950">
                        {{ form.isMember ? 'Sócio' : 'Não Sócio' }}
                    </span>
                </div>

            </div>

            <UButton type="submit" size="lg" block>
                Confirmar Inscrição
            </UButton>

        </form>

    </UCard>
</template>