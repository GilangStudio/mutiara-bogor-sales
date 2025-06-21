<template>
    <div
        class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-background border-t border-border bottom-nav-container">
        <nav class="flex items-center justify-around py-2 px-4">
            <NuxtLink v-for="item in navigationItems" :key="item.name" :to="item.path"
                class="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1"
                :class="{
                    'text-primary bg-primary/10': $route.path === item.path,
                    'text-muted-foreground hover:text-foreground hover:bg-accent': $route.path !== item.path
                }">
                <component :is="item.icon" class="h-5 w-5 mb-1" />
                <span class="text-xs font-medium truncate">{{ item.name }}</span>
            </NuxtLink>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { Home, Users, Settings } from 'lucide-vue-next'

const navigationItems = [
    {
        name: 'Menu Utama',
        path: '/',
        icon: Home
    },
    {
        name: 'Leads',
        path: '/leads',
        icon: Users
    },
    {
        name: 'Pengaturan',
        path: '/settings',
        icon: Settings
    }
]
</script>