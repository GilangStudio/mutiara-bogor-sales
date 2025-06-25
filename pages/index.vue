<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
                        <p class="text-muted-foreground">Statistik dan performa leads Anda</p>
                    </div>
                    
                    <button 
                        @click="refreshStatistics"
                        :disabled="statisticsStore.isLoading"
                        class="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': statisticsStore.isLoading }" />
                    </button>
                </div>
            </div>

            <!-- Period Filter -->
            <div class="mb-6">
                <div class="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                
                <!-- Custom Date Range -->
                <div v-if="statisticsStore.getCurrentPeriod === 'custom'" class="mt-3 p-3 bg-card border border-border rounded-lg">
                    <h4 class="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-primary" />
                        Pilih Rentang Tanggal
                    </h4>
                    <div class="space-y-3">
                        <!-- Date Range Picker -->
                        <div class="space-y-2">
                            <label class="text-xs font-medium text-foreground">
                                Rentang Tanggal
                            </label>
                            <div class="relative">
                                <div class="flex items-center gap-2 p-3 bg-background border border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                                     @click="toggleDatePicker">
                                    <Calendar class="h-4 w-4 text-muted-foreground" />
                                    <span class="flex-1 text-sm" :class="dateRangeText ? 'text-foreground' : 'text-muted-foreground'">
                                        {{ dateRangeText || 'Pilih rentang tanggal...' }}
                                    </span>
                                    <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform" 
                                                 :class="{ 'rotate-180': showDatePicker }" />
                                </div>
                                
                                <!-- Date Picker Dropdown -->
                                <div v-if="showDatePicker" class="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                                    <div class="grid grid-cols-2 gap-3 mb-4">
                                        <!-- From Date -->
                                        <div class="space-y-1">
                                            <label class="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                                            <input
                                                v-model="customDateRange.from"
                                                type="date"
                                                :max="customDateRange.to || getCurrentDate()"
                                                class="w-full px-2 py-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                                @change="updateDateRange"
                                            />
                                        </div>
                                        
                                        <!-- To Date -->
                                        <div class="space-y-1">
                                            <label class="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                                            <input
                                                v-model="customDateRange.to"
                                                type="date"
                                                :min="customDateRange.from"
                                                :max="getCurrentDate()"
                                                class="w-full px-2 py-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                                @change="updateDateRange"
                                            />
                                        </div>
                                    </div>
                                    
                                    <!-- Quick Presets -->
                                    <div class="space-y-2 mb-4">
                                        <div class="text-xs font-medium text-muted-foreground">Preset Cepat:</div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <button
                                                v-for="preset in datePresets"
                                                :key="preset.label"
                                                @click="applyDatePreset(preset)"
                                                class="px-2 py-1 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded transition-colors text-left"
                                            >
                                                {{ preset.label }}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="flex gap-2">
                                        <button
                                            @click="applyCustomDateRange"
                                            :disabled="!isCustomRangeValid || statisticsStore.isLoading"
                                            class="flex-1 py-2 px-3 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                        >
                                            <Loader2 v-if="statisticsStore.isLoading" class="h-3 w-3 animate-spin" />
                                            <Check v-else class="h-3 w-3" />
                                            {{ statisticsStore.isLoading ? 'Memuat...' : 'Terapkan' }}
                                        </button>
                                        <button
                                            @click="resetCustomDateRange"
                                            class="py-2 px-3 border border-border text-foreground text-xs rounded hover:bg-accent transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            @click="closeDatePicker"
                                            class="py-2 px-3 text-muted-foreground text-xs rounded hover:bg-accent transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                    
                                    <!-- Error Message -->
                                    <div v-if="customRangeError" class="mt-2 text-xs text-destructive">
                                        {{ customRangeError }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Period Info -->
                <div v-if="periodInfo" class="mt-2 text-xs text-muted-foreground text-center">
                    {{ formatDate(periodInfo.date_from) }} - {{ formatDate(periodInfo.date_to) }} ({{ calculateDaysDifference(periodInfo.date_from, periodInfo.date_to) }} hari)
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
                                {{ statisticsStore.formatNumber(totalStats?.current_period || 0) }}
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
                                {{ statisticsStore.formatPercentage(totalStats.change_percentage) }}
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div class="bg-muted/30 rounded-lg p-3">
                                <div class="text-muted-foreground">Periode Sebelumnya</div>
                                <div class="font-semibold text-foreground">{{ totalStats?.previous_period || 0 }}</div>
                            </div>
                            <div class="bg-muted/30 rounded-lg p-3">
                                <div class="text-muted-foreground">Total Sepanjang Masa</div>
                                <div class="font-semibold text-foreground">{{ statisticsStore.formatNumber(totalStats?.all_time_total || 0) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Goals Progress -->
                <div v-if="goals" v-show="false" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Target class="h-4 w-4 text-primary" />
                        Target Leads {{ getPeriodLabel() }}
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Progress Bar -->
                        <div class="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div 
                                class="h-3 rounded-full transition-all duration-1000 ease-out"
                                :class="goals.status === 'achieved' 
                                    ? 'bg-green-500'
                                    : goals.status === 'on_track'
                                    ? 'bg-blue-500'
                                    : 'bg-red-500'"
                                :style="{ width: `${Math.min(100, Math.max(5, goals.achievement_percentage))}%` }"
                            ></div>
                        </div>
                        
                        <!-- Stats Grid -->
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div class="bg-muted/30 rounded-lg p-3">
                                <div class="text-lg font-bold text-foreground">{{ goals.current }}</div>
                                <div class="text-xs text-muted-foreground">Saat Ini</div>
                            </div>
                            <div class="bg-muted/30 rounded-lg p-3">
                                <div class="text-lg font-bold text-foreground">{{ goals.target }}</div>
                                <div class="text-xs text-muted-foreground">Target</div>
                            </div>
                            <div class="bg-muted/30 rounded-lg p-3">
                                <div class="text-lg font-bold text-foreground">{{ goals.achievement_percentage }}%</div>
                                <div class="text-xs text-muted-foreground">Tercapai</div>
                            </div>
                        </div>
                        
                        <!-- Status Badge -->
                        <div class="text-center">
                            <span 
                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                :class="statisticsStore.getGoalStatusColor(goals.status)"
                            >
                                <CheckCircle v-if="goals.status === 'achieved'" class="h-4 w-4 mr-2" />
                                <TrendingUp v-else-if="goals.status === 'on_track'" class="h-4 w-4 mr-2" />
                                <AlertTriangle v-else class="h-4 w-4 mr-2" />
                                {{ statisticsStore.getGoalStatusText(goals.status) }}
                            </span>
                            <div v-if="goals.remaining > 0" class="text-xs text-muted-foreground mt-2">
                                Sisa {{ goals.remaining }} leads untuk mencapai target
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Distribution -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <PieChart class="h-4 w-4 text-primary" />
                        Distribusi Status
                    </h3>
                    <div class="space-y-4">
                        <div 
                            v-for="status in statusDistribution"
                            :key="status.status"
                            class="space-y-2"
                        >
                            <!-- Status Header -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div 
                                        class="w-3 h-3 rounded-full flex-shrink-0"
                                        :class="statisticsStore.getStatusBarColor(status.status)"
                                    ></div>
                                    <span class="text-sm font-medium text-foreground">{{ statisticsStore.getStatusText(status.status) }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-right">
                                    <div class="text-sm font-bold text-foreground">{{ status.count }}</div>
                                    <div class="text-xs text-muted-foreground min-w-[45px]">({{ status.percentage }}%)</div>
                                </div>
                            </div>
                            
                            <!-- Progress Bar - Full Width -->
                            <div class="w-full">
                                <div class="w-full bg-muted rounded-full h-2">
                                    <div 
                                        class="h-2 rounded-full transition-all duration-700 ease-out"
                                        :class="statisticsStore.getStatusBarColor(status.status)"
                                        :style="{ width: `${Math.max(2, status.percentage)}%` }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div v-if="performanceMetrics" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 class="h-4 w-4 text-primary" />
                        Metrik Performa
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Conversion Rate -->
                        <div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                <TrendingUp class="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div class="text-xl font-bold text-green-800 dark:text-green-200">
                                {{ performanceMetrics.conversion_rate.value }}%
                            </div>
                            <div class="text-xs text-green-600 dark:text-green-400 leading-tight">Conversion Rate</div>
                        </div>
                        
                        <!-- Process Rate -->
                        <!-- <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Activity class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="text-xl font-bold text-blue-800 dark:text-blue-200">
                                {{ performanceMetrics.process_rate.value }}%
                            </div>
                            <div class="text-xs text-blue-600 dark:text-blue-400 leading-tight">Process Rate</div>
                        </div> -->
                        
                        <!-- Response Time -->
                        <!-- <div class="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div class="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                                {{ performanceMetrics.avg_response_time.value }}j
                            </div>
                            <div class="text-xs text-yellow-600 dark:text-yellow-400 leading-tight">Rata-rata Respon</div>
                        </div> -->
                        
                        <!-- Productivity Score -->
                        <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Zap class="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div class="text-xl font-bold text-purple-800 dark:text-purple-200">
                                {{ Math.round(performanceMetrics.productivity_score.value) }}
                            </div>
                            <div class="text-xs text-purple-600 dark:text-purple-400 leading-tight">Skor Produktivitas</div>
                        </div>
                    </div>
                    
                    <!-- Performance Level -->
                    <div class="mt-4 text-center" v-show="false">
                        <div class="text-sm text-muted-foreground mb-1">Level Performa Saat Ini:</div>
                        <span 
                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            :class="getPerformanceLevel().color"
                        >
                            {{ getPerformanceLevel().level }}
                        </span>
                    </div>
                </div>

                <!-- Assignment Stats -->
                <div v-if="assignmentStats" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users class="h-4 w-4 text-primary" />
                        Tipe Assignment
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div class="flex items-center justify-center gap-2 mb-3">
                                <Zap class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Otomatis</span>
                            </div>
                            <div class="text-xl font-bold text-blue-800 dark:text-blue-200 mb-1">
                                {{ assignmentStats.automatic.count }}
                            </div>
                            <div class="text-xs text-blue-600 dark:text-blue-400">
                                {{ assignmentStats.automatic.percentage }}% dari total
                            </div>
                        </div>
                        <div class="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                            <div class="flex items-center justify-center gap-2 mb-3">
                                <User class="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Manual</span>
                            </div>
                            <div class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                                {{ assignmentStats.manual.count }}
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ assignmentStats.manual.percentage }}% dari total
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 text-center text-sm text-muted-foreground">
                        Total: {{ assignmentStats.total }} assignments
                    </div>
                </div>

                <!-- Platform Distribution -->
                <div v-if="platformDistribution && platformDistribution.length > 0" class="bg-card border border-border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-foreground flex items-center gap-2">
                            <Globe class="h-4 w-4 text-primary" />
                            Platform Leads
                        </h3>
                        <span class="text-xs text-muted-foreground">Top {{ Math.min(5, platformDistribution.length) }}</span>
                    </div>
                    <div class="space-y-4">
                        <div 
                            v-for="(platform, index) in platformDistribution.slice(0, 5)"
                            :key="platform.platform_id"
                            class="space-y-2"
                        >
                            <!-- Platform Header -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                         :style="{ backgroundColor: getPlatformColor(index) }">
                                        {{ index + 1 }}
                                    </div>
                                    <span class="text-sm font-medium text-foreground truncate">{{ platform.platform_name }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-right">
                                    <span class="text-sm font-bold text-foreground">{{ platform.count }}</span>
                                    <span class="text-xs text-muted-foreground min-w-[45px]">({{ platform.percentage }}%)</span>
                                </div>
                            </div>
                            
                            <!-- Progress Bar - Full Width -->
                            <div class="w-full">
                                <div class="w-full bg-muted rounded-full h-2">
                                    <div 
                                        class="h-2 rounded-full transition-all duration-700 ease-out"
                                        :style="{ 
                                            width: `${Math.max(2, platform.percentage)}%`,
                                            backgroundColor: getPlatformColor(index)
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- Trends Chart Placeholder -->
                <!-- <div v-if="trends && trends.length > 0" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp class="h-4 w-4 text-primary" />
                        Trend Leads
                    </h3>
                    <div class="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        <div class="text-center">
                            <BarChart3 class="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div>Chart akan ditampilkan di sini</div>
                            <div class="text-xs mt-1">{{ trends.length }} data points</div>
                        </div>
                    </div>
                </div> -->

                <!-- Recent Activities -->
                <div v-if="recentActivities && recentActivities.length > 0" class="bg-card border border-border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-foreground flex items-center gap-2">
                            <Activity class="h-4 w-4 text-primary" />
                            Aktivitas Terbaru
                        </h3>
                        <NuxtLink 
                            to="/leads" 
                            class="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                            Lihat Semua
                            <ArrowRight class="h-3 w-3" />
                        </NuxtLink>
                    </div>
                    <div class="space-y-3">
                        <div 
                            v-for="activity in recentActivities.slice(0, 4)"
                            :key="activity.id"
                            class="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            @click="navigateToLead(activity.id)"
                        >
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-foreground truncate">{{ activity.name }}</div>
                                <div class="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                    <Globe class="h-3 w-3" />
                                    <span>{{ activity.platform_name }}</span>
                                    <span>•</span>
                                    <span>{{ activity.updated_diff }}</span>
                                </div>
                            </div>
                            <div class="text-right ml-3">
                                <span 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    :class="getStatusBadgeClass(activity.leads_status.toLowerCase())"
                                >
                                    {{ getStatusLabel(activity.leads_status) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sales Info -->
                <div v-if="salesInfo" class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <UserCheck class="h-4 w-4 text-primary" />
                        Informasi Sales
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <User class="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div class="flex-1">
                                <div class="font-semibold text-foreground">{{ salesInfo.name }}</div>
                                <div class="text-sm text-muted-foreground">{{ salesInfo.email }}</div>
                                <div class="text-xs text-muted-foreground">{{ salesInfo.phone }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-muted-foreground">Order</div>
                                <div class="font-bold text-foreground">#{{ salesInfo.order }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Data Freshness Indicator -->
                <div v-if="statisticsStore.lastFetch" class="text-center text-xs text-muted-foreground">
                    <div class="flex items-center justify-center gap-2">
                        <Clock class="h-3 w-3" />
                        <span>Diperbarui {{ formatLastFetch() }}</span>
                    </div>
                    <div 
                        v-if="statisticsStore.isDataStale"
                        class="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 rounded text-xs"
                    >
                        <AlertTriangle class="h-3 w-3" />
                        Data mungkin sudah lama, silakan refresh
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    AlertCircle, Calendar, TrendingUp, TrendingDown, Minus, Zap, User, Users, 
    RefreshCw, Clock, Target, CheckCircle, AlertTriangle, PieChart, BarChart3,
    Activity, Globe, ArrowRight, UserCheck, Plus, Check, Loader2, ChevronDown
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Stores
const statisticsStore = useStatisticsStore()
const toast = useToast()
const router = useRouter()

// Period options
const periodOptions = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu' },
    { value: 'month', label: 'Bulan' },
    { value: 'quarter', label: 'Kuartal' },
    { value: 'year', label: 'Tahun' },
    { value: 'custom', label: 'Custom' }
]

// Custom date range state
const customDateRange = reactive({
    from: '',
    to: ''
})

const customRangeError = ref('')
const showDatePicker = ref(false)

// Computed for date range text display
const dateRangeText = computed(() => {
    if (customDateRange.from && customDateRange.to) {
        const fromDate = formatDate(customDateRange.from)
        const toDate = formatDate(customDateRange.to)
        const days = calculateDaysDifference(customDateRange.from, customDateRange.to)
        return `${fromDate} - ${toDate} (${days} hari)`
    }
    return ''
})

// Date presets for quick selection
const datePresets = [
    { 
        label: '7 Hari Terakhir', 
        from: () => new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        to: () => new Date()
    },
    { 
        label: '30 Hari Terakhir', 
        from: () => new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        to: () => new Date()
    },
    { 
        label: 'Bulan Ini', 
        from: () => {
            const date = new Date()
            date.setDate(1)
            return date
        },
        to: () => new Date()
    },
    { 
        label: 'Bulan Lalu', 
        from: () => {
            const date = new Date()
            date.setMonth(date.getMonth() - 1, 1)
            return date
        },
        to: () => {
            const date = new Date()
            date.setDate(0)
            return date
        }
    },
    { 
        label: '3 Bulan Terakhir', 
        from: () => {
            const date = new Date()
            date.setMonth(date.getMonth() - 3)
            return date
        },
        to: () => new Date()
    },
    { 
        label: 'Tahun Ini', 
        from: () => {
            const date = new Date()
            date.setMonth(0, 1)
            return date
        },
        to: () => new Date()
    }
]

// Platform colors for charts
const platformColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
]

// Computed properties untuk akses mudah ke data statistik
const totalStats = computed(() => statisticsStore.getTotalStats)
const statusDistribution = computed(() => statisticsStore.getStatusDistribution)
const platformDistribution = computed(() => statisticsStore.getPlatformDistribution)
const performanceMetrics = computed(() => statisticsStore.getPerformanceMetrics)
const recentActivities = computed(() => statisticsStore.getRecentActivities)
const goals = computed(() => statisticsStore.getGoals)
const assignmentStats = computed(() => statisticsStore.getAssignmentStats)
const salesInfo = computed(() => statisticsStore.getSalesInfo)
const periodInfo = computed(() => statisticsStore.getPeriodInfo)
const trends = computed(() => statisticsStore.getTrends)

// Computed
const isCustomRangeValid = computed(() => {
    return customDateRange.from && 
           customDateRange.to && 
           new Date(customDateRange.from) <= new Date(customDateRange.to)
})

// Lifecycle
onMounted(() => {
    fetchStatistics()
    
    // Set default custom range
    const today = new Date()
    const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    
    customDateRange.to = formatDateForInput(today)
    customDateRange.from = formatDateForInput(thirtyDaysAgo)
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
    // Reset custom date range jika bukan custom
    if (period !== 'custom') {
        customDateRange.from = ''
        customDateRange.to = ''
        customRangeError.value = ''
    } else {
        // Set default custom range ke 30 hari terakhir
        const today = new Date()
        const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
        
        customDateRange.to = formatDateForInput(today)
        customDateRange.from = formatDateForInput(thirtyDaysAgo)
    }
    
    try {
        const result = await statisticsStore.setPeriod(period as any)
        if (!result.success) {
            toast.error('Gagal mengubah periode', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal mengubah periode', 'Error')
    }
}

const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
}

const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
}

const applyDatePreset = (preset: any) => {
    customDateRange.from = formatDateForInput(preset.from())
    customDateRange.to = formatDateForInput(preset.to())
    customRangeError.value = ''
}

const validateCustomRange = () => {
    customRangeError.value = ''
    
    if (!customDateRange.from || !customDateRange.to) {
        customRangeError.value = 'Tanggal mulai dan selesai wajib diisi'
        return false
    }
    
    const fromDate = new Date(customDateRange.from)
    const toDate = new Date(customDateRange.to)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    if (fromDate > toDate) {
        customRangeError.value = 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai'
        return false
    }
    
    if (toDate > today) {
        customRangeError.value = 'Tanggal selesai tidak boleh lebih besar dari hari ini'
        return false
    }
    
    // Cek maksimal range (misalnya 1 tahun)
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
        customRangeError.value = 'Rentang tanggal maksimal 1 tahun (365 hari)'
        return false
    }
    
    return true
}

const applyCustomDateRange = async () => {
    if (!validateCustomRange()) return
    
    try {
        const result = await statisticsStore.setCustomDateRange(customDateRange.from, customDateRange.to)
        if (result.success) {
            toast.success('Filter tanggal berhasil diterapkan', 'Filter Diperbarui')
            showDatePicker.value = false
        } else {
            toast.error('Gagal menerapkan filter tanggal', 'Error')
        }
    } catch (error: any) {
        toast.error('Gagal menerapkan filter tanggal', 'Error')
    }
}

const resetCustomDateRange = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    
    customDateRange.to = formatDateForInput(today)
    customDateRange.from = formatDateForInput(thirtyDaysAgo)
    customRangeError.value = ''
}

// Date picker methods
const toggleDatePicker = () => {
    showDatePicker.value = !showDatePicker.value
}

const closeDatePicker = () => {
    showDatePicker.value = false
}

const updateDateRange = () => {
    // Auto update display when dates change
    if (customDateRange.from && customDateRange.to) {
        validateCustomRange()
    }
}

// Close date picker when clicking outside
const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.relative')) {
        showDatePicker.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const getPeriodLabel = () => {
    return statisticsStore.getPeriodLabel(statisticsStore.getCurrentPeriod || 'month')
}

const getStatusLabel = (status: string) => {
    return statisticsStore.getStatusText(status)
}

const getStatusBadgeClass = (status: string) => {
    return statisticsStore.getStatusColor(status)
}

const getPlatformColor = (index: number) => {
    return platformColors[index % platformColors.length]
}

const getPerformanceLevel = () => {
    const score = performanceMetrics.value?.productivity_score.value || 0
    return statisticsStore.getPerformanceLevel(score)
}

const getNewLeadsCount = () => {
    const newStatus = statusDistribution.value.find(s => s.status === 'new')
    return newStatus?.count || 0
}

const navigateToLead = (leadId: number) => {
    router.push(`/leads/${leadId}`)
}

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    } catch {
        return dateString
    }
}

const calculateDaysDifference = (dateFrom: string, dateTo: string) => {
    try {
        const startDate = new Date(dateFrom)
        const endDate = new Date(dateTo)
        
        // Reset waktu ke 00:00:00 untuk perhitungan yang akurat
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)
        
        // Hitung selisih dalam milliseconds lalu convert ke hari
        const diffTime = endDate.getTime() - startDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        // Tambah 1 karena inclusive (termasuk hari pertama dan terakhir)
        // Contoh: 1 Juni - 30 Juni = 29 hari selisih + 1 = 30 hari total
        return Math.max(1, diffDays + 1)
    } catch {
        // Fallback ke backend calculation jika parsing gagal
        return Math.round(periodInfo.value?.days_count || 0)
    }
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