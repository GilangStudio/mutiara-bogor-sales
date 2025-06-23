<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header with Back Button -->
            <div class="mb-6 flex items-center gap-3">
                <button @click="$router.back()" class="p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </button>
                <div class="flex-1">
                    <h1 class="text-xl font-bold text-foreground">Edit Lead</h1>
                    <p class="text-sm text-muted-foreground">{{ leadDetail?.name || 'Memuat...' }}</p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingLead" class="text-center py-12">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-muted-foreground">Memuat detail lead...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="loadError" class="text-center py-12">
                <div class="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle class="h-10 w-10 text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Gagal Memuat Detail</h3>
                <p class="text-muted-foreground mb-4">{{ loadError }}</p>
                <button 
                    @click="fetchLeadDetail"
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Coba Lagi
                </button>
            </div>

            <!-- Main Content -->
            <div v-else-if="leadDetail" class="space-y-6">
                <!-- Current Lead Info -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <User class="h-4 w-4 text-primary" />
                        Informasi Saat Ini
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Status:</span>
                            <span 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="getStatusBadgeClass(leadDetail.lead_status.toLowerCase())"
                            >
                                {{ getStatusLabel(leadDetail.lead_status) }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Platform:</span>
                            <span class="font-medium">{{ leadDetail.platform.name }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Terakhir diperbarui:</span>
                            <span class="font-medium">{{ leadDetail.metadata.updated_at_formatted }}</span>
                        </div>
                    </div>
                </div>

                <!-- Update Form -->
                <div class="bg-card border border-border rounded-lg p-6">
                    <h3 class="font-semibold mb-4 flex items-center gap-2">
                        <Edit class="h-4 w-4 text-primary" />
                        Edit Informasi Lead
                    </h3>

                    <form @submit.prevent="handleUpdateLead" class="space-y-4">
                        <!-- Name Input -->
                        <div class="space-y-2">
                            <label for="name" class="text-sm font-medium text-foreground">
                                Nama Lengkap <span class="text-destructive">*</span>
                            </label>
                            <input 
                                id="name" 
                                v-model="form.name" 
                                type="text" 
                                placeholder="Masukkan nama lengkap"
                                class="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.name,
                                    'border-border': !errors.name
                                }" 
                                required 
                            />
                            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
                        </div>

                        <!-- Phone Input -->
                        <div class="space-y-2">
                            <label for="phone" class="text-sm font-medium text-foreground">
                                Nomor Telepon <span class="text-destructive">*</span>
                            </label>
                            <div class="relative">
                                <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    id="phone" 
                                    v-model="form.phone" 
                                    type="tel" 
                                    placeholder="08123456789"
                                    class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.phone,
                                        'border-border': !errors.phone
                                    }" 
                                    required 
                                />
                            </div>
                            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
                        </div>

                        <!-- Email Input -->
                        <div class="space-y-2">
                            <label for="email" class="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div class="relative">
                                <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    id="email" 
                                    v-model="form.email" 
                                    type="email" 
                                    placeholder="contoh@email.com"
                                    class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.email,
                                        'border-border': !errors.email
                                    }" 
                                />
                            </div>
                            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
                        </div>

                        <!-- Message Input -->
                        <div class="space-y-2">
                            <label for="message" class="text-sm font-medium text-foreground">
                                Pesan Customer
                            </label>
                            <textarea 
                                id="message" 
                                v-model="form.message" 
                                rows="3"
                                placeholder="Pesan atau inquiry dari customer..."
                                class="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.message,
                                    'border-border': !errors.message
                                }"
                            ></textarea>
                            <div class="flex justify-between">
                                <p v-if="errors.message" class="text-sm text-destructive">{{ errors.message }}</p>
                                <span class="text-xs text-muted-foreground ml-auto">{{ form.message?.length || 0 }}/1000</span>
                            </div>
                        </div>

                        <!-- Note Input -->
                        <div class="space-y-2">
                            <label for="note" class="text-sm font-medium text-foreground">
                                Catatan Sales
                            </label>
                            <textarea 
                                id="note" 
                                v-model="form.note" 
                                rows="3"
                                placeholder="Catatan internal untuk sales..."
                                class="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                :class="{
                                    'border-destructive focus:ring-destructive': errors.note,
                                    'border-border': !errors.note
                                }"
                            ></textarea>
                            <div class="flex justify-between">
                                <p v-if="errors.note" class="text-sm text-destructive">{{ errors.note }}</p>
                                <span class="text-xs text-muted-foreground ml-auto">{{ form.note?.length || 0 }}/500</span>
                            </div>
                        </div>

                        <!-- Path Referral Input -->
                        <div class="space-y-2">
                            <label for="path_referral" class="text-sm font-medium text-foreground">
                                Path Referral
                            </label>
                            <div class="relative">
                                <Link class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    id="path_referral" 
                                    v-model="form.path_referral" 
                                    type="text" 
                                    placeholder="https://example.com/ref"
                                    class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.path_referral,
                                        'border-border': !errors.path_referral
                                    }" 
                                />
                            </div>
                            <p v-if="errors.path_referral" class="text-sm text-destructive">{{ errors.path_referral }}</p>
                        </div>

                        <!-- Error Message -->
                        <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <AlertCircle class="h-4 w-4 text-destructive" />
                                <p class="text-sm text-destructive">{{ errorMessage }}</p>
                            </div>
                        </div>

                        <!-- Success Message -->
                        <!-- <div v-if="successMessage" class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
                                <p class="text-sm text-green-700 dark:text-green-300">{{ successMessage }}</p>
                            </div>
                        </div> -->

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button
                                type="button"
                                @click="resetForm"
                                class="flex-1 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                                :disabled="isSubmitting"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                :disabled="isSubmitting || !isFormValid"
                                class="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
                                <Save v-else class="h-4 w-4" />
                                {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Information Card -->
                <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <Info class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium text-blue-800 dark:text-blue-200 mb-1">Informasi</h3>
                            <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Field yang bertanda * wajib diisi</li>
                                <li>• Nomor telepon harus unik dan tidak boleh sama dengan lead lain</li>
                                <li>• Email jika diisi harus unik dan tidak boleh sama dengan lead lain</li>
                                <li>• Perubahan akan tersimpan dalam riwayat lead</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Lead Quick Stats -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 class="h-4 w-4 text-primary" />
                        Statistik Lead
                    </h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="font-semibold text-foreground">{{ leadDetail.metadata.created_diff }}</div>
                            <div class="text-xs text-muted-foreground">Umur Lead</div>
                        </div>
                        <div class="text-center p-3 bg-muted/30 rounded-lg">
                            <div class="font-semibold text-foreground">{{ leadDetail.metadata.updated_diff }}</div>
                            <div class="text-xs text-muted-foreground">Terakhir Update</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft, User, Edit, Phone, Mail, Link, AlertCircle, CheckCircle, 
    Info, Save, Loader2, BarChart3
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Route dan stores
const route = useRoute()
const router = useRouter()
const toast = useToast()
const updateLeadStore = useUpdateLeadStore()

// State
const leadDetail = ref<any>(null)
const isLoadingLead = ref(true)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form state
const form = reactive({
    name: '',
    phone: '',
    email: '',
    message: '',
    note: '',
    path_referral: ''
})

const errors = reactive({
    name: '',
    phone: '',
    email: '',
    message: '',
    note: '',
    path_referral: ''
})

// Lead ID dari route parameter
const leadId = computed(() => route.params.id)

// Computed
const isFormValid = computed(() => {
    return form.name.trim() !== '' && 
           form.phone.trim() !== '' && 
           !isSubmitting.value &&
           hasChanges.value
})

const hasChanges = computed(() => {
    if (!leadDetail.value) return false
    
    return form.name !== leadDetail.value.name ||
           form.phone !== leadDetail.value.phone ||
           form.email !== (leadDetail.value.email || '') ||
           form.message !== (leadDetail.value.message || '') ||
           form.note !== (leadDetail.value.note || '') ||
           form.path_referral !== (leadDetail.value.path_referral || '')
})

// Lifecycle
onMounted(() => {
    fetchLeadDetail()
})

// Methods
const fetchLeadDetail = async () => {
    if (!leadId.value) {
        loadError.value = 'ID lead tidak valid'
        isLoadingLead.value = false
        return
    }

    try {
        isLoadingLead.value = true
        loadError.value = null

        const { $api }: any = useNuxtApp()
        const response = await $api(`/leads/${leadId.value}`, {
            method: 'GET'
        })

        if (response.status === 'success' && response.data?.lead) {
            leadDetail.value = response.data.lead
            
            // Initialize form with current data
            initializeForm()
        } else {
            throw new Error(response.message || 'Gagal mengambil detail lead')
        }
    } catch (err: any) {
        console.error('Error fetching lead detail:', err)
        loadError.value = err.message || 'Terjadi kesalahan saat memuat detail lead'
        
        if (err.status === 404) {
            loadError.value = 'Lead tidak ditemukan atau Anda tidak memiliki akses'
        } else if (err.status === 401) {
            loadError.value = 'Sesi Anda telah berakhir, silakan login kembali'
        }
    } finally {
        isLoadingLead.value = false
    }
}

const initializeForm = () => {
    if (!leadDetail.value) return
    
    form.name = leadDetail.value.name || ''
    form.phone = leadDetail.value.phone || ''
    form.email = leadDetail.value.email || ''
    form.message = leadDetail.value.message || ''
    form.note = leadDetail.value.note || ''
    form.path_referral = leadDetail.value.path_referral || ''
}

const validateForm = async () => {
    // Clear previous errors
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })
    errorMessage.value = ''
    successMessage.value = ''

    // Validate using store method
    const validation = await updateLeadStore.validateLeadData({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        note: form.note,
        path_referral: form.path_referral
    })

    // Set errors
    Object.assign(errors, validation.errors)

    return validation.valid
}

