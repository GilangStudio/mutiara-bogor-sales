<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-foreground mb-2">Leads</h1>
                <p class="text-muted-foreground">Kelola semua leads Anda</p>
            </div>

            <!-- Search and Filter -->
            <div class="mb-6">
                <div class="relative mb-4">
                    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Cari leads..."
                        class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>

                <!-- Filter Tabs -->
                <div class="flex gap-1 bg-muted p-1 rounded-lg">
                    <button
                        class="flex-1 py-2 px-3 bg-background text-foreground rounded-md text-sm font-medium shadow-sm">
                        Semua
                    </button>
                    <button
                        class="flex-1 py-2 px-3 text-muted-foreground rounded-md text-sm font-medium hover:text-foreground transition-colors">
                        Baru
                    </button>
                    <button
                        class="flex-1 py-2 px-3 text-muted-foreground rounded-md text-sm font-medium hover:text-foreground transition-colors">
                        Process
                    </button>
                    <button
                        class="flex-1 py-2 px-3 text-muted-foreground rounded-md text-sm font-medium hover:text-foreground transition-colors">
                        Closing
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <!-- <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-card border border-border rounded-lg p-3 text-center">
                    <div class="text-lg font-bold text-primary">0</div>
                    <div class="text-xs text-muted-foreground">Total</div>
                </div>
                <div class="bg-card border border-border rounded-lg p-3 text-center">
                    <div class="text-lg font-bold text-yellow-600">0</div>
                    <div class="text-xs text-muted-foreground">Process</div>
                </div>
                <div class="bg-card border border-border rounded-lg p-3 text-center">
                    <div class="text-lg font-bold text-green-600">0</div>
                    <div class="text-xs text-muted-foreground">Closing</div>
                </div>
            </div> -->

            <!-- Empty State -->
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users class="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Belum Ada Leads</h3>
                <p class="text-muted-foreground mb-6">Mulai tambahkan leads pertama Anda untuk mengelola penjualan</p>

                <button
                    class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                    <Plus class="h-4 w-4" />
                    Tambah Lead Baru
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Search, Users, Plus } from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Head meta
useHead({
    title: 'Leads - CRM Sales'
})
</script>