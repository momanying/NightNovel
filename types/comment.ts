export interface Comment {
    id: number;
    novelId: number;
    userId: number;
    username: string;
    avatar: string;
    content: string;
    rating: number;
    likes: number;
    createdAt: string;
    replies: CommentReply[];
}

export interface CommentReply {
    id: number;
    userId: number;
    username: string;
    avatar: string;
    content: string;
    createdAt: string;
}