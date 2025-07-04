import { novelApi } from '~/composables/novelapi'
import { userApi } from '~/composables/userapi'
// 定义API类型
interface ApiInstance {
    novel: typeof novelApi;
    user: typeof userApi;
}

// 扩展 Nuxt 应用的类型
declare module '#app' {
    interface NuxtApp {
        $api: ApiInstance;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: ApiInstance;
    }
}

export default defineNuxtPlugin(() => {
    const api: ApiInstance = {
        novel: novelApi,
        user: userApi,
    };

    return {
        provide: {
            api,
        },
    };
});


  
