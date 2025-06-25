<template>
    <!-- <div class="min-h-screen p-4"> -->
    <div class="p-4" style="min-height: calc(100vh - 100px);">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-foreground mb-2">Pengaturan</h1>
                <p class="text-muted-foreground">Kelola akun dan preferensi aplikasi</p>
            </div>

            <!-- Settings Sections -->
            <div class="space-y-6">

                <!-- Account Section -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <UserIcon class="h-4 w-4 text-primary" />
                        Akun & Profil
                    </h3>
                    <div class="space-y-3">
                        <NuxtLink to="/settings/profile" class="block">
                            <div
                                class="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                                <div v-if="authStore.user">
                                    <div class="text-sm font-medium">{{ authStore.user.name }}</div>
                                    <div class="text-xs text-muted-foreground">{{ authStore.user.phone }}</div>
                                </div>
                                <ChevronRight class="h-4 w-4 text-muted-foreground" />
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Appearance Section (Dark Mode Only) -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-4 flex items-center gap-2">
                        <Palette class="h-4 w-4 text-primary" />
                        Tampilan
                    </h3>

                    <!-- Dark Mode Toggle -->
                    <div class="p-3 border border-border rounded-lg">
                        <!-- Theme Mode Options -->
                        <div class="space-y-2">
                            <div @click="setColorMode('light')"
                                class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                                :class="colorMode.value === 'light' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'">
                                <div class="flex items-center gap-3">
                                    <Sun class="h-4 w-4 text-yellow-500" />
                                    <span class="text-sm">Mode Terang</span>
                                </div>
                                <div v-if="colorMode.value === 'light'"
                                    class="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <Check class="h-2.5 w-2.5 text-primary-foreground" />
                                </div>
                            </div>

                            <div @click="setColorMode('dark')"
                                class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                                :class="colorMode.value === 'dark' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'">
                                <div class="flex items-center gap-3">
                                    <Moon class="h-4 w-4 text-blue-500" />
                                    <span class="text-sm">Mode Gelap</span>
                                </div>
                                <div v-if="colorMode.value === 'dark'"
                                    class="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <Check class="h-2.5 w-2.5 text-primary-foreground" />
                                </div>
                            </div>

                            <div @click="setColorMode('system')"
                                class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                                :class="colorMode.value === 'system' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'">
                                <div class="flex items-center gap-3">
                                    <Monitor class="h-4 w-4 text-purple-500" />
                                    <div>
                                        <div class="text-sm">Ikuti Sistem</div>
                                        <div class="text-xs text-muted-foreground">{{ systemThemeText }}</div>
                                    </div>
                                </div>
                                <div v-if="colorMode.value === 'system'"
                                    class="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <Check class="h-2.5 w-2.5 text-primary-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- App Preferences Section -->
                <!-- <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <Settings class="h-4 w-4 text-primary" />
                        Preferensi Aplikasi
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-2">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Bell class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div class="text-sm font-medium">Notifikasi Push</div>
                                    <div class="text-xs text-muted-foreground">Notifikasi untuk leads baru</div>
                                </div>
                            </div>
                            <button @click="toggleNotification"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                :class="notificationEnabled ? 'bg-primary' : 'bg-muted'">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                    :class="notificationEnabled ? 'translate-x-6' : 'translate-x-1'" />
                            </button>
                        </div>

                        <div @click="clearCache"
                            class="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <HardDrive class="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div class="text-sm font-medium">Penyimpanan</div>
                                    <div class="text-xs text-muted-foreground">Cache dan data offline</div>
                                </div>
                            </div>
                            <button class="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                                Bersihkan
                            </button>
                        </div>
                    </div>
                </div> -->

                <!-- Support & About Section -->
                <!-- <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <HelpCircle class="h-4 w-4 text-primary" />
                        Bantuan & Informasi
                    </h3>
                    <div class="space-y-3">
                        <div @click="showGuide"
                            class="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                    <BookOpen class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <span class="text-sm">Panduan Penggunaan</span>
                            </div>
                            <ChevronRight class="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div @click="contactSupport"
                            class="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <MessageCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span class="text-sm">Hubungi Support</span>
                            </div>
                            <ChevronRight class="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div @click="showVersionInfo"
                            class="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Info class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <div class="text-sm font-medium">Versi Aplikasi</div>
                                    <div class="text-xs text-muted-foreground">v1.0.0 (Build 001)</div>
                                </div>
                            </div>
                            <ExternalLink class="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </div> -->

                <!-- Danger Zone -->
                <!-- <div class="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <h3 class="font-semibold mb-4 flex items-center gap-2 text-destructive">
                        <AlertTriangle class="h-4 w-4" />
                        Zona Berbahaya
                    </h3>
                    <div class="space-y-3">
                        <button @click="handleLogout"
                            class="w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
                            <LogOut class="h-4 w-4" />
                            Keluar dari Akun
                        </button>
                    </div>
                </div> -->

                <button @click="handleLogout"
                    class="w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
                    <LogOut class="h-4 w-4" />
                    Keluar dari Akun
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Settings,
    Bell,
    Palette,
    ChevronRight,
    Info,
    User as UserIcon,
    HelpCircle,
    AlertTriangle,
    ExternalLink,
    Moon,
    Sun,
    Monitor,
    Check,
    HardDrive,
    BookOpen,
    MessageCircle,
    LogOut
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const toastStore = useToastStore()

// Color mode for dark/light toggle
const colorMode = useColorMode()

// App preferences state
const notificationEnabled = ref(true)

// System theme detection
const systemTheme = ref('light')
const systemThemeText = computed(() => {
    return `Saat ini: ${systemTheme.value === 'dark' ? 'gelap' : 'terang'}`
})

// Detect system theme preference
const detectSystemTheme = () => {
    if (process.client) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

        // Listen for system theme changes
        mediaQuery.addEventListener('change', (e) => {
            systemTheme.value = e.matches ? 'dark' : 'light'
        })
    }
}

// Set color mode function
const setColorMode = (mode) => {
    colorMode.preference = mode

    // Show toast for theme change
    const modeText = mode === 'light' ? 'terang' : mode === 'dark' ? 'gelap' : 'sistem'
    toastStore.info(`Mode tampilan diubah ke ${modeText}`, 'Tampilan Diperbarui')

    // Apply theme changes immediately if needed
    if (mode === 'system') {
        detectSystemTheme()
    }
}

// App preference functions
const toggleNotification = () => {
    notificationEnabled.value = !notificationEnabled.value

    if (notificationEnabled.value) {
        toastStore.success('Notifikasi push diaktifkan', 'Notifikasi Aktif')
    } else {
        toastStore.warning('Notifikasi push dinonaktifkan', 'Notifikasi Nonaktif')
    }
}

const clearCache = () => {
    // Simulate cache clearing
    toastStore.info('Cache dan data offline berhasil dibersihkan', 'Cache Dibersihkan')
}

const showGuide = () => {
    toastStore.info('Panduan penggunaan akan segera tersedia', 'Coming Soon')
}

const contactSupport = () => {
    toastStore.info('Mengarahkan ke halaman support...', 'Hubungi Support')
}

const showVersionInfo = () => {
    toastStore.info('CRM Sales v1.0.0 (Build 001)\nDikembangkan dengan ❤️', 'Informasi Versi')
}

// Logout function
const handleLogout = async () => {
    await authStore.logout()
}

// Initialize system detection on mount
onMounted(() => {
    if (process.client) {
        // Detect system theme preference
        detectSystemTheme()
    }
})

useHead({
    title: 'Pengaturan - CRM Sales'
})
</script>