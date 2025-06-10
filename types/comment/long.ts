export interface PopularComment {
  _id: string;
  novelId: string;
  user: UserInfo;
  content: string;
  rating: number;
  likes: string[];
  image: string;
  title: string;
  isEdited: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  featuredOrder: number;
}

export interface UserInfo {
  _id: string;
  username: string;
  avatar: string;
}

export interface PostCommentResponse {
  code: number;
  message: string;
  data: {
    comment: PopularComment;
  };
}