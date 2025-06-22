// stores/leads.ts
export interface Platform {
    id: number
    platform_name: string
}

export interface Lead {
    id: number
    name: string
    phone: string
    email: string
    message: string
    leads_status: 'new' | 'process' | 'closing'
    leads_note: string
    path_referral: string
    platform: Platform
    is_favorited: boolean
    assignment_type: 'auto' | 'manual'
    date: string
    created_at: string
    formatted_phone: string
    whatsapp_url: string
}

export interface LeadsStatusCount {
    new: number
    process: number
    closing: number
}

export interface PaginationMeta {
    current_page: number
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
}

export interface LeadsResponse {
    leads: PaginationMeta & {
        data: Lead[]
    }
    total_leads_status: LeadsStatusCount
    filters_applied: {
        search?: string
        status?: string
        platform_id?: number
        assignment_type?: string
        is_favorited?: boolean
        date_from?: string
        date_to?: string
    }
    summary: {
        total_filtered: number
        current_page_count: number
        has_more_pages: boolean
    }
}

export interface FilterParams {
    search?: string
    status?: 'new' | 'process' | 'closing'
    platform_id?: number
    assignment_type?: 'auto' | 'manual'
    is_favorited?: boolean
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
}

export interface UpdateLeadData {
    leads_status?: 'new' | 'process' | 'closing'
    leads_note?: string
}

