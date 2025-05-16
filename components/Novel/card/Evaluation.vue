<template>
    <div>
        <div class="flex">
            <div class="flex items-center">
                <div class="flex">
                    <font-awesome-icon 
                    v-for="n in 5" 
                    :key="n" 
                    :icon="starIconType(n)"
                    class="text-amber-500 mr-0.5 h-3 w-3"
                    />
                </div>
                <span class="mr-2 text-amber-500 text-[10px] font-bold tracking-widest">({{ rating }})</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    rating: {
        type: Number,
        default: 9.9,
    }
})

// 根据评分计算星星类型
const starIconType = (position: number) => {
    // 将评分转换为星星数(满分10分对应5颗星)
    const normalizedRating = props.rating / 2;
    
    if (position <= Math.floor(normalizedRating)) {
        return ['fas', 'star']; // 实心星
    } else if (position <= normalizedRating && Math.floor(normalizedRating) !== Math.ceil(normalizedRating)) {
        return ['fas', 'star-half-alt']; // 半星
    } else {
        return ['far', 'star']; // 空心星
    }
}
</script>
