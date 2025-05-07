import type { Tag } from '../tag'

export interface Novel {
  id?: string;
  _id?: string;
  title: string;
  author: string;
  category: string;
  status: string;
  lastUpdate?: string;
  cover_url: string;
  source_site?: string;
  crawl_time?: string;
  word_count: number;
  tags?: Tag[];
  animation?: boolean;
  introduction?: string;
  volumes?: string[];
  views: number;
  rating: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
} 