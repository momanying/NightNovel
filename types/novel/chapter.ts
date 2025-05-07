export interface Chapter {
    id?: string;
    _id?: string;
    novelId: string;
    volumeId: string;
    title: string;
    order: number;
    word_count: number;
    source_url?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ChapterDetail extends Chapter {
    content: string;
    prev?: {
        id: string;
        title: string;
        order: number;
    } | null;
    next?: {
        id: string;
        title: string;
        order: number;
    } | null;
}