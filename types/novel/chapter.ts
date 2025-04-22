export interface Chapter {
    id: number;
    title: string;
    novelId: number;
    chapterNumber: number;
    wordCount: number;
    updatedAt: string;
}

export interface ChapterDetail extends Chapter {
    content: string;
    prevChapterId: number | null;
    nextChapterId: number | null;
}