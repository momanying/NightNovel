<template>
<div class="w-full h-full">
  <div class="flex h-[400px]">
    <div class="h-full w-[800px]">
      <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4">高分作品</h2>
      <!-- 轮播图区域 -->
      <MainCarousel :novels="featuredNovels" />
    </div>

    <!-- 人气排行 -->
    <div>
      <MainRank :novels="topNovels" />
    </div>
  </div>

  <!-- 人气小说区域 -->
  <div class="bg-sky-500/10 rounded-lg shadow-lg p-5">
    <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">最近更新</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      <div
        v-for="(novel, index) in featuredNovels.slice(0, 10)"
        :key="index"
        class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        @click="navigateToNovel(novel.id)"
      >
        <img
          class="w-full h-56 object-cover rounded-md mb-2"
          :src="novel.cover"
          :alt="novel.title"
          @error="handleImageError"
        >
        <h3 class="text-sm font-medium text-white mt-1">{{ novel.title }}</h3>
        <p class="text-xs text-gray-400">{{ novel.author }}</p>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
// 热门推荐数据
const featuredNovels = [
    {
        id: 1,
        title: "Clannad",
        author: "麻枝准",
        cover: "http://54.255.84.100/i/2025/03/22/67decaae8acbb.jpg",
        description: "在死后的世界里，少年和自称女神的卡兹玛相遇了..."
    },
    {
        id: 2,
        title: "Angel Beats!",
        author: "麻枝准",
        cover: "http://54.255.84.100/i/2025/03/27/67e56c1c31f81.jpg",
        description: "在死后的世界里，少年和自称女神的卡兹玛相遇了..."
    },
    {
        id: 3,
        title: "刀剑神域",
        author: "川原砾",
        cover: "http://54.255.84.100/i/2025/03/21/67dccaece753f.jpg",
        description: "在死后的世界里，少年和自称女神的卡兹玛相遇了..."
    },
    {
        id: 4,
        title: "犬夜叉",
        author: "高桥留美子",
        cover: "http://54.255.84.100/i/2025/03/27/67e56c06b6776.jpg",
        description: '比企谷八幡是个性格古怪的高中生，被强制加入"侍奉部"帮助同学解决问题...'
    },
    {
        id: 5,
        title: "魔法使之夜",
        author: "奈须蘑菇",
        cover: "http://54.255.84.100/i/2025/03/20/67db6d8a39017.jpg",
        description: '兄妹空和白被自称"神"的少年召唤到异世界，在那里一切都通过游戏决定...'
    },
    {
        id: 6,
        title: "凉宫春日的忧郁",
        author: "谷川流",
        cover: "http://54.255.84.100/i/2025/03/20/67db6d99c3bd0.jpg",
        description: '兄妹空和白被自称"神"的少年召唤到异世界，在那里一切都通过游戏决定...'
    },
    {
        id: 7,
        title: "秒速5厘米",
        author: "新海诚",
        cover: "http://54.255.84.100/i/2025/03/20/67db6d984e9b5.jpg",
        description: '兄妹空和白被自称"神"的少年召唤到异世界，在那里一切都通过游戏决定...'
    },
    {
        id: 8,
        title: "空之境界",
        author: "奈须蘑菇",
        cover: "http://54.255.84.100/i/2025/03/20/67db74e13c749.jpg",
        description: '兄妹空和白被自称"神"的少年召唤到异世界，在那里一切都通过游戏决定...'
    },
    {
        id: 9,
        title: "Bad!Daddy亲亲坏老爹",
        author: "野村美月",
        cover: "http://54.255.84.100/i/2025/03/20/67db7f069a1cd.jpg",
        description: '兄妹空和白被自称"神"的少年召唤到异世界，在那里一切都通过游戏决定...'
    },
    {
        id: 10,
        title: "绯弹的亚里亚",
        author: "赤松中学",
        cover: "http://54.255.84.100/i/2025/03/20/67dbc756457c4.jpg",
        description: "游戏即将停服，玩家飞鼠决定留在游戏中直到最后一刻，然而停服时间过后，他发现自己成为了游戏角色..."
    },
    {
        id: 11,
        title: "神曲奏界红",
        author: "榊一郎",
        cover: "http://54.255.84.100/i/2025/03/20/67dbab01410b8.jpg",
        description: '三上悟因过劳死被转生到异世界，获得了"创造万物"的能力...'
    },
    {
        id: 12,
        title: "Fate/Zero",
        author: "虚渊玄",
        cover: "http://54.255.84.100/i/2025/03/20/67dbbea437bda.jpg",
        description: "普通上班族三上悟被刺死后，转生为史莱姆并获得了独特能力..."
    },
];
// 热门排行数据
const topNovels = [
  {
    id: 1,
    title: "关于我在无意间被隔壁的天使变成废柴这件事",
    author: "佐伯さん",
    cover: "http://54.255.84.100/i/2025/03/27/67e57021c96f3.jpg",
    description: "菜月昴被召唤到了异世界，他拥有了死亡回归的能力..."
  },
  {
    id: 2,
    title: "义妹生活",
    author: "三河ごーすと",
    cover: "http://54.255.84.100/i/2025/03/27/67e570cdbaf97.jpg",
    description: "游戏即将停服，玩家飞鼠决定留在游戏中直到最后一刻，然而停服时间过后，他发现自己成为了游戏角色..."
  },
  {
    id: 3,
    title: "有谁规定了现实中不能有恋爱喜剧的？",
    author: "初鹿野创",
    cover: "http://54.255.84.100/i/2025/03/27/67e570dcc91f1.jpg",
    description: '三上悟因过劳死被转生到异世界，获得了"创造万物"的能力...'
  },
  {
    id: 4,
    title: "关于我转生变成史莱姆这档事",
    author: "伏瀬",
    cover: "https://placehold.co/200x300/00ccff/white?text=史莱姆",
    description: "普通上班族三上悟被刺死后，转生为史莱姆并获得了独特能力..."
  },
  {
    id: 5,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  },
  {
    id: 6,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  },
  {
    id: 7,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  },
  {
    id: 8,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  },
  {
    id: 9,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  },
  {
    id: 10,
    title: "魔法科高校的劣等生",
    author: "佐岛勤",
    cover: "https://placehold.co/200x300/cc00ff/white?text=魔法科",
    description: '在魔法已成为实用技术的世界，司波达也作为"劣等生"进入魔法科高中...'
  }
];
// 添加图片错误处理函数
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://placehold.co/200x300/cccccc/333333?text=加载失败';
};

// 添加导航到小说详情页的函数
const navigateToNovel = (id: number) => {
  // 使用Nuxt的navigateTo是更好的方式，但如果需要在新窗口打开，保留原方式
  const path = `/novels/${id}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};
</script>