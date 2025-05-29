export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

export interface ApiPaginatedResponse<T = unknown> {
    comments: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ApiError {
    code: number
    message: string
}