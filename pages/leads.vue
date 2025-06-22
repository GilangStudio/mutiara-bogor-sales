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
                <!-- Search Input -->
                <div class="relative mb-4">
                    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Cari leads..."
                        class="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    />
                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <div v-if="isSearching" class="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin"></div>
                        <button v-if="searchQuery" @click="clearSearch" class="text-muted-foreground hover:text-foreground">
                            <X class="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <!-- Status Filter Tabs -->
                <div class="flex gap-1 bg-muted p-1 rounded-lg mb-4">
                    <button
                        v-for="filter in statusFilters"
                        :key="filter.value"
                        @click="setStatusFilter(filter.value)"
                        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative"
                        :class="activeFilter === filter.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                    >
                        {{ filter.label }}
                        <span 
                            v-if="filter.value !== 'all' && getStatusCount(filter.value) > 0"
                            class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
                        >
                            {{ getStatusCount(filter.value) }}
                        </span>
                    </button>
                </div>

                <!-- Advanced Filters -->
                <div class="flex gap-2 mb-4 flex-wrap">
                    <button 
                        @click="toggleFavoriteFilter"
                        class="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg transition-colors"
                        :class="favoriteFilter ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200' : 'hover:bg-accent'"
                    >
                        <Star class="h-4 w-4" :class="favoriteFilter ? 'fill-current' : ''" />
                        Favorit
                    </button>
                    
                    <button 
                        @click="toggleAssignmentFilter"
                        class="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg transition-colors"
                        :class="assignmentFilter ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200' : 'hover:bg-accent'"
                    >
                        <Zap class="h-4 w-4" />
                        {{ getAssignmentFilterLabel() }}
                    </button>

                    <button 
                        v-if="hasActiveFilters"
                        @click="clearAllFilters"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-lg transition-colors"
                    >
                        <FilterX class="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div v-if="!leadsStore.isLoading && leadsStore.summary.total_filtered > 0" class="mb-6">
                <div class="bg-card border border-border rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-medium text-muted-foreground">Ringkasan Leads</h3>
                        <span class="text-sm text-muted-foreground">
                            {{ leadsStore.leads.length }} dari {{ leadsStore.summary.total_filtered }} leads
                        </span>
                    </div>
                    <div class="grid grid-cols-4 gap-3">
                        <div class="text-center">
                            <div class="text-lg font-bold text-foreground">{{ leadsStore.summary.total_filtered }}</div>
                            <div class="text-xs text-muted-foreground">Filtered</div>
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
            <div v-else-if="!leadsStore.leads.length" class="text-center py-12">
                <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users class="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">
                    {{ hasActiveFilters ? 'Tidak Ada Hasil' : 'Belum Ada Leads' }}
                </h3>
                <p class="text-muted-foreground mb-6">
                    {{ hasActiveFilters ? 'Tidak ada leads yang sesuai dengan filter' : 'Leads akan muncul di sini ketika tersedia' }}
                </p>
                <button 
                    v-if="hasActiveFilters"
                    @click="clearAllFilters"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Reset Filter
                </button>
            </div>

            <!-- Leads List -->
            <div v-else class="space-y-3">
                <div 
                    v-for="lead in leadsStore.leads"
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
                                <!-- Assignment Type Badge -->
                                <span 
                                    v-if="lead.assignment_type"
                                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                                    :class="lead.assignment_type === 'auto' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'"
                                >
                                    <Zap v-if="lead.assignment_type === 'auto'" class="h-2.5 w-2.5 mr-1" />
                                    <User v-else class="h-2.5 w-2.5 mr-1" />
                                    {{ lead.assignment_type === 'auto' ? 'Auto' : 'Manual' }}
                                </span>
                            </div>
                            
                            <!-- Contact Info -->
                            <div class="space-y-1 mb-2">
                                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone class="h-3 w-3" />
                                    <span>{{ lead.phone }}</span>
                                    <button 
                                        v-if="lead.whatsapp_url"
                                        @click.stop="openWhatsApp(lead.whatsapp_url)"
                                        class="ml-auto p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded transition-colors"
                                        title="Chat WhatsApp"
                                    >
                                        <MessageCircle class="h-3 w-3" />
                                    </button>
                                </div>
                                <div v-if="lead.email" class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail class="h-3 w-3" />
                                    <span class="truncate">{{ lead.email }}</span>
                                </div>
                            </div>

                            <!-- Platform & Referral -->
                            <div class="flex items-center gap-3 flex-wrap">
                                <div v-if="lead.platform" class="flex items-center gap-2">
                                    <div class="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                        <Globe class="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span class="text-xs text-muted-foreground">{{ lead.platform.platform_name }}</span>
                                </div>
                                <div v-if="lead.path_referral" class="flex items-center gap-2">
                                    <div class="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                                        <Link class="h-2.5 w-2.5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span class="text-xs text-muted-foreground truncate max-w-24">{{ lead.path_referral }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-end gap-2 ml-2">
                            <span 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="getStatusBadgeClass(lead.leads_status.toLowerCase())"
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

            <!-- Infinite Scroll Trigger -->
            <div ref="infiniteScrollTarget" class="h-4"></div>

            <!-- Load More Indicator -->
            <div v-if="leadsStore.isLoadingMore" class="text-center py-4">
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-sm text-muted-foreground">Memuat lebih banyak leads...</p>
            </div>

            <!-- End of Results -->
            <div v-else-if="leadsStore.leads.length > 0 && !leadsStore.canLoadMore" class="text-center py-4">
                <p class="text-sm text-muted-foreground">Semua leads telah dimuat</p>
            </div>

            <!-- Refresh Button -->
            <!-- <div v-if="leadsStore.leads.length > 0" class="mt-6 text-center">
                <button 
                    @click="refreshLeads"
                    :disabled="leadsStore.isLoading"
                    class="flex items-center gap-2 px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors disabled:opacity-50 mx-auto"
                >
                    <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': leadsStore.isLoading }" />
                    Refresh Data
                </button>
            </div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    Search, Star, FilterX, Zap, X, RefreshCw, Users, AlertCircle,
    User, Phone, Mail, Globe, Link, MessageCircle, MessageSquare, 
    NotepadText, ChevronDown
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const leadsStore = useLeadsStore()
const route = useRoute()
const toast = useToast()

// State
const activeFilter = ref('all')
const favoriteFilter = ref(false)
const assignmentFilter = ref<'auto' | 'manual' | null>(null)
const expandedItems = ref<Record<string, boolean>>({})

// Status filter options
const statusFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'new', label: 'Baru' },
    { value: 'process', label: 'Proses' },
    { value: 'closing', label: 'Closing' }
]

