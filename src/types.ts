export interface Comment {
  id: number;
  username: string;
  email: string;
  content: string;
  filename: string;
  createdAt: string;
  replies?: Comment[];
}
