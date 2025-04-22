export interface Toast {
    success: (message: string) => void
    error: (message: string) => void
  }
  
  export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T | null
  }
  
  export interface UserData {
    id: string
    username: string
    email: string
    avatar: string
  }
  
  export interface AuthResponse {
    token: string
    user: UserData
  }
  
  declare module '#app' {
    interface NuxtApp {
      $toast: Toast
    }
  }