// Debounced search
const { searchQuery, isSearching, clearSearch } = useDebouncedSearch(
    async (query: string) => {
        // Build filters untuk search
        const filters: any = {}
        
        if (query) filters.search = query
        if (activeFilter.value !== 'all') filters.status = activeFilter.value
        if (favoriteFilter.value) filters.is_favorited = true
        if (assignmentFilter.value) filters.assignment_type = assignmentFilter.value
        
        applyFiltersWithObject(filters)
    },
    { delay: 500, minLength: 0 }
)

// Infinite scroll
const { target: infiniteScrollTarget } = useInfiniteScroll(
    async () => {
        if (leadsStore.canLoadMore) {
            await loadMore()
        }
    },
    { 
        threshold: 0.1,
        disabled: computed(() => leadsStore.isLoading || leadsStore.isLoadingMore || !leadsStore.canLoadMore)
    }
)

// Initialize
onMounted(() => {
    initializeFromQuery()
    fetchLeads()
})

// Computed
const hasActiveFilters = computed(() => {
    return !!(
        searchQuery.value || 
        activeFilter.value !== 'all' || 
        favoriteFilter.value || 
        assignmentFilter.value
    )
})

// Methods
const initializeFromQuery = () => {
    const filterParam = route.query.filter as string
    if (filterParam && ['new', 'process', 'closing'].includes(filterParam)) {
        activeFilter.value = filterParam
    }
}

