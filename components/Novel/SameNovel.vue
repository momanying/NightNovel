<template>
    <div>
        <h2 class="second-h2">同作家小说</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <div v-for="novel in novels" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <img src="https://placehold.co/28x40" alt="小说封面" class="w-28 h-40 object-cover rounded-md mb-2">
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
        img: 'https://placehold.co/28x40'
    },
    {
        id: 2,
        title: '小说标题',
        author: '作者',
        img: 'https://placehold.co/28x40'
    },
    {
        id: 3,
        title: '小说标题',
        author: '作者',
        img: 'https://placehold.co/28x40'
    },
    {
        id: 4,
        title: '小说标题',
        author: '作者',
        img: 'https://placehold.co/28x40'
    },
    {
        id: 5,
        title: '小说标题',
        author: '作者',
        img: 'https://placehold.co/28x40'
    },
    {
        id: 6,
        title: '小说标题',
        author: '作者',
        img: 'https://placehold.co/28x40'
    },
    
])

</script>
