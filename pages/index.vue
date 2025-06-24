<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
                <p class="text-muted-foreground">Statistik dan performa leads Anda</p>
            </div>

            <!-- Period Filter -->
            <div class="mb-6">
                <div class="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                    <button
                        v-for="period in periodOptions"
                        :key="period.value"
                        @click="setPeriod(period.value)"
                        class="flex-shrink-0 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                        :class="statisticsStore.getCurrentPeriod === period.value 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'"
                        :disabled="statisticsStore.isLoading"
                    >
                        {{ period.label }}
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="statisticsStore.isLoading && !statisticsStore.statistics" class="text-center py-12">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-muted-foreground">Memuat data statistik...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="statisticsStore.error" class="text-center py-12">
                <div class="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle class="h-10 w-10 text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Gagal Memuat Statistik</h3>
                <p class="text-muted-foreground mb-4">{{ statisticsStore.error }}</p>
                <button 
                    @click="refreshStatistics"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Coba Lagi
                </button>
            </div>

            <!-- Dashboard Content -->
            <div v-else-if="statisticsStore.statistics" class="space-y-6">
                <!-- Total Leads Stats -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-foreground">Total Leads</h3>
                        <div class="flex items-center gap-1 text-xs">
                            <Calendar class="h-3 w-3 text-muted-foreground" />
                            <span class="text-muted-foreground">{{ getPeriodLabel() }}</span>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-end gap-3">
                            <div class="text-3xl font-bold text-foreground">
                                {{ totalStats?.current_period || 0 }}
                            </div>
                            <div 
                                v-if="totalStats && totalStats.change_percentage !== 0"
                                class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                :class="totalStats.change_direction === 'increase' 
                                    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
                                    : totalStats.change_direction === 'decrease'
                                    ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                                    : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30'"
                            >
                                <TrendingUp v-if="totalStats.change_direction === 'increase'" class="h-3 w-3" />
                                <TrendingDown v-else-if="totalStats.change_direction === 'decrease'" class="h-3 w-3" />
                                <Minus v-else class="h-3 w-3" />
                                {{ Math.abs(totalStats.change_percentage) }}%
                            </div>
                        </div>
                        
                        <div class="text-sm text-muted-foreground">
                            Periode sebelumnya: {{ totalStats?.previous_period || 0 }} leads
                        </div>
                    </div>
                </div>

                <!-- Status Distribution -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Distribusi Status</h3>
                    <div class="space-y-3">
                        <div 
                            v-for="status in statusDistribution"
                            :key="status.status"
                            class="flex items-center justify-between"
                        >
                            <div class="flex items-center gap-3">
                                <div 
                                    class="w-3 h-3 rounded-full"
                                    :class="getStatusBadgeClass(status.status.toLowerCase())"
                                ></div>
                                <span class="text-sm font-medium text-foreground">{{ status.status }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-bold text-foreground">{{ status.count }}</span>
                                <span class="text-xs text-muted-foreground">({{ status.percentage }}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div v-if="performanceMetrics" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Performa</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="text-lg font-bold text-foreground">
                                {{ performanceMetrics.conversion_rate.value }}%
                            </div>
                            <div class="text-xs text-muted-foreground">Conversion Rate</div>
                        </div>
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="text-lg font-bold text-foreground">
                                {{ performanceMetrics.process_rate.value }}%
                            </div>
                            <div class="text-xs text-muted-foreground">Process Rate</div>
                        </div>
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="text-lg font-bold text-foreground">
                                {{ performanceMetrics.avg_response_time.value }}h
                            </div>
                            <div class="text-xs text-muted-foreground">Avg Response</div>
                        </div>
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="text-lg font-bold text-foreground">
                                {{ Math.round(performanceMetrics.productivity_score.value) }}
                            </div>
                            <div class="text-xs text-muted-foreground">Productivity</div>
                        </div>
                    </div>
                </div>

                <!-- Goals Progress -->
                <div v-if="goals" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Target Leads</h3>
                    
                    <div class="space-y-4">
                        <!-- Progress Bar -->
                        <div class="w-full bg-muted rounded-full h-3">
                            <div 
                                class="h-3 rounded-full transition-all duration-500"
                                :class="goals.status === 'achieved' 
                                    ? 'bg-green-500'
                                    : goals.status === 'on_track'
                                    ? 'bg-blue-500'
                                    : 'bg-red-500'"
                                :style="{ width: `${Math.min(100, goals.achievement_percentage)}%` }"
                            ></div>
                        </div>
                        
                        <!-- Stats -->
                        <div class="flex items-center justify-between text-sm">
                            <div>
                                <span class="font-semibold text-foreground">{{ goals.current }}</span>
                                <span class="text-muted-foreground"> / {{ goals.target }} leads</span>
                            </div>
                            <div 
                                class="px-2 py-1 rounded-full text-xs font-medium"
                                :class="getGoalStatusColor(goals.status)"
                            >
                                {{ goals.achievement_percentage }}%
                            </div>
                        </div>
                        
                        <div class="text-xs text-muted-foreground">
                            <span 
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                :class="getGoalStatusColor(goals.status)"
                            >
                                {{ getGoalStatusText(goals.status) }}
                            </span>
                            <span v-if="goals.remaining > 0" class="ml-2">
                                • Sisa {{ goals.remaining }} leads untuk mencapai target
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Assignment Stats -->
                <div v-if="assignmentStats" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Tipe Assignment</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div class="flex items-center justify-center gap-2 mb-2">
                                <Zap class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Otomatis</span>
                            </div>
                            <div class="text-lg font-bold text-blue-800 dark:text-blue-200">
                                {{ assignmentStats.automatic.count }}
                            </div>
                            <div class="text-xs text-blue-600 dark:text-blue-400">
                                {{ assignmentStats.automatic.percentage }}%
                            </div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                            <div class="flex items-center justify-center gap-2 mb-2">
                                <User class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Manual</span>
                            </div>
                            <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {{ assignmentStats.manual.count }}
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ assignmentStats.manual.percentage }}%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platform Distribution -->
                <div v-if="platformDistribution && platformDistribution.length > 0" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Platform Leads</h3>
                    <div class="space-y-3">
                        <div 
                            v-for="platform in platformDistribution.slice(0, 5)"
                            :key="platform.platform_id"
                            class="flex items-center justify-between"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-3 h-3 bg-primary rounded-full"></div>
                                <span class="text-sm font-medium text-foreground truncate">{{ platform.platform_name }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-bold text-foreground">{{ platform.count }}</span>
                                <span class="text-xs text-muted-foreground">({{ platform.percentage }}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div v-if="recentActivities && recentActivities.length > 0" class="bg-card border border-border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-foreground">Aktivitas Terbaru</h3>
                        <NuxtLink 
                            to="/leads" 
                            class="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            Lihat Semua
                        </NuxtLink>
                    </div>
                    <div class="space-y-3">
                        <div 
                            v-for="activity in recentActivities.slice(0, 3)"
                            :key="activity.id"
                            class="flex items-center justify-between"
                        >
                            <div>
                                <div class="text-sm font-medium text-foreground truncate">{{ activity.name }}</div>
                                <div class="text-xs text-muted-foreground">{{ activity.platform_name }}</div>
                            </div>
                            <div class="text-right">
                                <div 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    :class="getStatusBadgeClass(activity.leads_status.toLowerCase())"
                                >
                                    {{ getStatusLabel(activity.leads_status) }}
                                </div>
                                <div class="text-xs text-muted-foreground mt-1">{{ activity.updated_diff }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4">Aksi Cepat</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <NuxtLink to="/leads" class="block">
                            <div class="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-center">
                                <Users class="h-6 w-6 text-primary mx-auto mb-2" />
                                <div class="text-sm font-medium text-foreground">Lihat Leads</div>
                            </div>
                        </NuxtLink>
                        <button 
                            @click="refreshStatistics"
                            :disabled="statisticsStore.isLoading"
                            class="p-4 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 rounded-lg transition-colors text-center disabled:opacity-50"
                        >
                            <RefreshCw class="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" :class="{ 'animate-spin': statisticsStore.isLoading }" />
                            <div class="text-sm font-medium text-green-800 dark:text-green-200">Refresh</div>
                        </button>
                    </div>
                </div>

                <!-- Data Freshness Indicator -->
                <div v-if="statisticsStore.lastFetch" class="text-center text-xs text-muted-foreground">
                    Diperbarui {{ formatLastFetch() }}
                    <span 
                        v-if="statisticsStore.isDataStale"
                        class="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 rounded"
                    >
                        <Clock class="h-3 w-3" />
                        Data mungkin sudah lama
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    AlertCircle, Calendar, TrendingUp, TrendingDown, Minus, Zap, User, Users, 
    RefreshCw, Clock
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const statisticsStore = useStatisticsStore()
const toast = useToast()

// Period options
const periodOptions = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu' },
    { value: 'month', label: 'Bulan' },
    { value: 'quarter', label: 'Kuartal' },
    { value: 'year', label: 'Tahun' }
]

// Computed properties untuk akses mudah ke data statistik
const totalStats = computed(() => statisticsStore.getTotalStats)
const statusDistribution = computed(() => statisticsStore.getStatusDistribution)
const platformDistribution = computed(() => statisticsStore.getPlatformDistribution)
const performanceMetrics = computed(() => statisticsStore.getPerformanceMetrics)
const recentActivities = computed(() => statisticsStore.getRecentActivities)
const goals = computed(() => statisticsStore.getGoals)
const assignmentStats = computed(() => statisticsStore.statistics?.assignment_stats)

// Lifecycle
onMounted(() => {
    fetchStatistics()
})

// Methods
const fetchStatistics = async () => {
    try {
        const result = await statisticsStore.fetchStatistics()
        if (!result.success) {
            toast.error('Gagal memuat data statistik', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memuat data statistik', 'Error')
    }
}

const refreshStatistics = async () => {
    try {
        const result = await statisticsStore.refreshStatistics()
        if (result.success) {
            toast.success('Data statistik berhasil diperbarui', 'Refresh Berhasil')
        } else {
            toast.error('Gagal memperbarui data statistik', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal memperbarui data statistik', 'Error')
    }
}

const setPeriod = async (period: string) => {
    try {
        const result = await statisticsStore.setPeriod(period as any)
        if (!result.success) {
            toast.error('Gagal mengubah periode', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal mengubah periode', 'Error')
    }
}

const getPeriodLabel = () => {
    return statisticsStore.getPeriodLabel(statisticsStore.getCurrentPeriod || 'month')
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

const getGoalStatusColor = (status: string) => {
    return statisticsStore.getGoalStatusColor(status)
}

const getGoalStatusText = (status: string) => {
    return statisticsStore.getGoalStatusText(status)
}

const formatLastFetch = () => {
    if (!statisticsStore.lastFetch) return ''
    
    const now = new Date()
    const diffMs = now.getTime() - statisticsStore.lastFetch.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'baru saja'
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari yang lalu`
}

// Head meta
useHead({
    title: 'Dashboard - CRM Sales'
})
</script>