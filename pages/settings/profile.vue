<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header with Back Button -->
            <div class="mb-6 flex items-center gap-3">
                <button @click="$router.back()" class="p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </button>
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Edit Profil</h1>
                    <p class="text-muted-foreground">Kelola informasi akun Anda</p>
                </div>
            </div>

            <!-- Profile Card -->
            <div class="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-6 mb-6">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center relative">
                        <User class="h-10 w-10 text-primary-foreground" />
                        <div
                            class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background">
                        </div>
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold text-foreground">{{ authStore.user?.name || 'Nama Pengguna' }}
                        </h2>
                        <p class="text-muted-foreground">{{ authStore.user?.phone || 'No. Telepon' }}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span class="text-sm text-green-600 font-medium">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Form -->
            <div class="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 class="font-semibold mb-4">Informasi Personal</h3>

                <form @submit.prevent="handleSaveProfile" class="space-y-4">
                    <!-- Name Input -->
                    <div class="space-y-2">
                        <label for="name" class="text-sm font-medium text-foreground">
                            Nama Lengkap
                        </label>
                        <input id="name" v-model="profileForm.name" type="text" placeholder="Masukkan nama lengkap"
                            class="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            required />
                    </div>

                    <!-- Phone Input (Read Only) -->
                    <div class="space-y-2">
                        <label for="phone" class="text-sm font-medium text-foreground">
                            Nomor Telepon
                        </label>
                        <input id="phone" :value="authStore.user?.phone" type="tel" readonly
                            class="w-full px-3 py-3 bg-muted border border-border rounded-lg cursor-not-allowed opacity-60" />
                        <p class="text-xs text-muted-foreground">Nomor telepon tidak dapat diubah</p>
                    </div>

                    <!-- Email Input -->
                    <div class="space-y-2">
                        <label for="email" class="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input id="email" v-model="profileForm.email" type="email" placeholder="Masukkan email"
                            class="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>

                    <!-- Save Button -->
                    <button type="submit" :disabled="isSaving"
                        class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
                        <span v-else>Simpan Perubahan</span>
                    </button>
                </form>
            </div>

            <!-- Security Settings -->
            <div class="space-y-3">
                <h3 class="text-lg font-semibold text-foreground">Keamanan & Privasi</h3>

                <div
                    class="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Key class="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <div class="font-medium">Ubah Password</div>
                            <div class="text-sm text-muted-foreground">Perbarui password akun</div>
                        </div>
                    </div>
                    <ChevronRight class="h-4 w-4 text-muted-foreground" />
                </div>

                <div
                    class="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield class="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div class="font-medium">Keamanan Akun</div>
                            <div class="text-sm text-muted-foreground">Two-factor authentication</div>
                        </div>
                    </div>
                    <ChevronRight class="h-4 w-4 text-muted-foreground" />
                </div>

                <div
                    class="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Database class="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <div class="font-medium">Data & Privasi</div>
                            <div class="text-sm text-muted-foreground">Kelola data pribadi</div>
                        </div>
                    </div>
                    <ChevronRight class="h-4 w-4 text-muted-foreground" />
                </div>
            </div>

            <!-- Activity Log -->
            <div class="bg-card border border-border rounded-lg p-4 mt-6">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                    <Activity class="h-4 w-4 text-primary" />
                    Aktivitas Terakhir
                </h3>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <LogIn class="h-4 w-4 text-blue-600" />
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium">Login terakhir</div>
                            <div class="text-xs text-muted-foreground">{{ formatDate(new Date()) }}</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCheck class="h-4 w-4 text-green-600" />
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium">Profil diperbarui</div>
                            <div class="text-xs text-muted-foreground">1 minggu yang lalu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft,
    User,
    Key,
    Shield,
    Database,
    ChevronRight,
    Activity,
    LogIn,
    UserCheck,
    Loader2
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const authStore = useAuthStore()

// Form data
const profileForm = reactive({
    name: '',
    email: ''
})

const isSaving = ref(false)

// Initialize form with user data
onMounted(() => {
    if (authStore.user) {
        profileForm.name = authStore.user.name
        profileForm.email = authStore.user.email
    }
})

// Watch for user data changes
watch(() => authStore.user, (newUser) => {
    if (newUser) {
        profileForm.name = newUser.name
        profileForm.email = newUser.email
    }
})

// Handle save profile
const handleSaveProfile = async () => {
    isSaving.value = true

    try {
        // TODO: Implement API call to update profile
        // const config = useRuntimeConfig()
        // const { $fetch } = useNuxtApp()
        // 
        // await $fetch(`${config.public.apiBase}/profile`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${authStore.token}`
        //   },
        //   body: {
        //     name: profileForm.name,
        //     email: profileForm.email
        //   }
        // })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Update user data in store
        if (authStore.user) {
            authStore.user.name = profileForm.name
            authStore.user.email = profileForm.email

            // Update localStorage
            if (process.client) {
                localStorage.setItem('user_data', JSON.stringify(authStore.user))
            }
        }

        // Show success message (you can implement toast notification here)
        console.log('Profil berhasil diperbarui')

    } catch (error) {
        console.error('Error updating profile:', error)
        // Show error message
    } finally {
        isSaving.value = false
    }
}

// Format date helper
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

useHead({
    title: 'Edit Profil - CRM Sales'
})
</script>