const handleUpdateLead = async () => {
    const isValid = await validateForm()
    if (!isValid) return

    isSubmitting.value = true

    try {
        const result = await updateLeadStore.updateLead(
            parseInt(leadId.value as string),
            {
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim() || undefined,
                message: form.message.trim() || undefined,
                note: form.note.trim() || undefined,
                path_referral: form.path_referral.trim() || undefined
            }
        )

        if (result.success) {
            // Show success message
            // successMessage.value = result.data?.message || 'Lead berhasil diupdate'
            toast.success('Lead berhasil diupdate', 'Berhasil')
            
            // Update lead detail local state
            if (leadDetail.value && result.data?.lead) {
                Object.assign(leadDetail.value, {
                    name: result.data.lead.name,
                    phone: result.data.lead.phone,
                    email: result.data.lead.email,
                    message: result.data.lead.message,
                    note: result.data.lead.note,
                    path_referral: result.data.lead.path_referral
                })
                
                // Update metadata
                leadDetail.value.metadata.updated_at_formatted = new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }

            // Wait a moment then redirect back
            // setTimeout(() => {
            //     router.back()
            // }, 1500)
        } else {
            throw new Error(result.message || 'Gagal mengupdate lead')
        }

    } catch (error: any) {
        console.error('Update lead error:', error)
        errorMessage.value = error.message || 'Terjadi kesalahan saat mengupdate lead'
        toast.error(errorMessage.value, 'Error')
    } finally {
        isSubmitting.value = false
    }
}

const resetForm = () => {
    initializeForm()
    
    // Clear errors
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })
    errorMessage.value = ''
    // successMessage.value = ''
    
    toast.info('Form direset ke data asli', 'Form Direset')
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

// Head meta
useHead({
    title: computed(() => leadDetail.value ? `Edit ${leadDetail.value.name}` : 'Edit Lead'),
    meta: [
        { 
            name: 'description', 
            content: 'Edit informasi lead dalam sistem CRM'
        }
    ]
})
</script>