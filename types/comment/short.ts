export interface UserInfo { // Basic user info, can be expanded
  _id: string;
  username: string;
  avatar: string;
}

export interface Reply {
  _id: string;
  parentCommentId: string;
  user: UserInfo; // Changed from username/avatar string to UserInfo object
  content: string;
  likes: string[]; // Array of user IDs who liked
  replyTo?: UserInfo; // User being replied to directly
  createdAt: string;
  updatedAt: string;
  isLive?: boolean; // Retained if still used, backend might not populate
}

export interface Comment {
  _id: string;
  novelId: string;
  user: UserInfo; // Changed from username/avatar string to UserInfo object
  content: string;
  rating?: number;
  likes: string[]; // Array of user IDs who liked
  replies: Reply[]; // Replies can be populated or fetched separately
  createdAt: string;
  updatedAt: string;
  isLive?: boolean; // Retained if still used
  image?: string;
} 