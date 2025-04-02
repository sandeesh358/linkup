export interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
  coverImage?: string;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
} 