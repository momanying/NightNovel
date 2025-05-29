export interface Novel {
  id?: string;
  _id?: string;
  title: string;
  author: string;
  category?: string;
  status?: string;
  lastUpdate?: string;
  cover_url: string;
  word_count?: number;
  tags?: string;
  views?: number;
  animation?: boolean;
  introduction?: string;
  volumes?: string[];
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
} 