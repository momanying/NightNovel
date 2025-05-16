// 书签接口定义
export interface IBookmarkData {
  id: string
  userId: string
  novelId: string
  chapterId?: string
  novel: {
    id: string
    title: string
    author: string
    cover_url: string
  }
  updatedAt: string
  createdAt: string
}

// 书签响应接口
export interface BookmarkResponse {
  code: number
  message: string
  data: {
    bookmarks: IBookmarkData[]
  } | {
    bookmarkId: string
  } | {
    count: number
  } | null
  error?: string
} 