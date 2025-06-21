<template>
    <div class="mobile-container">
        <main :class="{ 'pb-20': showBottomNav }">
            <NuxtPage />
        </main>
        <BottomNavigation v-if="showBottomNav" />
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

// Check if bottom navigation should be shown
const route = useRoute()
const authStore = useAuthStore()

const showBottomNav = computed(() => {
    // Don't show bottom nav on login page or if not authenticated
    return route.path !== '/login' &&
        route.path !== '/forgot-password' &&
        authStore.isAuthenticated
})

// Check authentication on app mount
onMounted(() => {
    authStore.checkAuth()
})
</script>