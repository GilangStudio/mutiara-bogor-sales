export interface LeadDetail {
    id: number
    name: string
    phone: string
    email: string
    message: string
    lead_status: 'new' | 'process' | 'closing'
    note: string
    path_referral: string
    platform: {
        id: number
        name: string
    }
    assignment_info: {
        type: 'auto' | 'manual'
        type_text: string
        assigned_at: string
        assigned_by: {
            id: number
            name: string
            phone: string
            email: string
        }
    }
    is_favorited: boolean
    contact_info: {
        formatted_phone: string
        whatsapp_url: string
        email_url: string | null
    }
    movement_history: MovementHistory[]
    timeline: TimelineEvent[]
    metadata: {
        created_at: string
        created_at_formatted: string
        created_by: {
            id: number
            name: string
        } | null
        updated_at: string
        updated_at_formatted: string
        updated_by: {
            id: number
            name: string
        } | null
        created_diff: string
        updated_diff: string
    }
}

export interface MovementHistory {
    id: number
    from_sales: {
        id: number
        name: string
    }
    to_sales: {
        id: number
        name: string
    }
    moved_at: string
    moved_at_diff: string
}

export interface TimelineEvent {
    title: string
    time: string
    description?: string
}

export interface LeadDetailResponse {
    status: string
    message: string
    data: {
        lead: LeadDetail
    }
}