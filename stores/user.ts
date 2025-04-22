import { defineStore } from 'pinia'
import type { User } from '~/types/auth/user'

interface UserState {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: null,
        token: null,
        isAuthenticated: false,
    }),
    getters: {
        getUser: (state: UserState) => state.user,
        getToken: (state: UserState) => state.token,
        getAuthenticated: (state: UserState) => state.isAuthenticated,
    },
    actions: {
        setUser(user: User) {
            this.user = user;
        },
        setAuthenticated(authenticated: boolean) {
            this.isAuthenticated = authenticated;
        },
        setToken(token: string) {
            this.token = token;
        },
        logout() {
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    persist: true,
})