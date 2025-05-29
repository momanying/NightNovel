<template>
    <div v-if="!userdata.token" class="flex items-center">
        <NuxtLink to="/auth/login">
            <button class="text-sm md:text-base text-white no-underline hover:text-gray-100">登录</button>
        </NuxtLink>
        <NuxtLink to="/auth/register" class="ml-2 md:ml-5">
            <button class="text-sm md:text-base text-white no-underline hover:text-gray-100">注册</button>
        </NuxtLink>
    </div>
    <div v-else class="flex items-center">
        <CommonDropdownMenu 
            :items="userMenuItems" 
            trigger-type="click" 
            position="right"
            min-width="110px"
            dropdown-classes="w-36 md:w-[110px]"
            :close-on-item-click="true"
        >
            <template #trigger="{ toggle }">
                <div
                    class="flex items-center overflow-hidden rounded-full cursor-pointer"
                    @click="toggle"
                >
                    <img class="flex-shrink-0 overflow-hidden rounded-full w-8 h-8 md:w-10 md:h-10 mr-1 md:mr-2" :src="userdata.avatar" alt="avatar">
                    <span class="text-sm md:text-base text-white no-underline hover:text-gray-100 hidden sm:inline">{{ userdata.username }}</span>
                    <!-- Optionally show a chevron or indicator based on isOpen -->
                </div>
            </template>
            <!-- Default item slot will be used, which handles NuxtLink and button actions -->
        </CommonDropdownMenu>
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';
import CommonDropdownMenu from '~/components/Common/DropdownMenu.vue'; // Import the new component

const toast = useToast();
const userStore = useUserStore();

const userdata = computed(() => ({
  username: userStore.username,
  avatar: userStore.avatar,
  token: userStore.token,
}));

// showUserMenu and toggleUserMenu are no longer needed as DropdownMenu handles its own state.

const logout = async () => {
  await userStore.logout();
  toast.success('退出成功');

  setTimeout(() => {
    navigateTo('/auth/login');
  }, 1000);
};

const userMenuItems = computed(() => [
  { label: '个人主页', path: '/user/info' },
  { label: '我的收藏', path: '/user/collection' },
  { label: '我的评论', path: '/user/comment' },
  { label: '退出登录', action: logout }, // action is handled by DropdownMenu
]);

// Click outside to close is now implicitly handled by how the trigger slot interacts with DropdownMenu 
// (if trigger doesn't stop propagation) or by the user clicking an item / pressing Esc.
// The more complex global click-outside listener was removed from DropdownMenu for simplicity with slotted triggers.
</script>
