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
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Cari leads..."
                        class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    />
                </div>

                <!-- Filter Tabs -->
                <div class="flex gap-1 bg-muted p-1 rounded-lg">
                    <button
                        @click="activeFilter = 'all'"
                        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                        :class="activeFilter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Semua
                    </button>
                    <button
                        @click="activeFilter = 'new'"
                        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                        :class="activeFilter === 'new' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Baru
                    </button>
                    <button
                        @click="activeFilter = 'process'"
                        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                        :class="activeFilter === 'process' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Proses
                    </button>
                    <button
                        @click="activeFilter = 'closing'"
                        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                        :class="activeFilter === 'closing' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Closing
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div v-if="!leadsStore.isLoading && leadsStore.totalLeads > 0" class="mb-6">
                <div class="bg-card border border-border rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-medium text-muted-foreground">Ringkasan Leads</h3>
                        <span class="text-sm text-muted-foreground">
                            {{ filteredLeads.length }} dari {{ leadsStore.totalLeads }} leads
                        </span>
                    </div>
                    <div class="grid grid-cols-4 gap-3">
                        <div class="text-center">
                            <div class="text-lg font-bold text-foreground">{{ leadsStore.totalLeads }}</div>
                            <div class="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">{{ leadsStore.totalLeadsStatus?.new || 0 }}</div>
                            <div class="text-xs text-muted-foreground">Baru</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-yellow-600">{{ leadsStore.totalLeadsStatus?.process || 0 }}</div>
                            <div class="text-xs text-muted-foreground">Proses</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-green-600">{{ leadsStore.totalLeadsStatus?.closing || 0 }}</div>
                            <div class="text-xs text-muted-foreground">Closing</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="leadsStore.isLoading" class="text-center py-12">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-muted-foreground">Memuat data leads...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="leadsStore.error" class="text-center py-12">
                <div class="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle class="h-10 w-10 text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Gagal Memuat Data</h3>
                <p class="text-muted-foreground mb-4">{{ leadsStore.error }}</p>
                <button 
                    @click="fetchLeads"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Coba Lagi
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="!filteredLeads.length && !leadsStore.isLoading" class="text-center py-12">
                <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users class="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">
                    {{ searchQuery ? 'Tidak Ada Hasil' : (activeFilter === 'all' ? 'Belum Ada Leads' : 'Belum Ada Leads ' + getFilterLabel(activeFilter)) }}
                </h3>
                <p class="text-muted-foreground mb-6">
                    {{ searchQuery ? 'Coba kata kunci lain untuk pencarian' : 'Leads akan muncul di sini ketika tersedia' }}
                </p>
                <button 
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Hapus Pencarian
                </button>
            </div>

            <!-- Leads List -->
            <div v-else class="space-y-3">
                <div 
                    v-for="lead in filteredLeads" 
                    :key="lead.id"
                    class="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors"
                >
                    <!-- Main Lead Info -->
                    <div class="flex items-start justify-between mb-3" @click="openLeadDetail(lead)">
                        <div class="flex-1 min-w-0 cursor-pointer">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="font-semibold text-foreground truncate">{{ lead.name }}</h3>
                                <button 
                                    @click.stop="toggleFavorite(lead)"
                                    class="p-1 hover:bg-accent rounded transition-colors"
                                    :class="lead.is_favorited ? 'text-yellow-500' : 'text-muted-foreground'"
                                >
                                    <Star class="h-4 w-4" :class="lead.is_favorited ? 'fill-current' : ''" />
                                </button>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Phone class="h-3 w-3" />
                                <span>{{ lead.mobile }}</span>
                            </div>
                            <div v-if="lead.email" class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Mail class="h-3 w-3" />
                                <span class="truncate">{{ lead.email }}</span>
                            </div>
                            <div v-if="lead.platform" class="flex items-center gap-2 mt-2">
                                <div class="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                    <Globe class="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span class="text-xs text-muted-foreground">{{ lead.platform.platform_name }}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2 ml-2">
                            <span 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="getStatusBadgeClass(lead.leads_status)"
                            >
                                {{ getStatusLabel(lead.leads_status) }}
                            </span>
                            <span class="text-xs text-muted-foreground">{{ lead.date }}</span>
                        </div>
                    </div>

                    <!-- Expandable Content -->
                    <div v-if="lead.message || lead.leads_note" class="border-t border-border pt-3">
                        <!-- Message Accordion -->
                        <div v-if="lead.message" class="mb-2">
                            <button 
                                @click="toggleAccordion('message', lead.id)"
                                class="w-full flex items-center justify-between py-2 px-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-left"
                            >
                                <div class="flex items-center gap-2">
                                    <MessageSquare class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span class="text-sm font-medium text-foreground">Pesan Customer</span>
                                </div>
                                <ChevronDown 
                                    class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                                    :class="{ 'rotate-180': expandedItems[`message-${lead.id}`] }"
                                />
                            </button>
                            <div 
                                v-if="expandedItems[`message-${lead.id}`]"
                                class="mt-2 p-3 bg-muted/20 rounded-lg border border-muted"
                            >
                                <p class="text-sm text-foreground leading-relaxed">{{ lead.message }}</p>
                            </div>
                        </div>

                        <!-- Notes Accordion -->
                        <div v-if="lead.leads_note">
                            <button 
                                @click="toggleAccordion('note', lead.id)"
                                class="w-full flex items-center justify-between py-2 px-3 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 rounded-lg transition-colors text-left border border-yellow-200 dark:border-yellow-800"
                            >
                                <div class="flex items-center gap-2">
                                    <NotepadText class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <span class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Catatan Sales</span>
                                </div>
                                <ChevronDown 
                                    class="h-4 w-4 text-yellow-600 dark:text-yellow-400 transition-transform duration-200"
                                    :class="{ 'rotate-180': expandedItems[`note-${lead.id}`] }"
                                />
                            </button>
                            <div 
                                v-if="expandedItems[`note-${lead.id}`]"
                                class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                            >
                                <p class="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">{{ lead.leads_note }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Refresh Button -->
            <div v-if="leadsStore.leads && leadsStore.leads.length > 0" class="mt-6 text-center">
                <button 
                    @click="refreshLeads"
                    :disabled="leadsStore.isLoading"
                    class="px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw class="h-4 w-4 inline mr-2" :class="{ 'animate-spin': leadsStore.isLoading }" />
                    Refresh Data
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Search, Users, Phone, Mail, Globe, Star, NotepadText, AlertCircle, RefreshCw, MessageSquare, ChevronDown } from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Types
interface Platform {
    id: number
    platform_name: string
}

