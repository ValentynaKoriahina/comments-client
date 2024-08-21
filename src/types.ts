export interface Comment {
  id: number;
  username: string;
  email: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}
