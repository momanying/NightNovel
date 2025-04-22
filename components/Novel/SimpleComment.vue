<template>
    <div class="comments-container mx-auto p-4">
        <!--评论输入区域-->
        <div class="comment-input-area mb-6">
            <h3 class="text-xl font-bold text-white mb-4">发表评论</h3>
            <div class="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="昵称"
                    class="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
                >
                <input
                    type="email"
                    placeholder="邮箱"
                    class="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
                >
            </div>
            <textarea
                rows="4"
                placeholder="写下你的想法..."
                class="w-full bg-gray-700 text-white p-4 rounded-lg resize-none mb-2"
            />
            <div class="flex justify-end">
                <button 
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-200"
                    @click="submitComment"
                >
                    发表评论
                </button>
            </div>
        </div>

        <div class="comments-list">
            <h3 class="text-xl font-bold text-white mb-4">全部评论({{ comments.length }})</h3>
            <div v-if="comments.length === 0" class="text-gray-400 text-center py-8">
                <p class="text-gray-400">暂无评论，快来抢沙发吧！</p>
            </div>
            <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item bg-gray-800 rounded-lg p-4 mb-4"
            >
                <div class="flex items-start gap-4">
                    <div class="avatar w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {{ comment.nickname.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center mb-2">
                            <div>
                                <span class="fond-bold text-white">{{ comment.nickname }}</span>
                                <span class="text-gray-400 text-sm">{{ comment.createdAt }}</span>
                            </div>
                            <button
                                class="text-gray-400 hover:text-white transition duration-200" 
                                @click="replyToComment(comment)"                            
                            >
                                回复
                            </button>
                        </div>
                        <p class="text-gray-300">{{ comment.content }}</p>
                        <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 pl-4 border-l border-gray-700">
                            <div
                                v-for="reply in comment.replies"
                                :key="reply.id"
                                class="mb-3"
                            >
                                <div class="flex justify-between items-center mb-1">
                                    <div>
                                        <span class="font-bold text-white">{{ reply.nickname }}</span>
                                    <span class="text-gray-400 text-sm ml-2">{{ formatDate(reply.createdAt) }}</span>
                                    </div>
                                </div>
                                <p class="text-gray-300">{{ reply.content }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface UserInfo{
    nickname: string;
    email: string;
}

interface Comment{
    id: number;
    nickname: string;
    content: string;
    createdAt: Date;
    replies?: Reply[]
}

interface Reply{
    id: number;
    nickname: string;
    content: string;
    createdAt: Date;
}

const userInfo = ref<UserInfo>({
    nickname: '',
    email: '',
});

const comments = ref<Comment[]>([]);

const commentContent = ref('');

const submitComment = () => {
    if(!userInfo.value.nickname || !commentContent.value){
        alert('请输入昵称和评论内容');
        return;
    }

    const newComment: Comment = {
        id: Date.now(),
        nickname: userInfo.value.nickname,
        content: commentContent.value,
        createdAt: new Date(),
        replies: []
    }

    comments.value.unshift(newComment);
    commentContent.value = '';
}

const replyToComment = (comment: Comment) => {
    if (!userInfo.value.nickname){
        alert('请先填写昵称');
        return;
    }

    const replyContent = prompt('请输入回复内容:');
    if(!replyContent){
        return;
    }
    if (!comment.replies){
        comment.replies = []
    }
    
    comment.replies.push({
        id: Date.now(),
        nickname: userInfo.value.nickname,
        content: replyContent,
        createdAt: new Date(),
    })
}

const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN',{
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
</script>
