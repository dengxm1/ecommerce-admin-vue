export interface Notification {
  id: number;
  type: 'SYSTEM' | 'PERSONAL' | 'TASK';
  title: string;
  content: string;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  receiverType: 'ALL' | 'USER' | 'ROLE';
  roleId?: number;
  tenantId: number;
  data?: any;
  status: 0 | 1; // 0-未读 1-已读
  createTime: string;
  readTime?: string;
}

export interface WebSocketMessage<T = any> {
  messageId: string;
  type: 'NOTIFICATION' | 'BROADCAST' | 'ROLE_NOTIFICATION' | 'ONLINE_COUNT';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: T;
  timestamp: string;
}

export interface UnreadCount {
  total: number;
  system: number;
  personal: number;
  task: number;
}