import type { Novel } from './novelinfo'

export interface NovelListResponse {
    code: number
    message: string
    data: {
        novels: Novel[]
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
        }
    }
}