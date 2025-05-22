<template>
    <div class="dark:bg-gray-800 rounded-lg shadow">
        <h2 class="title-h2">同类完本推荐</h2>
        <ul>
            <li v-for="(novel, index) in novels" :key="novel.id" class="py-2">
                <div v-if="index === 0" class="flex items-start">
                    <NuxtImg :src="novel.img" :alt="novel.title" class="w-16 h-24 rounded object-cover mr-3 flex-shrink-0" format="webp" sizes="64px" />
                    <div class="ml-10">
                        <h3 class="text-base font-medium text-white dark:text-white mb-0.5 line-clamp-2">{{ novel.title }}</h3>
                        <span class="text-sm text-gray-600 dark:text-gray-400 mb-0.5">{{ novel.author }}</span>
                        <span class="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-sm self-start">{{ novel.category || '[小学馆]' }}</span>
                    </div>
                </div>
                <div v-else class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <a href="#" class="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors flex-1 truncate pr-2">{{ novel.title }}</a>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ novel.author }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
interface Novel {
    id: number;
    title: string;
    author: string;
    img: string;
    category?: string; // 添加可选的分类字段
}

const novels = ref<Novel[]>([
    {
        id: 1,
        title: '败北女角太多了！', // 示例标题
        author: '雨森焚火',        // 示例作者
        img: 'http://54.255.84.100/i/2025/04/06/67f270603bfdd.jpg',
        category: '[小学馆]'    // 示例分类
    },
    {
        id: 2,
        title: '义妹生活',
        author: '三河ごーすと',
        img: 'http://54.255.84.100/i/2025/04/16/67fef3828b151.jpg' // 其他项不需要图片显示在主列表
    },
    {
        id: 3,
        title: '配角在学院中生成...',
        author: 'コリンタ',
        img: 'http://54.255.84.100/i/2025/04/16/67fef382852db.jpg'
    },
    {
        id: 4,
        title: '欢迎来到实力至上...',
        author: '衣笠彰梧',
        img: 'http://54.255.84.100/i/2025/04/06/67f2705f3ccfc.jpg'
    },
    {
        id: 5,
        title: '在男性禁入的游戏...',
        author: '端樱了',
        img: 'http://54.255.84.100/i/2025/04/06/67f252748efea.jpg'
    },
    {
        id: 6,
        title: '安达与岛村',
        author: '入间人间',
        img: 'http://example.com/placeholder.jpg' // 示例，实际应有图片URL
    },
    {
        id: 7,
        title: '关于我在无意间...',
        author: '佐伯さん',
        img: 'http://example.com/placeholder.jpg'
    }
]);

</script>
