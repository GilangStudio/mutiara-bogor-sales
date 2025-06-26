<template>
    <div>
        <VitePwaManifest />
        <!-- Tampilkan loading saat hydrating untuk mencegah mismatch -->
        <div v-if="!hydrated" class="mobile-container">
            <div class="min-h-screen flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>

        <div v-else class="mobile-container">
            <main :class="{ 'pb-20': showBottomNav }">
                <NuxtPage />
            </main>
            <BottomNavigation v-if="showBottomNav" />
        </div>

        <!-- Toast Container - Always rendered -->
        <ToastContainer />

        <PWAInstallButton />
        <NotificationGuard />
    </div>
</template>

<script setup>
import PWAInstallButton from '~/components/PWAInstallButton.vue'
import NotificationGuard from '~/components/NotificationGuard.vue'

// Meta tags untuk mobile
useHead({
    title: 'CRM Sales App',
    meta: [
        { name: 'description', content: 'Aplikasi CRM Sales untuk manajemen leads dan penjualan' }
    ]
})

// State untuk tracking hydration
const hydrated = ref(false)

// Check if bottom navigation should be shown
const route = useRoute()
const authStore = useAuthStore()

const showBottomNav = computed(() => {
    if (!hydrated.value || !authStore.isAuthenticated) return false

    // Halaman yang tidak menampilkan bottom navigation
    const excludedRoutes = [
        '/login',
        '/forgot-password'
    ]

    // Halaman parent yang menampilkan bottom navigation
    const parentRoutes = [
        '/',           // Menu Utama
        '/leads',      // Leads
        '/settings'    // Pengaturan (hanya halaman utama settings)
    ]

    // Jika route ada di excluded routes, jangan tampilkan
    if (excludedRoutes.includes(route.path)) {
        return false
    }

    // Jika route adalah halaman parent, tampilkan
    if (parentRoutes.includes(route.path)) {
        return true
    }

    // Jika route adalah child dari settings (dimulai dengan /settings/ dan bukan /settings), jangan tampilkan
    if (route.path.startsWith('/settings/')) {
        return false
    }

    // Untuk route lainnya yang belum terdefinisi, jangan tampilkan bottom nav
    return false
})

// Check authentication on app mount
onMounted(() => {
    // Check auth terlebih dahulu
    authStore.checkAuth()

    // Set hydrated setelah DOM ready dan auth check selesai
    nextTick(() => {
        hydrated.value = true
    })
})
</script>