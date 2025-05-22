<template>
    <div class="w-full">
        <h2 class="title-h2">同类推荐</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="novel in novels" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <img :src="novel.img" alt="小说封面" class="object-cover rounded-md">
                <h3 class="text-sm font-medium text-white mt-1">{{ novel.title }}</h3>
                <p class="text-xs text-gray-400">{{ novel.author }}</p>
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

const novels = ref<Novel[]>([
    {
        id: 1,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/25/680b4e020977e.jpg'
    },
    {
        id: 2,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/25/680b4e0208bcb.jpg'
    },
    {
        id: 3,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/25/680b4e020b46e.jpg'
    },
    {
        id: 4,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/25/680b4e0233fc0.jpg'
    },
    {
        id: 5,
        title: '小说标题',
        author: '作者',
        img: 'http://54.255.84.100/i/2025/04/25/680b4e023927e.jpg'
    },
])

</script>
