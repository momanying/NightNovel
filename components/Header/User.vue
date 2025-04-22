<template>
    <div v-if="!userdata.isAuthenticated">
        <NuxtLink to="/auth/login" class="text-white text-2xl no-underline hover:text-gray-100">
            <font-awesome-icon :icon="['fas', 'user']" />
        </NuxtLink>
        <NuxtLink to="/auth/register" class="text-white text-2xl ml-5 no-underline hover:text-gray-100">
            <font-awesome-icon :icon="['fas', 'user-plus']" />
        </NuxtLink>
        </div>
        <div v-else class="flex items-center relative">
        <div
            class="flex items-center overflow-hidden rounded-full cursor-pointer"
            @click="toggleUserMenu"
        >
            <img class="flex-1 overflow-hidden rounded-full w-10 h-10 mr-2" src="http://54.255.84.100/i/2025/04/22/68073a35193b6.jpg" alt="avatar">
            <span class="text-white no-underline hover:text-gray-100">{{ userdata.username }}</span>
        </div>
        <div 
            v-show="showUserMenu" 
            class="w-[110px] absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-50"
        >
            <NuxtLink
                v-for="(item, index) in userMenu[0].userItems"
                :key="index"
                class="block p-2.5 leading-7 text-gray-600 no-underline hover:bg-gray-100"
                @click="userMenu[0].userMethods[index]"
                >
                {{ item }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';

const toast = useToast()
const userStore = useUserStore()

const userdata = computed(() => ({
  username: userStore.getUser?.username,
  email: userStore.getUser?.email,
  avatar: userStore.getUser?.avatar,
  isAuthenticated: userStore.getAuthenticated,
}))

const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
}

const logout = () => {
  userStore.logout();
  navigateTo('/auth/login');
  toast.success('退出成功');
}

// 点击外部区域关闭菜单
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (showUserMenu.value && !target.closest('.relative')) {
      showUserMenu.value = false;
    }
  });
});

const userMenu = [
  {
    userItems:['个人主页', '我的收藏', '我的评论', '退出登录'],
    userMethods:['/user/home','/user/collection','/user/comment',logout]
  }
]
</script>
