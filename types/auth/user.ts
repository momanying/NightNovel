import type { Bookmark } from '../novel/bookmark';
import type { ReadingHistory } from '../novel/readhistory';

export interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
    createdAt?: string;
    role?: string;
    token?: string;
}

export interface UserWithBookmarks extends User {
  bookmarks: Bookmark[];
  reading_history: ReadingHistory[];
}