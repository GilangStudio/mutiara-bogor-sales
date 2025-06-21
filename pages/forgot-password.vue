<template>
    <div class="mobile-container">
        <div class="h-screen bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
            <!-- Back Button - Top Left -->
            <div class="p-4">
                <NuxtLink to="/login"
                    class="inline-flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
            </div>

            <!-- Main Content -->
            <div class="flex items-center justify-center px-4 pb-4" style="height: calc(100vh - 80px);">
                <div class="w-full max-w-sm space-y-6">
                    <!-- Header -->
                    <div class="text-center space-y-2">
                        <div
                            class="w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound class="h-10 w-10 text-primary" />
                        </div>
                        <h1 class="text-2xl font-bold text-foreground">Lupa Password?</h1>
                        <p class="text-muted-foreground">Masukkan nomor telepon untuk reset password</p>
                    </div>

                    <!-- Reset Form -->
                    <form @submit.prevent="handleResetPassword" class="space-y-4">
                        <!-- Phone Number Input -->
                        <div class="space-y-2">
                            <label for="phone" class="text-sm font-medium text-foreground">
                                Nomor Telepon
                            </label>
                            <div class="relative">
                                <Phone
                                    class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input id="phone" v-model="form.phone" type="tel" placeholder="08123456789" autocomplete="off"
                                    class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.phone,
                                        'border-border': !errors.phone
                                    }" required />
                            </div>
                            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
                        </div>

                        <!-- Success Message -->
                        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600" />
                                <p class="text-sm text-green-700">{{ successMessage }}</p>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <AlertCircle class="h-4 w-4 text-destructive" />
                                <p class="text-sm text-destructive">{{ errorMessage }}</p>
                            </div>
                        </div>

                        <!-- Reset Button -->
                        <button type="submit" :disabled="isLoading || !isFormValid"
                            class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90">
                            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                            <KeyRound v-else class="h-4 w-4" />
                            {{ isLoading ? 'Mengirim...' : 'Kirim Link Reset' }}
                        </button>
                    </form>

                    <!-- Footer -->
                    <div class="text-center space-y-2">
                        <p class="text-xs text-muted-foreground">
                            Link reset password akan dikirim melalui SMS
                        </p>
                        <p class="text-sm text-muted-foreground">
                            Sudah ingat password?
                            <NuxtLink to="/login" class="text-primary hover:underline font-medium">
                                Masuk sekarang
                            </NuxtLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, KeyRound, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next'

// Middleware untuk guest only
definePageMeta({
    middleware: 'guest',
    layout: false
})

// Reactive data
const form = reactive({
    phone: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const errors = reactive({
    phone: ''
})

// Computed
const isFormValid = computed(() => {
    return form.phone.trim() !== ''
})

// Methods
const validateForm = () => {
    errors.phone = ''
    errorMessage.value = ''
    successMessage.value = ''

    let isValid = true

    if (!form.phone.trim()) {
        errors.phone = 'Nomor telepon wajib diisi'
        isValid = false
    } else if (!/^08\d{8,13}$/.test(form.phone)) {
        errors.phone = 'Format nomor telepon tidak valid'
        isValid = false
    }

    return isValid
}

const handleResetPassword = async () => {
    if (!validateForm()) return

    isLoading.value = true

    try {
        const config = useRuntimeConfig()
        const { $fetch } = useNuxtApp()

        // TODO: Implement forgot password API call
        // const response = await $fetch(`${config.public.apiBase}/forgot-password`, {
        //   method: 'POST',
        //   body: {
        //     phone: form.phone
        //   }
        // })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        successMessage.value = 'Link reset password telah dikirim ke nomor telepon Anda'
        form.phone = ''

    } catch (error: any) {
        console.error('Forgot password error:', error)
        errorMessage.value = error.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
    } finally {
        isLoading.value = false
    }
}

// Head meta
useHead({
    title: 'Lupa Password - CRM Sales',
    meta: [
        { name: 'description', content: 'Reset password akun CRM Sales Anda' }
    ]
})
</script>