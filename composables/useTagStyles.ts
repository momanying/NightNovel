import type { Tag } from '@/types/tag';
import { computed } from 'vue';
import type { Ref } from 'vue';

// 定义 Composable 函数
export function useTagStyles(tags: Ref<Tag[] | undefined>) {

  // 计算最大和最小计数的计算属性
  const maxCount = computed(() => {
    if (!tags.value || tags.value.length === 0) return 0;
    return Math.max(...tags.value.map(t => t.count));
  });

  const minCount = computed(() => {
    if (!tags.value || tags.value.length === 0) return 0;
    return Math.min(...tags.value.map(t => t.count));
  });

  // 获取标签字体大小的函数
  const getTagSize = (count: number) => {
    if (!tags.value || maxCount.value === minCount.value) {
        return 14; // 返回默认大小
    }
    // 基础大小 12px, 范围 6px (12px 到 18px)
    return 12 + ((count - minCount.value) / (maxCount.value - minCount.value)) * 6;
  };

  // 获取标签颜色的函数 (保持不变)
  const getTagColor = (id: number | string) => {
    const colors = ['#ff6600', '#00aaff', '#cc00cc', '#66ccff', '#ffcc00', '#99cc00', '#0099ff', '#ff4d4d', '#4dff4d', '#4d4dff'];
    // 使用简单的哈希或模运算来分配颜色
    const numId = Number(String(id).replace(/\D/g, '')) || 0; // 尝试将ID转为数字
    return colors[numId % colors.length];
  };

  // 返回需要的方法
  return {
    getTagSize,
    getTagColor,
  };
} 