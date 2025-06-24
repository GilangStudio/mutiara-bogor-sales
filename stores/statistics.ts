// stores/statistics.ts
export interface StatisticsFilters {
    period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    date_from?: string
    date_to?: string
    platform_id?: number
}

export interface PeriodInfo {
    period: string
    date_from: string
    date_to: string
    days_count: number
}

export interface TotalStats {
    current_period: number
    previous_period: number
    change_percentage: number
    change_direction: 'increase' | 'decrease' | 'same'
    all_time_total: number
}

export interface StatusDistribution {
    status: string
    count: number
    percentage: number
}

export interface PlatformDistribution {
    platform_id: number
    platform_name: string
    count: number
    percentage: number
}

export interface TrendData {
    date: string
    count: number
    formatted_date: string
}

export interface AssignmentStats {
    automatic: {
        count: number
        percentage: number
    }
    manual: {
        count: number
        percentage: number
    }
    total: number
}

export interface PerformanceMetric {
    value: number
    description: string
}

export interface PerformanceMetrics {
    conversion_rate: PerformanceMetric
    process_rate: PerformanceMetric
    avg_response_time: PerformanceMetric
    productivity_score: PerformanceMetric
}

export interface RecentActivity {
    id: number
    name: string
    leads_status: string
    platform_name: string
    updated_at: string
    updated_diff: string
}

export interface GoalsData {
    target: number
    current: number
    achievement_percentage: number
    remaining: number
    status: 'achieved' | 'on_track' | 'behind'
}

export interface SalesInfo {
    id: number
    name: string
    email: string
    phone: string
    order: number
}

export interface StatisticsData {
    period_info: PeriodInfo
    total_stats: TotalStats
    status_distribution: StatusDistribution[]
    platform_distribution: PlatformDistribution[]
    trends: TrendData[]
    assignment_stats: AssignmentStats
    performance_metrics: PerformanceMetrics
    recent_activities: RecentActivity[]
    goals: GoalsData
    sales_info: SalesInfo
}

export interface StatisticsResponse {
    status: string
    message: string
    data: StatisticsData
}

