export interface Novel {
    id: number;
    title: string;
    author: string;
    cover: string;
    category: string;
    status: string;
    description: string;
    views: number;
    rating: number;
    latestChapter: string;
    updateTime: string;
    totalChapters?: number;
    tags?: string[];
  }
  