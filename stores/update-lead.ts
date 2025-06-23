// stores/update-lead.ts
export interface UpdateLeadRequest {
    name: string
    phone: string
    email?: string
    message?: string
    note?: string
    path_referral?: string
}

export interface UpdatedLead {
    id: number
    name: string
    phone: string
    email: string
    message: string
    note: string
    path_referral: string
    updated_at: string
}

export interface UpdateLeadResponse {
    status: string
    message: string
    data: {
        lead: UpdatedLead
    } | null
}

export interface UpdateLeadResult {
    success: boolean
    message?: string
    data?: UpdateLeadResponse['data'] & { message?: string }
}

export const useUpdateLeadStore = defineStore('updateLead', {
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
        async updateLead(
            leadId: number, 
            leadData: UpdateLeadRequest
        ): Promise<UpdateLeadResult> {
            this.isLoading = true
            this.error = null

            try {
                // Validasi input
                if (!leadId || leadId <= 0) {
                    throw new Error('ID lead tidak valid')
                }

                if (!leadData.name?.trim()) {
                    throw new Error('Nama wajib diisi')
                }

                if (!leadData.phone?.trim()) {
                    throw new Error('Nomor telepon wajib diisi')
                }

                // Validasi format phone
                const phoneRegex = /^([0-9\s\-\+\(\)]*)$/
                if (!phoneRegex.test(leadData.phone)) {
                    throw new Error('Format nomor telepon tidak valid')
                }

                // Validasi panjang phone
                if (leadData.phone.length < 10 || leadData.phone.length > 15) {
                    throw new Error('Nomor telepon harus antara 10-15 karakter')
                }

                // Validasi email jika diisi
                if (leadData.email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(leadData.email)) {
                        throw new Error('Format email tidak valid')
                    }
                }

                const { $api }: any = useNuxtApp()

                console.log('Updating lead:', { leadId, leadData }) // Debug log

                // API call to update lead
                const response: UpdateLeadResponse = await $api(`/update_lead/${leadId}`, {
                    method: 'PUT',
                    body: leadData
                })

                if (response.status === 'success') {
                    this.lastUpdate = new Date()
                    
                    // Update leads store if available
                    try {
                        const leadsStore = useLeadsStore()
                        const existingLead = leadsStore.getLeadById(leadId)
                        
                        if (existingLead && response.data?.lead) {
                            // Update lead in leads store
                            Object.assign(existingLead, {
                                name: response.data.lead.name,
                                phone: response.data.lead.phone,
                                email: response.data.lead.email,
                                message: response.data.lead.message,
                                leads_note: response.data.lead.note,
                                path_referral: response.data.lead.path_referral
                            })
                            
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
                    throw new Error(response.message || 'Gagal mengupdate lead')
                }

            } catch (error: any) {
                console.error('Update lead error:', error)
                
                // Handle different error types
                let errorMessage = 'Terjadi kesalahan saat mengupdate lead'
                
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

        async validateLeadData(leadData: UpdateLeadRequest): Promise<{ valid: boolean; errors: Record<string, string> }> {
            const errors: Record<string, string> = {}

            // Validasi nama
            if (!leadData.name?.trim()) {
                errors.name = 'Nama wajib diisi'
            } else if (leadData.name.length > 255) {
                errors.name = 'Nama maksimal 255 karakter'
            }

            // Validasi phone
            if (!leadData.phone?.trim()) {
                errors.phone = 'Nomor telepon wajib diisi'
            } else {
                const phoneRegex = /^([0-9\s\-\+\(\)]*)$/
                if (!phoneRegex.test(leadData.phone)) {
                    errors.phone = 'Format nomor telepon tidak valid'
                } else if (leadData.phone.length < 10) {
                    errors.phone = 'Nomor telepon minimal 10 digit'
                } else if (leadData.phone.length > 15) {
                    errors.phone = 'Nomor telepon maksimal 15 karakter'
                }
            }

            // Validasi email
            if (leadData.email && leadData.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(leadData.email)) {
                    errors.email = 'Format email tidak valid'
                } else if (leadData.email.length > 255) {
                    errors.email = 'Email maksimal 255 karakter'
                }
            }

            // Validasi message
            if (leadData.message && leadData.message.length > 1000) {
                errors.message = 'Pesan maksimal 1000 karakter'
            }

            // Validasi note
            if (leadData.note && leadData.note.length > 500) {
                errors.note = 'Catatan maksimal 500 karakter'
            }

            // Validasi path_referral
            if (leadData.path_referral && leadData.path_referral.length > 255) {
                errors.path_referral = 'Path referral maksimal 255 karakter'
            }

            return {
                valid: Object.keys(errors).length === 0,
                errors
            }
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