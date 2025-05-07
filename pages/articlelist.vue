<template>
    <div>
    <LayoutsTheHeader />
    
    <!-- 筛选框 -->
    <div class="bg-gray-900 px-4 py-4 mx-10">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <!-- 类型筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">类型筛选</label>
            <div class="relative">
              <select v-model="typeFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in typeOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 语言筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">语言筛选</label>
            <div class="relative">
              <select v-model="languageFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in languageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 平台筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">平台筛选</label>
            <div class="relative">
              <select v-model="platformFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in platformOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- 发行年份 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">发售年份</label>
            <div class="relative">
              <select v-model="yearFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in yearOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 发行月份 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">发售月份</label>
            <div class="relative">
              <select v-model="monthFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in monthOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 资源更新时间 -->
          <div class="flex items-end gap-2">
            <div class="relative flex-grow">
              <label class="text-gray-500 text-xs mb-1 block">资源更新时间</label>
              <div class="relative">
                <select v-model="sortOption" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                  <option v-for="option in sortOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <button class="bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 h-[38px] flex items-center" @click="handleSortOrderToggle">
              <Icon :name="sortDirection === '降序' ? 'heroicons:arrow-down' : 'heroicons:arrow-up'" class="h-4 w-4" />
              <span class="ml-1 text-sm">{{ sortDirection }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
      
      <!-- 主内容区 -->
      <div class="mx-10 py-5">
        <!-- 小说列表 -->
        <div class="space-y-6">
        <div v-if="loading" class="py-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
            <p class="mt-4 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="error" class="py-8 text-center">
            <p class="text-red-500">{{ error }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="()=>fetchNovels">
            重试
            </button>
        </div>

        <template v-else>
            <div class="grid grid-cols-2 gap-2">
                <div v-for="novel in novels" :key="novel.id" class="border rounded-lg overflow-hidden">
                    <div class="flex flex-col h-full">
                        <!-- 小说封面和信息改为上下布局 -->
                        <div class="flex p-4">
                            <!-- 小说封面 -->
                            <div class="flex-shrink-0">
                                <NuxtImg 
                                :src="novel.cover" 
                                :alt="novel.title" 
                                class="h-32 object-cover rounded-md shadow-md"
                                width="90"
                                height="120"
                                loading="lazy"
                                />
                            </div>

                            <!-- 小说基本信息 -->
                            <div class="w-3/4 pl-4">
                                <!-- 标题和作者 -->
                                <h2 class="text-base font-semibold text-blue-800 hover:text-blue-600 mb-1">
                                    <NuxtLink :to="`/novels/${novel.id}`">{{ novel.title }}</NuxtLink>
                                </h2>
                                <div class="text-xs text-gray-600">
                                    作者：<NuxtLink :to="`/authors/${novel.authorId}`" class="hover:text-blue-500">{{ novel.author }}</NuxtLink>
                                </div>
                                <div class="text-xs text-gray-600">
                                    分类：<NuxtLink :to="`/categories/${novel.categoryId}`" class="hover:text-blue-500">{{ novel.category }}</NuxtLink>
                                </div>
                                
                                <!-- 更新信息 -->
                                <div class="text-xs text-gray-600 mt-1">
                                    更新：{{ novel.updateDate }}/字数：{{ novel.wordCount }}
                                    <div>{{ novel.status }}<span v-if="novel.isAnimated" class="text-red-500 ml-1">/已动画化</span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="px-4 pb-4">
                            <!-- 标签 -->
                            <div class="mb-2">
                                <template v-for="(tag, index) in novel.tags.slice(0, 4)" :key="index">
                                    <NuxtLink 
                                    :to="`/tags/${tag.id}`" 
                                    class="inline-block text-xs bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1 hover:bg-gray-700"
                                    >
                                    {{ tag.name }}
                                    </NuxtLink>
                                </template>
                            </div>

                            <!-- 简介 -->
                            <div class="text-xs text-gray-700 mb-3 line-clamp-2">
                                {{ novel.description }}
                            </div>

                            <!-- 操作按钮 -->
                            <div class="flex gap-1 text-xs">
                                <NuxtLink :to="`/novels/${novel.id}/read`" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    阅读
                                </NuxtLink>
                                <button class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" @click="addToBookshelf(novel.id)">
                                    收藏
                                </button>
                                <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="recommendNovel(novel.id)">
                                    推荐
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        </div>

        <!-- 分页 -->
        <div class="mt-8 flex justify-center">
        <div class="flex space-x-2">
            <button
            class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50" 
            :disabled="currentPage <= 1"
            type="button"
            @click="handlePrevPage" 
            >
            上一页
            </button>
            <template v-for="page in totalPages" :key="page">
            <button  
                :class="[
                'px-4 py-2 border rounded',
                currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                ]"
                type="button"
                @click="() => handlePageChange(page)"
            >
                {{ page }}
            </button>
            </template>
            <button 
            class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            type="button"
            @click="handleNextPage" 
            >
            下一页
            </button>
        </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
// 小说列表类型
interface Tag {
  id: number | string
  name: string
}

interface Novel {
  id: number | string
  title: string
  author: string
  authorId: number | string
  category: string
  categoryId: number | string
  cover: string
  updateDate: string
  wordCount: string
  status: string
  isAnimated: boolean
  tags: Tag[]
  description: string
}

// 状态变量
const novels = ref<Novel[]>([])
const loading = ref(true)
const error = ref('')

// 筛选相关状态
const typeFilter = ref('全部类型')
const languageFilter = ref('全部语言')
const platformFilter = ref('全部平台')
const yearFilter = ref('全部年份')
const monthFilter = ref('全部月份')
const sortOption = ref('资源更新时间')
const sortDirection = ref('降序')

// 筛选选项
const typeOptions = ['全部类型', '日本轻小说', '华文轻小说', 'Web轻小说', '轻改漫画', '韩国轻小说']
const languageOptions = ['全部语言']
const platformOptions = ['全部平台', 'GA文库', 'MF文库J', '角川文库', '电击文库', '富士见文库', '小学馆']
const yearOptions = ['全部年份', '2025', '2024', '2023', '2022', '2021']
const monthOptions = ['全部月份', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const sortOptions = ['周点击', '月点击', '周推荐', '月推荐', '周鲜花', '月鲜花', '收藏数', '资源更新时间', '入库时间']

// 处理筛选变化
const handleFilterChange = () => {
  // 这里可以根据筛选条件重新获取数据
  fetchNovels(currentPage.value)
}

// 处理排序方向变化
const handleSortOrderToggle = () => {
  sortDirection.value = sortDirection.value === '降序' ? '升序' : '降序'
  handleFilterChange()
}

// 分页状态
const currentPage = ref(1)
const totalPages = ref(5)
// 每页显示数量，注释掉API调用部分后此变量暂时未使用
const _itemsPerPage = 10

// 模拟获取小说列表数据
const fetchNovels = async (page = 1) => {
  loading.value = true
  error.value = ''
  
  try {
    // 实际项目中应该调用API获取数据
    // const response = await $fetch('/api/novels', {
    //   params: {
    //     page,
    //     pageSize: _itemsPerPage,
    //     type: typeFilter.value !== '全部类型' ? typeFilter.value : undefined,
    //     language: languageFilter.value !== '全部语言' ? languageFilter.value : undefined,
    //     platform: platformFilter.value !== '全部平台' ? platformFilter.value : undefined,
    //     year: yearFilter.value !== '全部年份' ? yearFilter.value : undefined,
    //     month: monthFilter.value !== '全部月份' ? monthFilter.value : undefined,
    //     sortBy: sortOption.value,
    //     sortDirection: sortDirection.value
    //   }
    // })
    
    // 模拟异步获取数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    novels.value = [
      {
        id: 1,
        title: '不亲近任何人的跳级天才幼女，只对我撒娇的',
        author: '八神镜',
        authorId: 101,
        category: 'GA文库',
        categoryId: 201,
        cover: 'http://54.255.84.100/i/2025/03/27/67e56ac2ad562.jpg',
        updateDate: '2025-04-25',
        wordCount: '68K',
        status: '连载中',
        isAnimated: false,
        tags: [
          { id: 1, name: '校园' },
          { id: 2, name: '青春' },
          { id: 3, name: '恋爱' },
          { id: 4, name: '欢乐向' },
          { id: 5, name: '妹妹' }
        ],
        description: '「因为……是你航我的教室里有一个八岁的女孩。跳级的天才少女，外表像公主一样惹人怜……'
      },
      {
        id: 2,
        title: '又妹生活',
        author: '三河ごーすと',
        authorId: 102,
        category: 'MF文库J',
        categoryId: 202,
        cover: 'http://54.255.84.100/i/2025/03/28/67e68a2c3b562.jpg',
        updateDate: '2025-04-25',
        wordCount: '1210K',
        status: '连载中',
        isAnimated: true,
        tags: [
          { id: 1, name: '校园' },
          { id: 2, name: '青春' },
          { id: 3, name: '恋爱' },
          { id: 5, name: '妹妹' }
        ],
        description: '高中生浅村悠太，由于父亲再婚，和学年第一美少女终濑沙季成为同住一个屋檐下的兄妹。'
      },
      {
        id: 3,
        title: '过往惯愧的人物设定已无人使用',
        author: '味井晴佳',
        authorId: 103,
        category: '小学馆',
        categoryId: 203,
        cover: 'http://54.255.84.100/i/2025/03/29/67e76c5d9a421.jpg',
        updateDate: '2025-04-25',
        wordCount: '117K',
        status: '已完结',
        isAnimated: false,
        tags: [
          { id: 6, name: '科幻' },
          { id: 2, name: '青春' },
          { id: 3, name: '恋爱' }
        ],
        description: '「喘来」出现在十九岁的成央面前，那是他在十五岁时为了名演俱乃所创作的虚拟角色。'
      },
      {
        id: 4,
        title: '和魔女共度的七天',
        author: '东野圭吾',
        authorId: 104,
        category: '角川文库',
        categoryId: 204,
        cover: 'http://54.255.84.100/i/2025/03/30/67e87c5d4a789.jpg',
        updateDate: '2025-04-24',
        wordCount: '171K',
        status: '已完结',
        isAnimated: false,
        tags: [
          { id: 6, name: '科幻' },
          { id: 7, name: '悬疑' }
        ],
        description: '★少年冒险×警察推理×幻想科学！那个夏天，发生了许多难以置信的事。 在加强了A'
      },
      {
        id: 5,
        title: '东京暗鸦(东京乌鸦)',
        author: '字野耕平',
        authorId: 105,
        category: '富士见文库',
        categoryId: 205,
        cover: 'http://54.255.84.100/i/2025/03/31/67e98b1d2f456.jpg',
        updateDate: '2025-04-25',
        wordCount: '320K',
        status: '连载中',
        isAnimated: true,
        tags: [
          { id: 1, name: '校园' },
          { id: 8, name: '奇幻' },
          { id: 9, name: '战斗' },
          { id: 10, name: '后宫' },
          { id: 11, name: '青梅竹马' },
          { id: 12, name: '人外' }
        ],
        description: '灵的次害——灵灾多发的现代东京。 大明阴师，安倍晴明的千年后的十御门「土御门」'
      },
      {
        id: 5,
        title: '东京暗鸦(东京乌鸦)',
        author: '字野耕平',
        authorId: 105,
        category: '富士见文库',
        categoryId: 205,
        cover: 'http://54.255.84.100/i/2025/03/31/67e98b1d2f456.jpg',
        updateDate: '2025-04-25',
        wordCount: '320K',
        status: '连载中',
        isAnimated: true,
        tags: [
          { id: 1, name: '校园' },
          { id: 8, name: '奇幻' },
          { id: 9, name: '战斗' },
          { id: 10, name: '后宫' },
          { id: 11, name: '青梅竹马' },
          { id: 12, name: '人外' }
        ],
        description: '灵的次害——灵灾多发的现代东京。 大明阴师，安倍晴明的千年后的十御门「土御门」'
      },
      {
        id: 5,
        title: '东京暗鸦(东京乌鸦)',
        author: '字野耕平',
        authorId: 105,
        category: '富士见文库',
        categoryId: 205,
        cover: 'http://54.255.84.100/i/2025/03/31/67e98b1d2f456.jpg',
        updateDate: '2025-04-25',
        wordCount: '320K',
        status: '连载中',
        isAnimated: true,
        tags: [
          { id: 1, name: '校园' },
          { id: 8, name: '奇幻' },
          { id: 9, name: '战斗' },
          { id: 10, name: '后宫' },
          { id: 11, name: '青梅竹马' },
          { id: 12, name: '人外' }
        ],
        description: '灵的次害——灵灾多发的现代东京。 大明阴师，安倍晴明的千年后的十御门「土御门」'
      },
      {
        id: 5,
        title: '东京暗鸦(东京乌鸦)',
        author: '字野耕平',
        authorId: 105,
        category: '富士见文库',
        categoryId: 205,
        cover: 'http://54.255.84.100/i/2025/03/31/67e98b1d2f456.jpg',
        updateDate: '2025-04-25',
        wordCount: '320K',
        status: '连载中',
        isAnimated: true,
        tags: [
          { id: 1, name: '校园' },
          { id: 8, name: '奇幻' },
          { id: 9, name: '战斗' },
          { id: 10, name: '后宫' },
          { id: 11, name: '青梅竹马' },
          { id: 12, name: '人外' }
        ],
        description: '灵的次害——灵灾多发的现代东京。 大明阴师，安倍晴明的千年后的十御门「土御门」'
      }
    ]
    
    currentPage.value = page
    loading.value = false
  } catch (err) {
    console.error('获取小说列表失败:', err)
    error.value = '获取小说列表失败，请稍后再试'
    loading.value = false
  }
}

// 改变页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchNovels(page)
}

// 分页处理函数
const handlePageChange = (page: number) => {
  changePage(page)
}

const handlePrevPage = () => {
  changePage(currentPage.value - 1)
}

const handleNextPage = () => {
  changePage(currentPage.value + 1)
}

// 添加到书架
const addToBookshelf = (novelId: number | string) => {
  // TODO: 实现添加到书架的逻辑
  console.log('添加到书架:', novelId)
  // 如果有认证系统，可能需要检查用户是否已登录
  // 如果没有登录，可能需要重定向到登录页面
}

// 推荐小说
const recommendNovel = (novelId: number | string) => {
  // TODO: 实现推荐小说的逻辑
  console.log('推荐小说:', novelId)
}

// 生命周期钩子
onMounted(() => {
  fetchNovels()
})

// SEO优化
useHead({
  title: '夜幕轻小说全集',
  meta: [
    { name: 'description', content: '最新轻小说全集列表，包含各种分类、标签的轻小说作品。' }
  ]
})
</script>
