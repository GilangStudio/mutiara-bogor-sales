<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-foreground mb-2">Menu Utama</h1>
                <p class="text-muted-foreground">Selamat datang di CRM Sales</p>
            </div>

            <!-- User Welcome Card -->
            <div class="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-6 mb-6"
                v-if="authStore.user">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <User class="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold text-foreground">{{ authStore.user.name }}</h2>
                        <p class="text-sm text-muted-foreground">{{ authStore.user.phone }}</p>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-card border border-border rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-primary">0</div>
                    <div class="text-xs text-muted-foreground">Total Leads</div>
                </div>
                <div class="bg-card border border-border rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600">0</div>
                    <div class="text-xs text-muted-foreground">Leads Aktif</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-3">
                <h3 class="text-lg font-semibold text-foreground">Aksi Cepat</h3>

                <NuxtLink to="/leads" class="block">
                    <div
                        class="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users class="h-5 w-5 text-blue-600" />
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-foreground">Kelola Leads</div>
                            <div class="text-sm text-muted-foreground">Lihat dan kelola semua leads</div>
                        </div>
                        <ChevronRight class="h-4 w-4 text-muted-foreground" />
                    </div>
                </NuxtLink>

                <div
                    class="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Plus class="h-5 w-5 text-green-600" />
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-foreground">Tambah Lead Baru</div>
                        <div class="text-sm text-muted-foreground">Buat lead baru</div>
                    </div>
                    <ChevronRight class="h-4 w-4 text-muted-foreground" />
                </div>

                <div
                    class="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 class="h-5 w-5 text-purple-600" />
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-foreground">Laporan Penjualan</div>
                        <div class="text-sm text-muted-foreground">Lihat statistik penjualan</div>
                    </div>
                    <ChevronRight class="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, Users, Plus, BarChart3, ChevronRight } from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const authStore = useAuthStore()

// Head meta
useHead({
    title: 'Menu Utama - CRM Sales'
})
</script>