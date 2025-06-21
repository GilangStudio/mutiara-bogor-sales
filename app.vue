<template>
    <div>
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
    </div>
</template>

<script setup>
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
    if (!hydrated.value) return false

    // Don't show bottom nav on login page or if not authenticated
    return route.path !== '/login' &&
        route.path !== '/forgot-password' &&
        authStore.isAuthenticated
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