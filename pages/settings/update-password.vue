<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header with Back Button -->
            <div class="mb-6 flex items-center gap-3">
                <button @click="$router.back()" class="p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </button>
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Ubah Password</h1>
                    <p class="text-muted-foreground">Buat password baru untuk akun Anda</p>
                </div>
            </div>

            <!-- Security Notice -->
            <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div class="flex items-start gap-3">
                    <Shield class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 class="font-medium text-blue-800 dark:text-blue-200 mb-1">Informasi</h3>
                        <p class="text-sm text-blue-700 dark:text-blue-300">
                            Setelah password diubah, Anda akan otomatis keluar dan perlu login kembali dengan password baru.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Update Password Form -->
            <div class="bg-card border border-border rounded-lg p-6 mb-6">
                <form @submit.prevent="handleUpdatePassword" class="space-y-4">
                    <!-- Current Password Field -->
                    <div class="space-y-2">
                        <label for="currentPassword" class="text-sm font-medium text-foreground">
                            Password Saat Ini
                        </label>
                        <div class="relative">
                            <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                id="currentPassword" 
                                v-model="form.currentPassword" 
                                :type="showCurrentPassword ? 'text' : 'password'"
                                placeholder="Masukkan password saat ini"
                                class="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.currentPassword,
                                    'border-border': !errors.currentPassword
                                }" 
                                required 
                            />
                            <button 
                                type="button" 
                                @click="showCurrentPassword = !showCurrentPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <EyeOff v-if="showCurrentPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p v-if="errors.currentPassword" class="text-sm text-destructive">{{ errors.currentPassword }}</p>
                    </div>

                    <!-- New Password Field -->
                    <div class="space-y-2">
                        <label for="newPassword" class="text-sm font-medium text-foreground">
                            Password Baru
                        </label>
                        <div class="relative">
                            <KeyRound class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                id="newPassword" 
                                v-model="form.newPassword" 
                                :type="showNewPassword ? 'text' : 'password'"
                                placeholder="Masukkan password baru"
                                class="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.newPassword,
                                    'border-border': !errors.newPassword
                                }" 
                                required 
                            />
                            <button 
                                type="button" 
                                @click="showNewPassword = !showNewPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <EyeOff v-if="showNewPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p v-if="errors.newPassword" class="text-sm text-destructive">{{ errors.newPassword }}</p>
                    </div>

                    <!-- Confirm New Password Field -->
                    <div class="space-y-2">
                        <label for="confirmPassword" class="text-sm font-medium text-foreground">
                            Konfirmasi Password Baru
                        </label>
                        <div class="relative">
                            <CheckCircle class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                id="confirmPassword" 
                                v-model="form.confirmPassword" 
                                :type="showConfirmPassword ? 'text' : 'password'"
                                placeholder="Konfirmasi password baru"
                                class="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.confirmPassword,
                                    'border-border': !errors.confirmPassword
                                }" 
                                required 
                            />
                            <button 
                                type="button" 
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p v-if="errors.confirmPassword" class="text-sm text-destructive">{{ errors.confirmPassword }}</p>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div class="flex items-center gap-2">
                            <AlertCircle class="h-4 w-4 text-destructive" />
                            <p class="text-sm text-destructive">{{ errorMessage }}</p>
                        </div>
                    </div>

                    <!-- Update Button -->
                    <button 
                        type="submit" 
                        :disabled="isLoading || !isFormValid"
                        class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                        <KeyRound v-else class="h-4 w-4" />
                        {{ isLoading ? 'Memperbarui...' : 'Ubah Password' }}
                    </button>
                </form>
            </div>

            <!-- Security Tips -->
            <div class="bg-card border border-border rounded-lg p-4">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                    <Shield class="h-4 w-4 text-primary" />
                    Tips Keamanan
                </h3>
                <ul class="text-sm text-muted-foreground space-y-2">
                    <li class="flex items-start gap-2">
                        <div class="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        Gunakan password yang mudah Anda ingat
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        Pastikan password berbeda dari password saat ini
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        Simpan password di tempat yang aman
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        Jangan bagikan password kepada orang lain
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle,
    Shield,
    AlertCircle,
    Loader2,
    Info
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Form data
const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Show/hide password states
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')
const errors = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Computed properties
const isFormValid = computed(() => {
    return form.currentPassword.trim() !== '' &&
           form.newPassword.trim() !== '' &&
           form.confirmPassword.trim() !== '' &&
           form.newPassword === form.confirmPassword
})

// Methods
const validateForm = () => {
    // Clear previous errors
    errors.currentPassword = ''
    errors.newPassword = ''
    errors.confirmPassword = ''
    errorMessage.value = ''

    let isValid = true

    if (!form.currentPassword.trim()) {
        errors.currentPassword = 'Password saat ini wajib diisi'
        isValid = false
    }

    if (!form.newPassword.trim()) {
        errors.newPassword = 'Password baru wajib diisi'
        isValid = false
    }

    if (!form.confirmPassword.trim()) {
        errors.confirmPassword = 'Konfirmasi password wajib diisi'
        isValid = false
    } else if (form.newPassword !== form.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak sesuai'
        isValid = false
    }

    if (form.currentPassword === form.newPassword) {
        errors.newPassword = 'Password baru harus berbeda dari password saat ini'
        isValid = false
    }

    return isValid
}

const handleUpdatePassword = async () => {
    if (!validateForm()) return

    isLoading.value = true

    try {
        const config = useRuntimeConfig()
        const { $api } = useNuxtApp()

        // API call to update password
        const response = await $api('/update_password', {
            method: 'POST',
            body: {
                current_password: form.currentPassword,
                new_password: form.newPassword
            }
        })

        if (response.status === 'success') {
            // Show success message
            toast.passwordChanged()
            
            // Clear form
            form.currentPassword = ''
            form.newPassword = ''
            form.confirmPassword = ''
            
            // Wait a moment for user to see the success message
            setTimeout(async () => {
                // Logout user since API clears the token
                await authStore.logout()
                
                // Show info about re-login
                toast.info('Silakan login kembali dengan password baru Anda', 'Login Diperlukan', { duration: 8000 })
            }, 2000)
            
        } else {
            throw new Error(response.message || 'Gagal mengubah password')
        }

    } catch (error: any) {
        console.error('Update password error:', error)
        
        if (error.status === 401) {
            errorMessage.value = 'Password saat ini tidak valid'
        } else {
            errorMessage.value = error.data?.message || error.message || 'Terjadi kesalahan saat mengubah password'
        }
    } finally {
        isLoading.value = false
    }
}

useHead({
    title: 'Ubah Password - CRM Sales'
})
</script>