interface Lead {
    id: number
    name: string
    mobile: string
    email: string
    message: string
    leads_status: string
    leads_note: string
    platform: Platform
    is_favorited: boolean
    date: string
}

interface LeadsData {
    leads: Lead[]
    total_leads_status: {
        new: number
        process: number
        closing: number
    }
    total_leads: number
}

// Stores
const leadsStore = useLeadsStore()
const route = useRoute()

// Reactive data
const searchQuery = ref('')
const activeFilter = ref('all')
const expandedItems = ref<Record<string, boolean>>({})

// Toast helper
const toast = useToast()

// Initialize filter from query parameter
onMounted(() => {
    const filterParam = route.query.filter as string
    if (filterParam && ['new', 'process', 'closing'].includes(filterParam)) {
        activeFilter.value = filterParam
    }
    fetchLeads()
})

// Watch for filter changes to update URL
watch(activeFilter, (newFilter) => {
    const query = newFilter === 'all' ? {} : { filter: newFilter }
    navigateTo({ path: '/leads', query }, { replace: true })
})

// Computed
const filteredLeads = computed(() => {
    let leads = leadsStore.leads
    
    // Filter by status
    if (activeFilter.value !== 'all') {
        leads = leadsStore.getLeadsByStatus(activeFilter.value as 'new' | 'process' | 'closing')
    }
    
    // Filter by search query
    if (searchQuery.value) {
        leads = leadsStore.searchLeads(searchQuery.value)
        
        // Apply status filter after search if needed
        if (activeFilter.value !== 'all') {
            leads = leads.filter(lead => lead.leads_status === activeFilter.value)
        }
    }
    
    return leads
})

// Methods
const fetchLeads = async () => {
    try {
        const result = await leadsStore.fetchLeads()
        if (!result.success) {
            toast.error('Gagal memuat data leads', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memuat data leads', 'Error')
    }
}

const toggleFavorite = async (lead: Lead) => {
    try {
        const result = await leadsStore.toggleFavorite(lead.id)
        
        toast.success(
            result.is_favorited ? 'Lead ditambahkan ke favorit' : 'Lead dihapus dari favorit', 
            'Favorit Diperbarui'
        )
    } catch (error: any) {
        toast.error(error.message || 'Gagal mengubah status favorit', 'Error')
    }
}

const toggleAccordion = (type: 'message' | 'note', leadId: number) => {
    const key = `${type}-${leadId}`
    expandedItems.value[key] = !expandedItems.value[key]
}

const openLeadDetail = (lead: Lead) => {
    // TODO: Navigate to lead detail page
    toast.info('Halaman detail lead akan segera tersedia', 'Coming Soon')
}

const getStatusLabel = (status: string) => {
    const labels = {
        'new': 'Baru',
        'process': 'Proses',
        'closing': 'Closing'
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status: string) => {
    const classes = {
        'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'process': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'closing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

const getFilterLabel = (filter: string) => {
    const labels = {
        'new': 'Baru',
        'process': 'Proses',
        'closing': 'Closing'
    }
    return labels[filter] || filter
}

const clearSearch = () => {
    searchQuery.value = ''
}

// Lifecycle
onMounted(() => {
    fetchLeads()
})

// Head meta
useHead({
    title: 'Leads - CRM Sales'
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>