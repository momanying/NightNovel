<template>
  <div class="relative" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <slot name="trigger" :toggle="toggleDropdown" :is-open="isOpen"/>
    <transition name="dropdown-transition" @enter="onEnter" @leave="onLeave">
      <div 
        v-show="isOpen"
        ref="dropdownPanelRef"
        class="absolute z-50 bg-white border border-gray-200 shadow-md rounded-md overflow-y-auto"
        :class="[dropdownClasses, positionClasses]"
        :style="{ minWidth: minWidth, maxHeight: maxHeight }"
        @mouseenter="cancelCloseMenu" 
        @mouseleave="handleMouseLeavePanel"
      >
        <slot name="header"/>
        <ul>
          <li v-for="(item, index) in items" :key="index">
            <slot name="item" :item="item" :index="index" :handle-item-click="() => handleItemClick(item)">
              <!-- Default item rendering -->
              <NuxtLink 
                v-if="item.path"
                :to="item.path"
                class="block p-2.5 leading-7 text-gray-600 no-underline hover:bg-gray-100"
                @click="handleItemClick(item)"
              >
                {{ item.label }}
              </NuxtLink>
              <button 
                v-else-if="item.action"
                class="block w-full text-left p-2.5 leading-7 text-gray-600 no-underline hover:bg-gray-100"
                @click="handleItemClick(item)"
              >
                {{ item.label }}
              </button>
              <span v-else class="block p-2.5 leading-7 text-gray-600">
                {{ item.label }} <!-- Fallback for items without path or action -->
              </span>
            </slot>
          </li>
        </ul>
        <slot name="footer"/>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

interface MenuItem {
  label: string;
  path?: string;
  action?: () => void;
}

interface Props {
  items: MenuItem[];
  triggerType?: 'hover' | 'click';
  dropdownClasses?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  position?: 'left' | 'right'; // Simplified position, can be expanded
  minWidth?: string;
  maxHeight?: string;
  closeOnItemClick?: boolean;
  closeDelay?: number; // ms, for hover trigger
}

const props = withDefaults(defineProps<Props>(), {
  triggerType: 'hover',
  dropdownClasses: '',
  position: 'left',
  minWidth: '120px',
  maxHeight: '400px',
  closeOnItemClick: true,
  closeDelay: 300,
});

const emit = defineEmits(['item-click', 'opened', 'closed']);

const isOpen = ref(false);
const dropdownPanelRef = ref<HTMLDivElement | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const positionClasses = computed(() => {
  return props.position === 'left' ? 'left-0 top-full mt-1' : 'right-0 top-full mt-1';
});

const openDropdown = () => {
  if (closeTimer) clearTimeout(closeTimer);
  if (!isOpen.value) {
    isOpen.value = true;
    emit('opened');
  }
};

const closeDropdown = (immediate = false) => {
  if (immediate) {
    if (isOpen.value) {
        isOpen.value = false;
        emit('closed');
    }
  } else {
    closeTimer = setTimeout(() => {
      if (isOpen.value) {
        isOpen.value = false;
        emit('closed');
      }
    }, props.closeDelay);
  }
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown(true); 
  } else {
    openDropdown();
  }
};

const cancelCloseMenu = () => {
  if (closeTimer) clearTimeout(closeTimer);
};

const handleMouseEnter = () => {
  if (props.triggerType === 'hover') {
    openDropdown();
  }
};

const handleMouseLeave = () => {
  if (props.triggerType === 'hover') {
    closeDropdown();
  }
};

const handleMouseLeavePanel = () => {
  if (props.triggerType === 'hover') {
    closeDropdown();
  }
};

const handleItemClick = (item: MenuItem) => {
  emit('item-click', item);
  if (item.action) {
    item.action();
  }
  if (props.closeOnItemClick) {
    closeDropdown(true);
  }
};

// Transition hooks
const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  const height = element.scrollHeight;
  element.style.height = '0px';
  requestAnimationFrame(() => {
    element.style.height = `${height}px`;
    element.style.opacity = '1';
  });
  element.addEventListener('transitionend', done, { once: true });
};

const onLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  requestAnimationFrame(() => {
    element.style.height = '0px';
    element.style.opacity = '0';
  });
  element.addEventListener('transitionend', done, { once: true });
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown(true);
  }
};

onMounted(() => {
  if (props.triggerType === 'click') {
    // It's better if the trigger slot calls toggleDropdown on click.
    // Adding global listener as a fallback or for complex trigger scenarios.
  }
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  if (closeTimer) clearTimeout(closeTimer);
});

</script>

<style scoped>
.dropdown-transition-enter-active,
.dropdown-transition-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.dropdown-transition-enter-from,
.dropdown-transition-leave-to {
  height: 0 !important;
  opacity: 0;
}
.dropdown-transition-enter-to, 
.dropdown-transition-leave-from {
  opacity: 1;
  /* Height is set dynamically in JS */
}
</style> 