export const useLeadsStore = defineStore('leads', {
    state: () => ({
        leads: [] as Lead[],
        totalLeadsStatus: {
            new: 0,
            process: 0,
            closing: 0
        } as LeadsStatusCount,
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            has_more_pages: false
        },
        filters: {
            search: '',
            status: undefined,
            platform_id: undefined,
            assignment_type: undefined,
            is_favorited: undefined,
            date_from: undefined,
            date_to: undefined
        } as FilterParams,
        isLoading: false,
        isLoadingMore: false,
        error: null as string | null,
        lastFetch: null as Date | null,
        summary: {
            total_filtered: 0,
            current_page_count: 0,
            has_more_pages: false
        }
    }),

    getters: {
        getLeadById: (state) => (id: number) => {
            return state.leads.find(lead => lead.id === id)
        },

        getLeadsByStatus: (state) => (status: 'new' | 'process' | 'closing') => {
            return state.leads.filter(lead => lead.leads_status === status)
        },

        getFavoriteLeads: (state) => {
            return state.leads.filter(lead => lead.is_favorited)
        },

        hasNextPage: (state) => {
            return state.pagination.current_page < state.pagination.last_page
        },

        canLoadMore: (state) => {
            return state.hasNextPage && !state.isLoading && !state.isLoadingMore
        }
    },

    actions: {
        async fetchLeads(params: FilterParams = {}, reset = true) {
            // Jika reset = false, berarti load more (pagination)
            if (reset) {
                this.isLoading = true
                this.error = null
                this.leads = []
                this.pagination.current_page = 1
            } else {
                this.isLoadingMore = true
            }

            try {
                const { $api }: any = useNuxtApp()
                
                // Untuk reset (halaman baru), gunakan params yang diberikan langsung
                // Untuk load more, gunakan filter yang tersimpan
                const finalParams = reset ? {
                    ...params,
                    page: 1,
                    per_page: this.pagination.per_page
                } : {
                    ...this.filters,
                    page: this.pagination.current_page + 1,
                    per_page: this.pagination.per_page
                }

                // Bersihkan parameter yang undefined atau empty string
                const cleanParams = Object.keys(finalParams).reduce((acc, key) => {
                    const value = finalParams[key]
                    if (value !== undefined && value !== '' && value !== null) {
                        acc[key] = value
                    }
                    return acc
                }, {} as any)

                console.log('API Request params:', cleanParams) // Debug log

                const response = await $api('/get_leads', {
                    method: 'GET',
                    query: cleanParams
                })

                if (response.status === 'success' && response.data) {
                    if (reset) {
                        this.setLeadsData(response.data, params)
                    } else {
                        this.appendLeadsData(response.data)
                    }
                    return { success: true, data: response.data }
                } else {
                    throw new Error(response.message || 'Gagal mengambil data leads')
                }
            } catch (error: any) {
                console.error('Error fetching leads:', error)
                this.error = error.message || 'Terjadi kesalahan saat memuat data leads'
                return { success: false, error: this.error }
            } finally {
                this.isLoading = false
                this.isLoadingMore = false
            }
        },

        async loadMoreLeads() {
            if (!this.canLoadMore) return

            return await this.fetchLeads({}, false)
        },

        async searchLeads(searchQuery: string) {
            const params = { ...this.filters, search: searchQuery }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async filterByStatus(status?: 'new' | 'process' | 'closing') {
            const params = { ...this.filters }
            if (status) {
                params.status = status
            } else {
                delete params.status // Hapus status jika undefined
            }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async filterByPlatform(platformId?: number) {
            const params = { ...this.filters }
            if (platformId) {
                params.platform_id = platformId
            } else {
                delete params.platform_id
            }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async filterByAssignmentType(assignmentType?: 'auto' | 'manual') {
            const params = { ...this.filters }
            if (assignmentType) {
                params.assignment_type = assignmentType
            } else {
                delete params.assignment_type
            }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async filterByFavorite(isFavorited?: boolean) {
            const params = { ...this.filters }
            if (isFavorited) {
                params.is_favorited = isFavorited
            } else {
                delete params.is_favorited
            }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async filterByDateRange(dateFrom?: string, dateTo?: string) {
            const params = { ...this.filters }
            if (dateFrom) {
                params.date_from = dateFrom
            } else {
                delete params.date_from
            }
            if (dateTo) {
                params.date_to = dateTo
            } else {
                delete params.date_to
            }
            // Bersihkan undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            })
            return await this.fetchLeads(params, true)
        },

        async applyFilters(filters: FilterParams) {
            // Bersihkan undefined values
            const cleanFilters = Object.keys(filters).reduce((acc, key) => {
                const value = filters[key]
                if (value !== undefined && value !== '' && value !== null) {
                    acc[key] = value
                }
                return acc
            }, {} as any)
            
            return await this.fetchLeads(cleanFilters, true)
        },

        async clearFilters() {
            const emptyFilters = {}
            return await this.fetchLeads(emptyFilters, true)
        },

        async toggleFavorite(leadId: number) {
            const lead = this.getLeadById(leadId)
            if (!lead) {
                throw new Error('Lead tidak ditemukan')
            }

            const originalStatus = lead.is_favorited

            try {
                // Optimistic update
                lead.is_favorited = !lead.is_favorited

                const { $api }: any = useNuxtApp()
                const response = await $api('/toggle_favorite', {
                    method: 'POST',
                    body: {
                        lead_id: leadId,
                        is_favorited: lead.is_favorited
                    }
                })

                if (response.status !== 'success') {
                    // Revert on failure
                    lead.is_favorited = originalStatus
                    throw new Error(response.message || 'Gagal mengubah status favorit')
                }

                return { success: true, is_favorited: lead.is_favorited }
            } catch (error: any) {
                // Revert on error
                lead.is_favorited = originalStatus
                console.error('Error toggling favorite:', error)
                throw error
            }
        },

        async updateLead(leadId: number, data: UpdateLeadData) {
            const lead = this.getLeadById(leadId)
            if (!lead) {
                throw new Error('Lead tidak ditemukan')
            }

            const originalData = {
                leads_status: lead.leads_status,
                leads_note: lead.leads_note
            }

            try {
                // Optimistic update
                if (data.leads_status) lead.leads_status = data.leads_status
                if (data.leads_note !== undefined) lead.leads_note = data.leads_note

                // Update status counts if status changed
                if (data.leads_status && data.leads_status !== originalData.leads_status) {
                    this.updateStatusCounts(originalData.leads_status, data.leads_status)
                }

                const { $api }: any = useNuxtApp()
                const response = await $api('/update_lead', {
                    method: 'PUT',
                    body: {
                        lead_id: leadId,
                        ...data
                    }
                })

                if (response.status !== 'success') {
                    // Revert on failure
                    lead.leads_status = originalData.leads_status
                    lead.leads_note = originalData.leads_note
                    
                    // Revert status counts
                    if (data.leads_status && data.leads_status !== originalData.leads_status) {
                        this.updateStatusCounts(data.leads_status, originalData.leads_status)
                    }
                    
                    throw new Error(response.message || 'Gagal mengupdate lead')
                }

                return { success: true, data: response.data }
            } catch (error: any) {
                // Revert on error
                lead.leads_status = originalData.leads_status
                lead.leads_note = originalData.leads_note
                
                // Revert status counts
                if (data.leads_status && data.leads_status !== originalData.leads_status) {
                    this.updateStatusCounts(data.leads_status, originalData.leads_status)
                }
                
                console.error('Error updating lead:', error)
                throw error
            }
        },

        setLeadsData(data: LeadsResponse, appliedFilters: FilterParams) {
            this.leads = data.leads.data
            this.totalLeadsStatus = data.total_leads_status
            this.pagination = {
                current_page: data.leads.current_page,
                last_page: data.leads.last_page,
                per_page: data.leads.per_page,
                total: data.leads.total,
                has_more_pages: data.summary.has_more_pages
            }
            this.summary = data.summary
            
            // Update filters dengan yang benar-benar diapply, hapus yang undefined
            this.filters = {
                search: appliedFilters.search || '',
                status: appliedFilters.status,
                platform_id: appliedFilters.platform_id,
                assignment_type: appliedFilters.assignment_type,
                is_favorited: appliedFilters.is_favorited,
                date_from: appliedFilters.date_from,
                date_to: appliedFilters.date_to
            }
            
            this.lastFetch = new Date()
            this.error = null
        },

        appendLeadsData(data: LeadsResponse) {
            // Merge new leads, avoiding duplicates
            const newLeads = data.leads.data.filter(newLead => 
                !this.leads.some(existingLead => existingLead.id === newLead.id)
            )
            
            this.leads.push(...newLeads)
            this.pagination = {
                current_page: data.leads.current_page,
                last_page: data.leads.last_page,
                per_page: data.leads.per_page,
                total: data.leads.total,
                has_more_pages: data.summary.has_more_pages
            }
            this.summary = data.summary
        },

        updateStatusCounts(fromStatus: 'new' | 'process' | 'closing', toStatus: 'new' | 'process' | 'closing') {
            if (fromStatus === toStatus) return
            
            // Decrease from old status
            if (this.totalLeadsStatus[fromStatus] > 0) {
                this.totalLeadsStatus[fromStatus]--
            }
            
            // Increase to new status
            this.totalLeadsStatus[toStatus]++
        },

        clearLeads() {
            this.leads = []
            this.totalLeadsStatus = { new: 0, process: 0, closing: 0 }
            this.pagination = {
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: 0,
                has_more_pages: false
            }
            this.summary = {
                total_filtered: 0,
                current_page_count: 0,
                has_more_pages: false
            }
            this.filters = {
                search: '',
                status: undefined,
                platform_id: undefined,
                assignment_type: undefined,
                is_favorited: undefined,
                date_from: undefined,
                date_to: undefined
            }
            this.error = null
            this.lastFetch = null
        },

        // Helper method untuk refresh data
        async refreshLeads() {
            return await this.fetchLeads(this.filters, true)
        }
    }
})