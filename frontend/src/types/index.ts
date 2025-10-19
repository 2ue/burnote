export interface CreateShareRequest {
  content: string;
  password?: string;
  maxViews?: number;
  expiresAt?: string;
}

export interface ViewShareRequest {
  password?: string;
}

export interface Share {
  id: string;
  content: string;
  viewCount: number;
  maxViews?: number;
  expiresAt?: string;
  createdAt: string;
}