const applyFilters = async (additionalFilters = {}) => {
    // Build filters yang bersih
    const filters: any = { ...additionalFilters }
    
    if (searchQuery.value) filters.search = searchQuery.value
    if (activeFilter.value !== 'all') filters.status = activeFilter.value
    if (favoriteFilter.value) filters.is_favorited = true
    if (assignmentFilter.value) filters.assignment_type = assignmentFilter.value

    try {
        const result = await leadsStore.fetchLeads(filters, true)
        if (!result.success) {
            toast.error('Gagal memuat data leads', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memuat data leads', 'Error')
    }
}

const fetchLeads = () => {
    // Fetch dengan filter saat ini
    const filters: any = {}
    
    if (searchQuery.value) filters.search = searchQuery.value
    if (activeFilter.value !== 'all') filters.status = activeFilter.value
    if (favoriteFilter.value) filters.is_favorited = true
    if (assignmentFilter.value) filters.assignment_type = assignmentFilter.value
    
    applyFiltersWithObject(filters)
}

const loadMore = async () => {
    try {
        const result = await leadsStore.loadMoreLeads()
        if (!result?.success) {
            toast.error('Gagal memuat lebih banyak data', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memuat lebih banyak data', 'Error')
    }
}

const setStatusFilter = (status: string) => {
    activeFilter.value = status
    updateQueryParam(status)
    
    // Buat filter yang benar-benar bersih
    const filters: any = {}
    
    // Hanya tambahkan filter yang aktif
    if (searchQuery.value) {
        filters.search = searchQuery.value
    }
    if (status !== 'all') {
        filters.status = status
    }
    // Jika status = 'all', maka parameter status tidak disertakan sama sekali
    
    if (favoriteFilter.value) {
        filters.is_favorited = true
    }
    if (assignmentFilter.value) {
        filters.assignment_type = assignmentFilter.value
    }
    
    console.log('Status filter applied:', filters) // Debug log
    applyFiltersWithObject(filters)
}

const applyFiltersWithObject = async (filters: any) => {
    try {
        const result = await leadsStore.fetchLeads(filters, true)
        if (!result.success) {
            toast.error('Gagal memuat data leads', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memuat data leads', 'Error')
    }
}

const updateQueryParam = (filter: string) => {
    const query = filter === 'all' ? {} : { filter }
    navigateTo({ path: '/leads', query }, { replace: true })
}

const toggleFavoriteFilter = () => {
    favoriteFilter.value = !favoriteFilter.value
    
    // Rebuild filters
    const filters: any = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (activeFilter.value !== 'all') filters.status = activeFilter.value
    if (favoriteFilter.value) filters.is_favorited = true
    if (assignmentFilter.value) filters.assignment_type = assignmentFilter.value
    
    applyFiltersWithObject(filters)
}

const toggleAssignmentFilter = () => {
    if (!assignmentFilter.value) {
        assignmentFilter.value = 'auto'
    } else if (assignmentFilter.value === 'auto') {
        assignmentFilter.value = 'manual'
    } else {
        assignmentFilter.value = null
    }
    
    // Rebuild filters
    const filters: any = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (activeFilter.value !== 'all') filters.status = activeFilter.value
    if (favoriteFilter.value) filters.is_favorited = true
    if (assignmentFilter.value) filters.assignment_type = assignmentFilter.value
    
    applyFiltersWithObject(filters)
}

const clearAllFilters = () => {
    console.log('Clearing all filters') // Debug log
    
    // Reset semua filter UI
    searchQuery.value = ''
    activeFilter.value = 'all'
    favoriteFilter.value = false
    assignmentFilter.value = null
    
    // Update query param
    updateQueryParam('all')
    
    // Kirim request dengan object kosong (tanpa parameter apapun)
    applyFiltersWithObject({})
}

const getStatusCount = (status: string) => {
    if (status === 'all') return leadsStore.summary.total_filtered
    return leadsStore.totalLeadsStatus[status as keyof typeof leadsStore.totalLeadsStatus] || 0
}

const getAssignmentFilterLabel = () => {
    if (!assignmentFilter.value) return 'Tipe'
    return assignmentFilter.value === 'auto' ? 'Otomatis' : 'Manual'
}

const toggleFavorite = async (lead: any) => {
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

const openLeadDetail = (lead: any) => {
    toast.info('Halaman detail lead akan segera tersedia', 'Coming Soon')
}

const openWhatsApp = (whatsappUrl: string) => {
    if (process.client) {
        window.open(whatsappUrl, '_blank')
    }
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

const refreshLeads = async () => {
    try {
        const result = await leadsStore.refreshLeads()
        if (result.success) {
            toast.success('Data leads berhasil diperbarui', 'Refresh Berhasil')
        }
    } catch (error: any) {
        toast.error('Gagal memperbarui data', 'Error')
    }
}

// Head meta
useHead({
    title: 'Leads - CRM Sales'
})
</script>