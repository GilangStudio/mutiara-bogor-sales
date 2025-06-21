<template>
    <!-- Toast Container - Fixed position at bottom -->
    <Teleport to="body">
        <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-[428px]">
            <div class="px-4 space-y-2">
                <TransitionGroup name="toast" tag="div" class="space-y-2">
                    <div v-for="toast in toastStore.toasts" :key="toast.id"
                        class="pointer-events-auto transform transition-all duration-300 ease-in-out">
                        <div class="bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                            :class="{
                                'border-red-500/50 bg-red-50/90 dark:bg-red-950/90': toast.type === 'error',
                                'border-green-500/50 bg-green-50/90 dark:bg-green-950/90': toast.type === 'success',
                                'border-yellow-500/50 bg-yellow-50/90 dark:bg-yellow-950/90': toast.type === 'warning',
                                'border-blue-500/50 bg-blue-50/90 dark:bg-blue-950/90': toast.type === 'info'
                            }">
                            <div class="p-4">
                                <div class="flex items-start gap-3">
                                    <!-- Icon -->
                                    <div class="flex-shrink-0 mt-0.5">
                                        <AlertCircle v-if="toast.type === 'error'" 
                                            class="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <CheckCircle v-else-if="toast.type === 'success'" 
                                            class="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <AlertTriangle v-else-if="toast.type === 'warning'" 
                                            class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        <Info v-else-if="toast.type === 'info'" 
                                            class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div v-if="toast.title" class="font-medium text-sm mb-1"
                                            :class="{
                                                'text-red-800 dark:text-red-200': toast.type === 'error',
                                                'text-green-800 dark:text-green-200': toast.type === 'success',
                                                'text-yellow-800 dark:text-yellow-200': toast.type === 'warning',
                                                'text-blue-800 dark:text-blue-200': toast.type === 'info'
                                            }">
                                            {{ toast.title }}
                                        </div>
                                        <div class="text-sm"
                                            :class="{
                                                'text-red-700 dark:text-red-300': toast.type === 'error',
                                                'text-green-700 dark:text-green-300': toast.type === 'success',
                                                'text-yellow-700 dark:text-yellow-300': toast.type === 'warning',
                                                'text-blue-700 dark:text-blue-300': toast.type === 'info'
                                            }">
                                            {{ toast.message }}
                                        </div>
                                    </div>

                                    <!-- Close Button -->
                                    <button @click="toastStore.removeToast(toast.id)"
                                        class="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <X class="h-4 w-4" 
                                            :class="{
                                                'text-red-500 dark:text-red-400': toast.type === 'error',
                                                'text-green-500 dark:text-green-400': toast.type === 'success',
                                                'text-yellow-500 dark:text-yellow-400': toast.type === 'warning',
                                                'text-blue-500 dark:text-blue-400': toast.type === 'info'
                                            }" />
                                    </button>
                                </div>

                                <!-- Progress Bar (if not persistent) -->
                                <div v-if="!toast.persistent && toast.duration && toast.duration > 0"
                                    class="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full animate-progress-bar"
                                        :class="{
                                            'bg-red-500': toast.type === 'error',
                                            'bg-green-500': toast.type === 'success',
                                            'bg-yellow-500': toast.type === 'warning',
                                            'bg-blue-500': toast.type === 'info'
                                        }"
                                        :style="{ animationDuration: `${toast.duration}ms` }">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<style scoped>
/* Toast animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.toast-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

.toast-move {
    transition: transform 0.3s ease;
}

/* Progress bar animation */
@keyframes progress-bar {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}

.animate-progress-bar {
    animation: progress-bar linear forwards;
}
</style>