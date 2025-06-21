// stores/leads.ts
export interface Platform {
    id: number
    platform_name: string
}

export interface Lead {
    id: number
    name: string
    mobile: string
    email: string
    message: string
    leads_status: 'new' | 'process' | 'closing'
    leads_note: string
    platform: Platform
    is_favorited: boolean
    date: string
}

export interface LeadsStatusCount {
    new: number
    process: number
    closing: number
}

export interface LeadsData {
    leads: Lead[]
    total_leads_status: LeadsStatusCount
    total_leads: number
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
        totalLeads: 0,
        isLoading: false,
        error: null as string | null,
        lastFetch: null as Date | null
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

        searchLeads: (state) => (query: string) => {
            if (!query) return state.leads
            
            const searchTerm = query.toLowerCase()
            return state.leads.filter(lead => 
                lead.name.toLowerCase().includes(searchTerm) ||
                lead.mobile.includes(searchTerm) ||
                (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
                (lead.message && lead.message.toLowerCase().includes(searchTerm))
            )
        }
    },

    actions: {
        async fetchLeads(forceRefresh = false) {
            // Skip if data is fresh (less than 5 minutes old) and not forcing refresh
            if (!forceRefresh && this.lastFetch && this.leads.length > 0) {
                const now = new Date()
                const diff = now.getTime() - this.lastFetch.getTime()
                const fiveMinutes = 5 * 60 * 1000
                
                if (diff < fiveMinutes) {
                    return { success: true, data: this.getStoreData() }
                }
            }

            this.isLoading = true
            this.error = null

            try {
                const { $api }: any = useNuxtApp()
                const response = await $api('/get_leads', {
                    method: 'GET'
                })

                if (response.status === 'success' && response.data) {
                    this.setLeadsData(response.data)
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
            }
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

        setLeadsData(data: LeadsData) {
            this.leads = data.leads
            this.totalLeadsStatus = data.total_leads_status
            this.totalLeads = data.total_leads
            this.lastFetch = new Date()
            this.error = null
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

        getStoreData(): LeadsData {
            return {
                leads: this.leads,
                total_leads_status: this.totalLeadsStatus,
                total_leads: this.totalLeads
            }
        },

        clearLeads() {
            this.leads = []
            this.totalLeadsStatus = { new: 0, process: 0, closing: 0 }
            this.totalLeads = 0
            this.error = null
            this.lastFetch = null
        },

        // Helper method untuk refresh data
        async refreshLeads() {
            return await this.fetchLeads(true)
        }
    }
})