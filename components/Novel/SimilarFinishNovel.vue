<template>
    <div class="w-full">
        <h2 class="title-h2">同类完本推荐</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="novel in novels" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <div class="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-800">
                    <img 
                        :src="novel.img" 
                        alt="小说封面" 
                        class="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                        @error="handleImageError"
                    >
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <h3 class="text-sm font-medium text-white">{{ novel.title }}</h3>
                    </div>
                </div>
                <h3 class="text-sm font-medium text-white mt-1 truncate">{{ novel.title }}</h3>
                <p class="text-xs text-gray-400 truncate">{{ novel.author }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Novel {
    id: number;
    title: string;
    author: string;
    img: string;
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement;
    target.src = 'http://54.255.84.100/i/2025/04/06/placeholder.jpg'; // 设置默认占位图
};

const novels = ref<Novel[]>([
    {
        id: 1,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/06/67f270603bfdd.jpg'
    },
    {
        id: 2,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/16/67fef3828b151.jpg'
    },
    {
        id: 3,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/16/67fef382852db.jpg'
    },
    {
        id: 4,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/06/67f2705f3ccfc.jpg'
    },
    {
        id: 5,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/06/67f252748efea.jpg'
    }
])
</script>