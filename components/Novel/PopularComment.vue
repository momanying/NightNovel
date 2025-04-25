<template>
  <div class="max-w-3xl flex-1 text-gray-400 mr-10">
    <h2 class="second-h2">
      总体评价
    </h2>
    <div class="comment-list flex flex-col space-y-4">
      <div v-for="comment in props.comments" :key="comment.id" class="comment-item bg-gray-800 rounded overflow-hidden">
        <div class="comment-header flex justify-between p-2.5 bg-gradient-to-r from-gray-700 to-gray-800">
          <div class="user-info flex items-center">
            <img class="comment-avatar w-10 h-10 rounded-sm" src="/static/02580.jpg" alt="评论者头像">
            <div class="thumb-icon text-2xl text-sky-400 mr-2.5">
                <font-awesome-icon :icon="['fas', comment.icon || 'thumbs-up']" />
            </div>
            <div class="recommendation-text text-white text-sm">
              <div>{{ comment.recommend || '超级推荐' }}</div>
            </div>
          </div>
        </div>
        
        <div class="review-date px-2.5 py-1 text-gray-500 text-xs bg-gray-800">发布于: {{ comment.date || '3 月 28 日' }}</div>
        
        <div class="comment-text -mt-2.5 p-2.5 text-sm leading-relaxed text-gray-400 bg-gray-800">
          {{ comment.text || '不知不觉已经过去17个年头了...岁月不饶人，以前也没啥烦恼，更没人伤害，再也回不到当初的时光了！' }}
        </div>
        
        <div class="review-feedback px-4 py-2.5 bg-gray-800 border-t border-gray-700">
          <div class="feedback-buttons flex space-x-1 mb-2.5">
            <button class="feedback-btn yes bg-gray-700 text-sky-400 px-2.5 py-1 text-xs cursor-pointer rounded-sm transition duration-200 ease-in-out hover:bg-sky-400 hover:text-white">
              <font-awesome-icon :icon="['fas', 'thumbs-up']" class="mr-1 w-4 h-4"/> 是
            </button>
            <button class="feedback-btn no bg-gray-700 text-sky-400 px-2.5 py-1 text-xs cursor-pointer rounded-sm transition duration-200 ease-in-out hover:bg-sky-400 hover:text-white">
              <font-awesome-icon :icon="['fas', 'thumbs-down']" class="mr-1 w-4 h-4"/> 否
            </button>
            <button class="feedback-btn funny bg-gray-700 text-sky-400 px-2.5 py-1 text-xs cursor-pointer rounded-sm transition duration-200 ease-in-out hover:bg-sky-400 hover:text-white">
              <font-awesome-icon :icon="['fas', 'face-laugh']" class="mr-1 w-4 h-4"/> 欢乐
            </button>
          </div>
        </div>
      </div>
    </div>  
  </div>
</template>

<script setup lang="ts">
interface Comment {
  id: number;
  author: string;
  date: string;
  text: string;
  booksOwned?: number;
  reviewCount?: number;
  hoursPlayed?: number;
  helpfulCount?: number;
  recommend?: string;
  avatar?: string;
  icon?: string;
}

// 使用defineProps替代reactive，这样模板可以访问到comments
const props = withDefaults(defineProps<{
  comments?: Comment[]
}>(), {
  comments: () => [
    {
      id: 1,
      author: '장보리',
      date: '3 月 28 日',
      text: '不知不觉已经过去17个年头了...岁月不饶人，以前也没啥烦恼，更没人伤害，再也回不到当初的时光了！',
      booksOwned: 863,
      reviewCount: 20,
      hoursPlayed: 1.3,
      helpfulCount: 19,
      recommend: '非常有趣',
      avatar: '/static/02580.jpg',
      icon: 'face-laugh-beam'
    },
    {
      id: 2,
      author: '李四',
      date: '2023-01-02',
      text: '这本小说情节紧凑，人物形象鲜明，特别是主角的心理描写非常细腻，推荐阅读！',
      recommend: '哭笑不得',
      icon: 'face-grin-squint-tears'
    },
    {
      id: 3,
      author: '王五',
      date: '2023-01-03',
      text: '作为该系列的第三部，剧情已经有些疲软，不过仍保持了作者一贯的文笔水准，值得粉丝阅读。',
      recommend: '泪流满面',
      icon: 'face-sad-cry'
    }
  ]
});
</script>


