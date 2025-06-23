<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header with Back Button -->
            <div class="mb-6 flex items-center gap-3">
                <button @click="$router.back()" class="p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </button>
                <div class="flex-1">
                    <h1 class="text-xl font-bold text-foreground">Detail Lead</h1>
                    <p class="text-sm text-muted-foreground">Informasi lengkap lead</p>
                </div>
                <button 
                    v-if="leadDetail"
                    @click="toggleFavorite"
                    :disabled="isToggling"
                    class="p-2 hover:bg-accent rounded-lg transition-colors"
                    :class="leadDetail.is_favorited ? 'text-yellow-500' : 'text-muted-foreground'"
                >
                    <Star class="h-5 w-5" :class="leadDetail.is_favorited ? 'fill-current' : ''" />
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-muted-foreground">Memuat detail lead...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <div class="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle class="h-10 w-10 text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Gagal Memuat Detail</h3>
                <p class="text-muted-foreground mb-4">{{ error }}</p>
                <button 
                    @click="fetchLeadDetail"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Coba Lagi
                </button>
            </div>

            <!-- Lead Detail Content -->
            <div v-else-if="leadDetail" class="space-y-6">
                <!-- Lead Header Card -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h2 class="text-xl font-bold text-foreground mb-2">{{ leadDetail.name }}</h2>
                            <div class="flex items-center gap-2 mb-3 flex-wrap">
                                <span 
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    :class="getStatusBadgeClass(leadDetail.lead_status.toLowerCase())"
                                >
                                    {{ getStatusLabel(leadDetail.lead_status) }}
                                </span>
                                <span 
                                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                    :class="leadDetail.assignment_info.type === 'auto' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'"
                                >
                                    <Zap v-if="leadDetail.assignment_info.type === 'auto'" class="h-3 w-3 mr-1" />
                                    <User v-else class="h-3 w-3 mr-1" />
                                    {{ leadDetail.assignment_info.type_text }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                            @click="showEditDialog"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Edit class="h-4 w-4" />
                            Edit Lead
                        </button>
                        <button 
                            @click="showStatusDialog"
                            class="flex items-center justify-center gap-2 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                        >
                            <RefreshCw class="h-4 w-4" />
                            Ubah Status
                        </button>
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <Phone class="h-4 w-4 text-primary" />
                        Informasi Kontak
                    </h3>
                    <div class="space-y-3">
                        <!-- Phone -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <Phone class="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div class="text-sm font-medium">{{ leadDetail.contact_info.formatted_phone }}</div>
                                    <div class="text-xs text-muted-foreground">Nomor Telepon</div>
                                </div>
                            </div>
                            <button 
                                v-if="leadDetail.contact_info.whatsapp_url"
                                @click="openWhatsApp"
                                class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
                                title="Chat WhatsApp"
                            >
                                <MessageCircle class="h-4 w-4" />
                            </button>
                        </div>

                        <!-- Email -->
                        <div v-if="leadDetail.email" class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Mail class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div class="text-sm font-medium">{{ leadDetail.email }}</div>
                                    <div class="text-xs text-muted-foreground">Email</div>
                                </div>
                            </div>
                            <button 
                                v-if="leadDetail.contact_info.email_url"
                                @click="openEmail"
                                class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                                title="Kirim Email"
                            >
                                <ExternalLink class="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Platform & Referral Info -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <Globe class="h-4 w-4 text-primary" />
                        Platform & Referral
                    </h3>
                    <div class="space-y-3">
                        <!-- Platform -->
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Globe class="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div class="text-sm font-medium">{{ leadDetail.platform.name }}</div>
                                <div class="text-xs text-muted-foreground">Platform</div>
                            </div>
                        </div>

                        <!-- Referral Path -->
                        <div v-if="leadDetail.path_referral" class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Link class="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium break-all">{{ leadDetail.path_referral }}</div>
                                <div class="text-xs text-muted-foreground">Path Referral</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Assignment Information -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <UserCheck class="h-4 w-4 text-primary" />
                        Informasi Assignment
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <User class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div class="text-sm font-medium">{{ leadDetail.assignment_info.assigned_by.name }}</div>
                                <div class="text-xs text-muted-foreground">Assigned By</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Calendar class="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div class="text-sm font-medium">{{ leadDetail.assignment_info.assigned_at }}</div>
                                <div class="text-xs text-muted-foreground">Tanggal Assignment</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Message Section -->
                <div v-if="leadDetail.message" class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare class="h-4 w-4 text-primary" />
                        Pesan Customer
                    </h3>
                    <div class="bg-muted/30 rounded-lg p-3 border border-muted">
                        <p class="text-sm text-foreground leading-relaxed">{{ leadDetail.message }}</p>
                    </div>
                </div>

                <!-- Notes Section -->
                <div v-if="leadDetail.note" class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <NotepadText class="h-4 w-4 text-primary" />
                        Catatan Sales
                    </h3>
                    <div class="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                        <p class="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">{{ leadDetail.note }}</p>
                    </div>
                </div>

                <!-- Movement History -->
                <div v-if="leadDetail.movement_history && leadDetail.movement_history.length > 0" class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <History class="h-4 w-4 text-primary" />
                        Riwayat Perpindahan
                        <span class="text-xs text-muted-foreground font-normal">({{ leadDetail.movement_history.length }})</span>
                    </h3>
                    <div class="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        <div 
                            v-for="movement in leadDetail.movement_history"
                            :key="movement.id"
                            class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                            <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ArrowRight class="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium">
                                    {{ movement.from_sales.name }} → {{ movement.to_sales.name }}
                                </div>
                                <div class="text-xs text-muted-foreground">{{ movement.moved_at_diff }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline Section -->
                <div v-if="leadDetail.timeline && leadDetail.timeline.length > 0" class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <Clock class="h-4 w-4 text-primary" />
                        Timeline
                        <span class="text-xs text-muted-foreground font-normal">({{ leadDetail.timeline.length }})</span>
                    </h3>
                    <div class="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        <div 
                            v-for="(event, index) in leadDetail.timeline"
                            :key="index"
                            class="flex items-start gap-3"
                        >
                            <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-foreground">{{ event.title }}</div>
                                <div class="text-xs text-muted-foreground">{{ event.time }}</div>
                                <div v-if="event.description" class="text-xs text-muted-foreground mt-1">{{ event.description }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Metadata -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <Info class="h-4 w-4 text-primary" />
                        Metadata
                    </h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Dibuat:</span>
                            <span class="font-medium">{{ leadDetail.metadata.created_at_formatted }}</span>
                        </div>
                        <div v-if="leadDetail.metadata.created_by" class="flex justify-between">
                            <span class="text-muted-foreground">Dibuat oleh:</span>
                            <span class="font-medium">{{ leadDetail.metadata.created_by.name }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Diperbarui:</span>
                            <span class="font-medium">{{ leadDetail.metadata.updated_at_formatted }}</span>
                        </div>
                        <div v-if="leadDetail.metadata.updated_by" class="flex justify-between">
                            <span class="text-muted-foreground">Diperbarui oleh:</span>
                            <span class="font-medium">{{ leadDetail.metadata.updated_by.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft, Star, AlertCircle, Edit, RefreshCw, Phone, Mail, MessageCircle,
    ExternalLink, Globe, Link, UserCheck, User, Calendar, MessageSquare,
    NotepadText, History, ArrowRight, Clock, Info, Zap
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Route dan stores
const route = useRoute()
const router = useRouter()
const toast = useToast()
const leadsStore = useLeadsStore()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const leadDetail = ref<any>(null)
const isToggling = ref(false)

// Lead ID dari route parameter
const leadId = computed(() => route.params.id)

// Lifecycle
onMounted(() => {
    fetchLeadDetail()
})

// Methods
const fetchLeadDetail = async () => {
    if (!leadId.value) {
        error.value = 'ID lead tidak valid'
        isLoading.value = false
        return
    }

    try {
        isLoading.value = true
        error.value = null

        const { $api }: any = useNuxtApp()
        const response = await $api(`/leads/${leadId.value}`, {
            method: 'GET'
        })

        if (response.status === 'success' && response.data?.lead) {
            leadDetail.value = response.data.lead
        } else {
            throw new Error(response.message || 'Gagal mengambil detail lead')
        }
    } catch (err: any) {
        console.error('Error fetching lead detail:', err)
        error.value = err.message || 'Terjadi kesalahan saat memuat detail lead'
        
        if (err.status === 404) {
            error.value = 'Lead tidak ditemukan atau Anda tidak memiliki akses'
        } else if (err.status === 401) {
            error.value = 'Sesi Anda telah berakhir, silakan login kembali'
        }
    } finally {
        isLoading.value = false
    }
}

const toggleFavorite = async () => {
    if (!leadDetail.value || isToggling.value) return

    try {
        isToggling.value = true
        
        const { $api }: any = useNuxtApp()
        
        // Call API directly instead of using store
        const response = await $api('/toggle_favorite', {
            method: 'POST',
            body: {
                lead_id: parseInt(leadId.value as string),
                is_favorited: !leadDetail.value.is_favorited
            }
        })

        if (response.status === 'success') {
            // Update local state
            leadDetail.value.is_favorited = !leadDetail.value.is_favorited
            
            // Update store jika lead ada di store (optional)
            const leadInStore = leadsStore.getLeadById(parseInt(leadId.value as string))
            if (leadInStore) {
                leadInStore.is_favorited = leadDetail.value.is_favorited
            }
            
            toast.success(
                leadDetail.value.is_favorited ? 'Lead ditambahkan ke favorit' : 'Lead dihapus dari favorit', 
                'Favorit Diperbarui'
            )
        } else {
            throw new Error(response.message || 'Gagal mengubah status favorit')
        }
    } catch (error: any) {
        console.error('Error toggling favorite:', error)
        toast.error(error.message || 'Gagal mengubah status favorit', 'Error')
    } finally {
        isToggling.value = false
    }
}

const showEditDialog = () => {
    toast.comingSoon('Edit Lead')
}

const showStatusDialog = () => {
    navigateTo(`/leads/${leadId.value}/change-status`)
}

const openWhatsApp = () => {
    if (leadDetail.value?.contact_info?.whatsapp_url && process.client) {
        window.open(leadDetail.value.contact_info.whatsapp_url, '_blank')
    }
}

const openEmail = () => {
    if (leadDetail.value?.contact_info?.email_url && process.client) {
        window.open(leadDetail.value.contact_info.email_url, '_blank')
    }
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'new': 'Baru',
        'process': 'Proses', 
        'closing': 'Closing'
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
        'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'process': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'closing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

// Head meta
useHead({
    title: computed(() => leadDetail.value ? `${leadDetail.value.name} - Detail Lead` : 'Detail Lead'),
    meta: [
        { 
            name: 'description', 
            content: computed(() => leadDetail.value ? `Detail lead ${leadDetail.value.name}` : 'Detail lead')
        }
    ]
})
</script>