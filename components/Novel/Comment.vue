<template>
  <div class="w-full mt-5">
      <h2 class="title-h2 mb-4">随笔小记</h2>
      <div class="flex flex-col space-y-6 p-5">
          <div
              v-for="(item, index) in commentItems"
              :key="index"
              class="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
              <div class="flex mb-2">

                  <img :src="item.avatar" :alt="item.username" class="w-10 h-10 rounded-lg mr-4">

                  <div class="flex flex-col flex-grow mt-2 w-full">
                    <div class="flex items-center justify-between w-full">
                      <div>
                        <span class="font-bold text-white dark:text-gray-200 text-sm">{{ item.username }}</span>
                        <span class="text-xs text-gray-400 ml-2">{{ item.date }}</span>
                      </div>
                      <div class="flex items-center">
                        <button class="flex text-sm text-blue-300 hover:text-primary-500 mr-3">
                          <font-awesome-icon :icon="['fas', 'thumbs-up']" :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" />
                          {{ item.likes || 0 }}
                        </button>
                        <button class="flex text-sm text-blue-300 hover:text-primary-500">
                          <font-awesome-icon :icon="['fas', 'comment']" :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" />
                          回复
                        </button>
                      </div>
                    </div>
                    <p class="text-white dark:text-gray-300 text-sm mt-3">{{ item.content }}</p>
                    <div v-if="item.replies && item.replies.length > 0" class="mt-5">
                      <div 
                          v-for="(reply, replyIndex) in item.replies" 
                          :key="`reply-${index}-${replyIndex}`"
                          class="pb-2 border-gray-100 dark:border-gray-700 last:border-0"
                      >
                          <div class="flex mb-3">
                            <img :src="reply.avatar" :alt="reply.username" class="w-6 h-6 rounded-lg mr-4">
                            <div class="flex flex-col flex-grow">
                              <div class="flex items-center justify-between w-full">
                                <div>
                                  <span class="font-bold text-white dark:text-gray-200 text-sm">{{ reply.username }}</span>
                                  <span class="text-xs text-gray-400 ml-2">{{ reply.date }}</span>
                                </div>
                                <div class="flex items-center">
                                  <button class="flex text-sm text-blue-300 hover:text-primary-500 mr-3">
                                    <font-awesome-icon :icon="['fas', 'thumbs-up']" :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" />
                                    {{ reply.likes || 0 }}
                                  </button>
                                  <button class="flex text-sm text-blue-300 hover:text-primary-500">
                                    <font-awesome-icon :icon="['fas', 'comment']" :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" />
                                    回复
                                  </button>
                                </div>
                              </div>
                              <div class="mt-2">
                                <p class="text-white dark:text-gray-300 text-sm">
                                  <span v-if="reply.replyTo" class="text-blue-300">@{{ reply.replyTo }} </span>
                                  {{ reply.content }}
                                </p>
                              </div>
                            </div>             
                          </div>
                      </div>
                    </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
interface Reply {
  username: string;
  avatar: string;
  isLive?: boolean;
  date: string;
  content: string;
  replyTo?: string;
  likes?: number;
}

interface Comment {
  username: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  isLive?: boolean;
  likes?: number;
  replies?: Reply[];
}

// 模拟评论数据
const commentItems = ref<Comment[]>([
  {
      username: "现需要修改",
      avatar: "http://54.255.84.100/i/2025/04/25/680b4a5499364.jpg",
      rating: 5,
      date: "2025-05-03 17:23",
      content: "众所周知，游戏里是有看见的那一幕的🐱",
      isLive: true,
      likes: 84,
      replies: [
          {
              username: "韦伦",
              avatar: "http://54.255.84.100/i/2025/04/25/680b4a5499364.jpg",
              isLive: true,
              date: "2025-05-03 18:18",
              content: "动画里也有，但值得都懂🐻",
              likes: 26
          }
      ]
  },
  {
      username: "不为条结效的名",
      avatar: "http://54.255.84.100/i/2025/04/25/680b4a524e4a8.jpg",
      rating: 4,
      date: "2025-05-05 09:36",
      isLive: true,
      content: "md我牌打多了看成游戏王里了🧠",
      likes: 5
  },
  {
      username: "孔明_",
      avatar: "http://54.255.84.100/i/2025/04/25/680b4a53a9d39.jpg",
      rating: 3,
      date: "2025-05-06 11:40",
      isLive: true,
      content: "游戏里面没雪雪糕送出去",
      likes: 1
  },
  {
      username: "leonsisi",
      avatar: "http://54.255.84.100/i/2025/04/25/680b4a5499364.jpg",
      rating: 5,
      date: "2025-05-07 08:22",
      isLive: true,
      content: "这游戏有hcg吗",
      likes: 1,
      replies: [
          {
              username: "炖月月",
              avatar: "http://54.255.84.100/i/2025/04/25/680b4a524e4a8.jpg",
              isLive: true,
              date: "2025-05-07 13:04",
              content: "没有 全年龄",
              replyTo: "leonsisi"
          },
          {
              username: "lunala喵",
              isLive: true,
              avatar: "http://54.255.84.100/i/2025/04/25/680b4a524e4a8.jpg",
              date: "2025-05-07 13:46",
              content: "沃，是全年龄向",
              replyTo: "leonsisi",
              likes: 1
          },
          {
              username: "现需要修改",
              isLive: true,
              date: "2025-05-08 21:34",
              avatar: "http://54.255.84.100/i/2025/04/25/680b4a524e4a8.jpg",
              content: "羽依里和我一样是未成年，你觉得呢?",
              replyTo: "leonsisi"
          }
      ]
  },
  {
      username: "xm733e",
      avatar: "http://54.255.84.100/i/2025/04/25/680b4a53a9d39.jpg",
      rating: 4,
      date: "2025-05-20 18:26",
      isLive: true,
      content: "看见什么？苍拔衣服？tv也有啊。。。m😳? 喵喵喵? 那就文字上而已啦😂😂😂",
      likes: 0
  }
]);
</script>