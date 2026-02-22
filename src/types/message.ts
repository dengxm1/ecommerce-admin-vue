export interface Message {
  notificationId: number;
  type: 'SYSTEM' | 'PERSONAL' | 'TASK';
  title: string;
  content: string;
  status: 0 | 1;
  createdAt: string;
  readTime?: string;
}

export interface MessagePageParams {
  pageNum: number;
  pageSize: number;
  type?: string;            // 过滤类型
  status?: 0 | 1;           // 过滤状态
}