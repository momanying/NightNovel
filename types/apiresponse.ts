export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T | null
}

export interface ApiError {
    code: number
    message: string
}