<template>
    <div v-if="!userdata.token" class="flex items-center">
        <NuxtLink to="/auth/login">
            <button class="text-sm md:text-base text-white no-underline hover:text-gray-100">登录</button>
        </NuxtLink>
        <NuxtLink to="/auth/register" class="ml-2 md:ml-5">
            <button class="text-sm md:text-base text-white no-underline hover:text-gray-100">注册</button>
        </NuxtLink>
    </div>
    <div v-else class="flex items-center relative">
        <div
            class="flex items-center overflow-hidden rounded-full cursor-pointer"
            @click="toggleUserMenu"
        >
            <img class="flex-shrink-0 overflow-hidden rounded-full w-8 h-8 md:w-10 md:h-10 mr-1 md:mr-2" :src="userdata.avatar" alt="avatar">
            <span class="text-sm md:text-base text-white no-underline hover:text-gray-100 hidden sm:inline">{{ userdata.username }}</span>
        </div>
        <div 
            v-show="showUserMenu" 
            class="w-36 md:w-[110px] absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-50"
        >
            <NuxtLink
                v-for="(item, index) in userMenuItems"
                :key="index"
                class="block p-2 md:p-2.5 leading-7 text-xs md:text-sm text-gray-600 no-underline hover:bg-gray-100"
                @click="item.action"
            >
                {{ item.label }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';

const toast = useToast()
const userStore = useUserStore()

const userdata = computed(() => ({
  username: userStore.username,
  avatar: userStore.avatar,
  token: userStore.token,
}))

const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
}

const logout = async () => {
  await userStore.logout();
  toast.success('退出成功');

  setTimeout(() => {
    navigateTo('/auth/login');
  }, 1000);
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

const userMenuItems = [
  { label: '个人主页', action: () => navigateTo('/user/info') },
  { label: '我的收藏', action: () => navigateTo('/user/collection') },
  { label: '我的评论', action: () => navigateTo('/user/comment') },
  { label: '退出登录', action: logout },
];
</script>
