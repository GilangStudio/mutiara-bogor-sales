<template>
    <div class="min-h-screen p-4">
        <div class="max-w-md mx-auto">
            <!-- Header with Back Button -->
            <div class="mb-6 flex items-center gap-3">
                <button @click="$router.back()" class="p-2 hover:bg-accent rounded-lg transition-colors">
                    <ArrowLeft class="h-5 w-5" />
                </button>
                <div class="flex-1">
                    <h1 class="text-xl font-bold text-foreground">Ubah Status Lead</h1>
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
                <!-- Current Status Card -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <RefreshCw class="h-4 w-4 text-primary" />
                        Status Saat Ini
                    </h3>
                    <div class="flex items-center gap-3">
                        <span 
                            class="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium"
                            :class="getStatusBadgeClass(leadDetail.lead_status.toLowerCase())"
                        >
                            {{ getStatusLabel(leadDetail.lead_status) }}
                        </span>
                        <span class="text-sm text-muted-foreground">
                            Diperbarui {{ leadDetail.metadata.updated_at_formatted }}
                        </span>
                    </div>
                </div>

                <!-- Change Status Form -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-4 flex items-center gap-2">
                        <Settings class="h-4 w-4 text-primary" />
                        Ubah Status
                    </h3>

                    <form @submit.prevent="handleChangeStatus" class="space-y-4">
                        <!-- Status Selection -->
                        <div class="space-y-3">
                            <label class="text-sm font-medium text-foreground">
                                Pilih Status Baru
                            </label>
                            <div class="space-y-2">
                                <div 
                                    v-for="status in statusOptions"
                                    :key="status.value"
                                    class="relative"
                                >
                                    <label 
                                        class="flex items-center p-3 border border-border rounded-lg cursor-pointer transition-all hover:bg-accent/50"
                                        :class="{
                                            'border-primary bg-primary/10': form.status === status.value,
                                            'opacity-50 cursor-not-allowed': status.value === leadDetail.lead_status.toLowerCase()
                                        }"
                                    >
                                        <input
                                            type="radio"
                                            :value="status.value"
                                            v-model="form.status"
                                            :disabled="status.value === leadDetail.lead_status.toLowerCase()"
                                            class="sr-only"
                                        />
                                        <div class="flex items-center gap-3 flex-1">
                                            <div 
                                                class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                                :class="form.status === status.value 
                                                    ? 'border-primary bg-primary' 
                                                    : 'border-muted-foreground'"
                                            >
                                                <div 
                                                    v-if="form.status === status.value"
                                                    class="w-2 h-2 bg-primary-foreground rounded-full"
                                                ></div>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center gap-2">
                                                    <span 
                                                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                        :class="getStatusBadgeClass(status.value)"
                                                    >
                                                        {{ status.label }}
                                                    </span>
                                                    <span 
                                                        v-if="status.value === leadDetail.lead_status.toLowerCase()"
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        (Status Saat Ini)
                                                    </span>
                                                </div>
                                                <div class="text-xs text-muted-foreground mt-1">
                                                    {{ status.description }}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
                        </div>

                        <!-- Error Message -->
                        <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <AlertCircle class="h-4 w-4 text-destructive" />
                                <p class="text-sm text-destructive">{{ errorMessage }}</p>
                            </div>
                        </div>

                        <!-- Success Message -->
                        <div v-if="successMessage" class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
                                <p class="text-sm text-green-700 dark:text-green-300">{{ successMessage }}</p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                @click="$router.back()"
                                class="flex-1 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                            >
                                Batal
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
                                <li>• Perubahan status akan tercatat dalam riwayat lead</li>
                                <li>• Catatan yang ditambahkan akan memperbarui catatan sales</li>
                                <li>• Status yang sama dengan saat ini tidak dapat dipilih</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Lead Info Quick View -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center gap-2">
                        <User class="h-4 w-4 text-primary" />
                        Informasi Lead
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Nama:</span>
                            <span class="font-medium">{{ leadDetail.name }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Telepon:</span>
                            <span class="font-medium">{{ leadDetail.contact_info.formatted_phone }}</span>
                        </div>
                        <div v-if="leadDetail.platform" class="flex justify-between">
                            <span class="text-muted-foreground">Platform:</span>
                            <span class="font-medium">{{ leadDetail.platform.name }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Dibuat:</span>
                            <span class="font-medium">{{ leadDetail.metadata.created_at_formatted }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft, RefreshCw, Settings, AlertCircle, CheckCircle, Info, 
    User, Save, Loader2
} from 'lucide-vue-next'

// Middleware untuk proteksi halaman
definePageMeta({
    middleware: 'auth'
})

// Route dan stores
const route = useRoute()
const router = useRouter()
const toast = useToast()
const changeStatusStore = useChangeStatusStore()

// State
const leadDetail = ref<any>(null)
const isLoadingLead = ref(true)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form state
const form = reactive({
    status: '',
})

const errors = reactive({
    status: ''
})

// Lead ID dari route parameter
const leadId = computed(() => route.params.id)

// Status options
const statusOptions = [
    {
        value: 'new',
        label: 'Baru',
        description: 'Lead baru yang belum diproses'
    },
    {
        value: 'process',
        label: 'Proses',
        description: 'Lead sedang dalam tahap negosiasi atau follow up'
    },
    {
        value: 'closing',
        label: 'Closing',
        description: 'Lead dalam tahap penutupan atau sudah deal'
    }
]

// Computed
const isFormValid = computed(() => {
    return form.status && 
           form.status !== leadDetail.value?.lead_status?.toLowerCase() &&
           !isSubmitting.value
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

const validateForm = () => {
    errors.status = ''
    errorMessage.value = ''
    successMessage.value = ''

    let isValid = true

    if (!form.status) {
        errors.status = 'Status baru wajib dipilih'
        isValid = false
    } else if (form.status === leadDetail.value?.lead_status?.toLowerCase()) {
        errors.status = 'Status baru harus berbeda dari status saat ini'
        isValid = false
    }

    return isValid
}

const handleChangeStatus = async () => {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
        const result = await changeStatusStore.changeLeadStatus(
            parseInt(leadId.value as string),
            form.status as 'new' | 'process' | 'closing',
        )

        if (result.success) {
            // Show success message
            successMessage.value = result.data?.message || 'Status lead berhasil diubah'
            toast.success('Status lead berhasil diubah', 'Berhasil')
            
            // Update lead detail local state
            if (leadDetail.value && result.data?.lead) {
                leadDetail.value.lead_status = result.data.lead.status
                leadDetail.value.metadata.updated_at_formatted = result.data.lead.status_history.changed_at
            }

            // Wait a moment then redirect back
            setTimeout(() => {
                router.back()
            }, 1500)
        } else {
            throw new Error(result.message || 'Gagal mengubah status lead')
        }

    } catch (error: any) {
        console.error('Change status error:', error)
        errorMessage.value = error.message || 'Terjadi kesalahan saat mengubah status lead'
        toast.error(errorMessage.value, 'Error')
    } finally {
        isSubmitting.value = false
    }
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
    title: computed(() => leadDetail.value ? `Ubah Status - ${leadDetail.value.name}` : 'Ubah Status Lead'),
    meta: [
        { 
            name: 'description', 
            content: 'Ubah status lead dalam sistem CRM'
        }
    ]
})
</script>