export const useStatisticsStore = defineStore('statistics', {
    state: () => ({
        statistics: null as StatisticsData | null,
        isLoading: false,
        error: null as string | null,
        lastFetch: null as Date | null,
        currentFilters: {
            period: 'month',
            date_from: undefined,
            date_to: undefined,
            platform_id: undefined
        } as StatisticsFilters
    }),

    getters: {
        getStatistics: (state) => state.statistics,
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error,
        getCurrentPeriod: (state) => state.currentFilters.period,
        
        // Quick access getters untuk komponen
        getTotalStats: (state) => state.statistics?.total_stats,
        getStatusDistribution: (state) => state.statistics?.status_distribution || [],
        getPlatformDistribution: (state) => state.statistics?.platform_distribution || [],
        getTrends: (state) => state.statistics?.trends || [],
        getPerformanceMetrics: (state) => state.statistics?.performance_metrics,
        getRecentActivities: (state) => state.statistics?.recent_activities || [],
        getGoals: (state) => state.statistics?.goals,
        getSalesInfo: (state) => state.statistics?.sales_info,
        
        // Helper getters
        hasData: (state) => !!state.statistics,
        needsRefresh: (state) => {
            if (!state.lastFetch) return true
            
            // Refresh jika data lebih dari 5 menit
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            return state.lastFetch < fiveMinutesAgo
        },
        
        isDataStale: (state) => {
            if (!state.lastFetch) return false
            
            // Data dianggap stale jika lebih dari 30 menit
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
            return state.lastFetch < thirtyMinutesAgo
        }
    },

    actions: {
        async fetchStatistics(filters: StatisticsFilters = {}, forceRefresh = false) {
            // Skip jika sudah loading
            if (this.isLoading) return
            
            // Skip jika data masih fresh dan tidak force refresh
            if (!forceRefresh && this.statistics && !this.needsRefresh) {
                return { success: true, data: this.statistics }
            }

            this.isLoading = true
            this.error = null

            try {
                const { $api }: any = useNuxtApp()
                
                // Merge filters dengan current filters
                const finalFilters = { ...this.currentFilters, ...filters }
                
                // Bersihkan filter yang undefined
                const cleanFilters = Object.keys(finalFilters).reduce((acc, key) => {
                    const value = finalFilters[key]
                    if (value !== undefined && value !== '' && value !== null) {
                        acc[key] = value
                    }
                    return acc
                }, {} as any)

                console.log('Fetching statistics with filters:', cleanFilters) // Debug log

                const response: StatisticsResponse = await $api('/get_statistics', {
                    method: 'GET',
                    query: cleanFilters
                })

                if (response.status === 'success' && response.data) {
                    this.setStatisticsData(response.data, finalFilters)
                    return { success: true, data: response.data }
                } else {
                    throw new Error(response.message || 'Gagal mengambil data statistik')
                }

            } catch (error: any) {
                console.error('Error fetching statistics:', error)
                
                let errorMessage = 'Terjadi kesalahan saat memuat statistik'
                
                if (error.status === 401) {
                    errorMessage = 'Sesi Anda telah berakhir, silakan login kembali'
                } else if (error.status === 422) {
                    errorMessage = 'Parameter filter tidak valid'
                } else if (error.data?.message) {
                    errorMessage = error.data.message
                } else if (error.message) {
                    errorMessage = error.message
                }

                this.error = errorMessage
                return { success: false, error: errorMessage }

            } finally {
                this.isLoading = false
            }
        },

        async refreshStatistics() {
            return await this.fetchStatistics(this.currentFilters, true)
        },

        async setPeriod(period: StatisticsFilters['period']) {
            const filters = { period }
            
            // Reset custom date jika bukan custom period
            if (period !== 'custom') {
                filters.date_from = undefined
                filters.date_to = undefined
            }
            
            return await this.fetchStatistics(filters, true)
        },

        async setCustomDateRange(dateFrom: string, dateTo: string) {
            return await this.fetchStatistics({
                period: 'custom',
                date_from: dateFrom,
                date_to: dateTo
            }, true)
        },

        async setPlatformFilter(platformId?: number) {
            return await this.fetchStatistics({ platform_id: platformId }, true)
        },

        setStatisticsData(data: StatisticsData, appliedFilters: StatisticsFilters) {
            this.statistics = data
            this.currentFilters = { ...appliedFilters }
            this.lastFetch = new Date()
            this.error = null
        },

        clearStatistics() {
            this.statistics = null
            this.error = null
            this.lastFetch = null
            this.currentFilters = {
                period: 'month',
                date_from: undefined,
                date_to: undefined,
                platform_id: undefined
            }
        },

        clearError() {
            this.error = null
        },

        // Helper methods untuk komponen
        getStatusColor(status: string): string {
            const colors: Record<string, string> = {
                'new': 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
                'process': 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30',
                'closing': 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
            }
            return colors[status] || 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30'
        },

        getStatusText(status: string): string {
            const texts: Record<string, string> = {
                'new': 'Baru',
                'process': 'Proses',
                'closing': 'Closing'
            }
            return texts[status] || status
        },

        getStatusBarColor(status: string): string {
            const colors: Record<string, string> = {
                'new': 'primary',
                'process': 'warning',
                'closing': 'success'
            }
            return colors[status] || 'secondary'
        },

        getChangeDirection(percentage: number): 'up' | 'down' | 'same' {
            if (percentage > 0) return 'up'
            if (percentage < 0) return 'down'
            return 'same'
        },

        formatPercentage(value: number): string {
            const abs = Math.abs(value)
            return value > 0 ? `+${abs}%` : value < 0 ? `-${abs}%` : '0%'
        },

        getPeriodLabel(period: string): string {
            const labels: Record<string, string> = {
                'today': 'Hari Ini',
                'week': 'Minggu Ini',
                'month': 'Bulan Ini',
                'quarter': 'Kuartal Ini',
                'year': 'Tahun Ini',
                'custom': 'Custom'
            }
            return labels[period] || 'Periode'
        },

        getGoalStatusColor(status: string): string {
            const colors: Record<string, string> = {
                'achieved': 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30',
                'on_track': 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
                'behind': 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
            }
            return colors[status] || 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30'
        },

        getGoalStatusText(status: string): string {
            const texts: Record<string, string> = {
                'achieved': 'Target Tercapai',
                'on_track': 'Sesuai Target',
                'behind': 'Di Bawah Target'
            }
            return texts[status] || 'Unknown'
        }
    }
})