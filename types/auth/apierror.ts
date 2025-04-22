export interface ApiError {
    data?: {
        message?: string;
        data?: {
            errors?: Record<string, string>;
        }
    }
}