<template>
  <div class="max-w-3xl flex flex-col h-full">
    <div class="flex items-center justify-between">
      <h2 class="title-h2">热门评论</h2>
      <button  class="text-sm text-gray-500 hover:text-primary-500 transition-colors" @click="navigateTo('/comments')">
        查看全部点评
      </button>
    </div>
    
    <div class="flex-grow flex flex-col justify-between">
      <!-- 评论项 - 纵向排列 -->
      <div v-for="(comment, index) in comments" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <img :src="comment.avatar" :alt="comment.username" class="w-8 h-8 rounded-full mr-2">
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ comment.username }}</span>
            <div class="flex ml-3">
              <div v-for="i in 5" :key="i" class="text-yellow-400">
                <Icon :name="i <= comment.rating ? 'ph:star-fill' : 'ph:star'" class="w-4 h-4" />
              </div>
            </div>
          </div>
          <span class="text-sm text-gray-500">{{ comment.date }}</span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 line-clamp-3">{{ comment.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Comment {
  username: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

const navigateTo = (path: string) => {
  navigateTo(path);
};

// 模拟评论数据
const comments = ref<Comment[]>([
  {
    username: "吧诶专属的泪眼",
    avatar: "http://54.255.84.100/i/2025/04/25/680b4a5499364.jpg",
    rating: 5,
    date: "4月21日",
    content: "《夏日口袋》久岛鸣线感想（含剧透）《夏日口袋》冒险，是孩子们的憧憬。夏日口袋作为一款优秀的galgame，其中的线是我最喜欢的线之一，它让我体验了一场充满回忆的旅程。"
  },
  {
    username: "ssss_233z",
    avatar: "http://54.255.84.100/i/2025/04/25/680b4a524e4a8.jpg",
    rating: 5,
    date: "3天前",
    content: "哭了，回味吧夏日口袋我最钟爱的信仰历方在且鸟白鸟眼泪蒙名在流淌状态记得奇可梦还有给力的乒乓球故人都轮番打进舞算通宵也不累"
  },
  {
    username: "春与修罗",
    avatar: "http://54.255.84.100/i/2025/04/25/680b4a53a9d39.jpg",
    rating: 5,
    date: "3天前",
    content: "好玩好，第二集正式进入剧情了，这集观感很好，bgm插入的也环节能令我接受，毕竟要照顾时长不能全部放完，白羽好好看，臊也好可爱 (*´∀｀*)"
  }
]);
</script>
  
  