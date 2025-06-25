// composables/useStatistics.ts
export const useStatistics = () => {
    const statisticsStore = useStatisticsStore()
    
    return {
        // Store state
        statistics: computed(() => statisticsStore.getStatistics),
        isLoading: computed(() => statisticsStore.getIsLoading),
        error: computed(() => statisticsStore.getError),
        lastFetch: computed(() => statisticsStore.lastFetch),
        
        // Data getters
        totalStats: computed(() => statisticsStore.getTotalStats),
        statusDistribution: computed(() => statisticsStore.getStatusDistribution),
        platformDistribution: computed(() => statisticsStore.getPlatformDistribution),
        trends: computed(() => statisticsStore.getTrends),
        performanceMetrics: computed(() => statisticsStore.getPerformanceMetrics),
        recentActivities: computed(() => statisticsStore.getRecentActivities),
        goals: computed(() => statisticsStore.getGoals),
        salesInfo: computed(() => statisticsStore.getSalesInfo),
        periodInfo: computed(() => statisticsStore.getPeriodInfo),
        assignmentStats: computed(() => statisticsStore.getAssignmentStats),
        
        // Helper getters
        hasData: computed(() => statisticsStore.hasData),
        needsRefresh: computed(() => statisticsStore.needsRefresh),
        isDataStale: computed(() => statisticsStore.isDataStale),
        currentPeriod: computed(() => statisticsStore.getCurrentPeriod),
        
        // Actions
        async fetchStatistics(filters = {}, forceRefresh = false) {
            return await statisticsStore.fetchStatistics(filters, forceRefresh)
        },
        
        async refreshStatistics() {
            return await statisticsStore.refreshStatistics()
        },
        
        async setPeriod(period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') {
            return await statisticsStore.setPeriod(period)
        },
        
        async setCustomDateRange(dateFrom: string, dateTo: string) {
            return await statisticsStore.setCustomDateRange(dateFrom, dateTo)
        },
        
        async setPlatformFilter(platformId?: number) {
            return await statisticsStore.setPlatformFilter(platformId)
        },
        
        clearStatistics() {
            statisticsStore.clearStatistics()
        },
        
        clearError() {
            statisticsStore.clearError()
        },
        
        // Helper methods
        getStatusColor(status: string) {
            return statisticsStore.getStatusColor(status)
        },
        
        getStatusText(status: string) {
            return statisticsStore.getStatusText(status)
        },
        
        getStatusBarColor(status: string) {
            return statisticsStore.getStatusBarColor(status)
        },
        
        getGoalStatusColor(status: string) {
            return statisticsStore.getGoalStatusColor(status)
        },
        
        getGoalStatusText(status: string) {
            return statisticsStore.getGoalStatusText(status)
        },
        
        getPeriodLabel(period: string) {
            return statisticsStore.getPeriodLabel(period)
        },
        
        formatNumber(num: number) {
            return statisticsStore.formatNumber(num)
        },
        
        formatDays(days: number) {
            return statisticsStore.formatDays(days)
        },
        
        formatPercentage(value: number) {
            return statisticsStore.formatPercentage(value)
        },
        
        getPerformanceLevel(score: number) {
            return statisticsStore.getPerformanceLevel(score)
        }
    }
}