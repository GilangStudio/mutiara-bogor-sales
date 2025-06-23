// stores/change-status.ts
export interface ChangeStatusRequest {
    status: 'new' | 'process' | 'closing'
}

export interface StatusHistory {
    old_status: string
    new_status: string
    changed_by: string
    changed_at: string
}

export interface ChangeStatusResponse {
    status: string
    message: string
    data: {
        lead: {
            id: number
            name: string
            status: string
            note: string
            updated_at: string
            status_history: StatusHistory
        }
    } | null
}

export interface ChangeStatusResult {
    success: boolean
    message?: string
    data?: ChangeStatusResponse['data'] & { message?: string }
}

export const useChangeStatusStore = defineStore('changeStatus', {
    state: () => ({
        isLoading: false,
        error: null as string | null,
        lastUpdate: null as Date | null
    }),

    getters: {
        getError: (state) => state.error,
        getIsLoading: (state) => state.isLoading
    },

    actions: {
        async changeLeadStatus(
            leadId: number, 
            status: 'new' | 'process' | 'closing', 
        ): Promise<ChangeStatusResult> {
            this.isLoading = true
            this.error = null

            try {
                // Validasi input
                if (!leadId || leadId <= 0) {
                    throw new Error('ID lead tidak valid')
                }

                if (!status || !['new', 'process', 'closing'].includes(status)) {
                    throw new Error('Status tidak valid')
                }

                const { $api }: any = useNuxtApp()

                // Prepare request body
                const requestBody: ChangeStatusRequest = {
                    status
                }

                console.log('Changing lead status:', { leadId, requestBody }) // Debug log

                // API call to change status
                const response: ChangeStatusResponse = await $api(`/change_status/${leadId}`, {
                    method: 'POST',
                    body: requestBody
                })

                if (response.status === 'success') {
                    this.lastUpdate = new Date()
                    
                    // Update leads store if available
                    try {
                        const leadsStore = useLeadsStore()
                        const existingLead = leadsStore.getLeadById(leadId)
                        
                        if (existingLead && response.data?.lead) {
                            // Update lead in leads store
                            existingLead.leads_status = response.data.lead.status as any
                            
                            // Update status counts in leads store
                            // Note: This is a simplified update, you might want to refetch the counts
                            console.log('Updated lead in store:', existingLead)
                        }
                    } catch (storeError) {
                        console.warn('Failed to update leads store:', storeError)
                        // Don't fail the whole operation if store update fails
                    }

                    return {
                        success: true,
                        message: response.message,
                        data: {
                            ...response.data,
                            message: response.message
                        }
                    }
                } else {
                    throw new Error(response.message || 'Gagal mengubah status lead')
                }

            } catch (error: any) {
                console.error('Change status error:', error)
                
                // Handle different error types
                let errorMessage = 'Terjadi kesalahan saat mengubah status lead'
                
                if (error.status === 401) {
                    errorMessage = 'Sesi Anda telah berakhir, silakan login kembali'
                } else if (error.status === 404) {
                    errorMessage = 'Lead tidak ditemukan atau Anda tidak memiliki akses'
                } else if (error.status === 422) {
                    // Validation error
                    if (error.data?.data?.errors) {
                        const errors = error.data.data.errors
                        const firstError = Object.values(errors)[0]
                        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError as string
                    } else {
                        errorMessage = error.data?.message || 'Data tidak valid'
                    }
                } else if (error.data?.message) {
                    errorMessage = error.data.message
                } else if (error.message) {
                    errorMessage = error.message
                }

                this.error = errorMessage

                return {
                    success: false,
                    message: errorMessage
                }
            } finally {
                this.isLoading = false
            }
        },

        async validateStatusChange(
            leadId: number, 
            currentStatus: string, 
            newStatus: string
        ): Promise<{ valid: boolean; message?: string }> {
            // Client-side validation
            if (currentStatus === newStatus) {
                return {
                    valid: false,
                    message: 'Status baru harus berbeda dari status saat ini'
                }
            }

            if (!['new', 'process', 'closing'].includes(newStatus)) {
                return {
                    valid: false,
                    message: 'Status tidak valid'
                }
            }

            // Additional business logic validation can be added here
            // For example: certain status transitions might be restricted

            return { valid: true }
        },

        clearError() {
            this.error = null
        },

        resetState() {
            this.isLoading = false
            this.error = null
            this.lastUpdate = null
        }
    }
})