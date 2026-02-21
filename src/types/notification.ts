export interface Notification {
  id: number;
  type: 'SYSTEM' | 'PERSONAL' | 'TASK';
  title: string;
  content: string;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  receiverName?: string;
  roleName?: string;
  receiverType: 'ALL' | 'USER' | 'ROLE';
  status?: 0 | 1; // 0未读，1已读
  roleId?: number;
  tenantId: number;
  data?: any;
  totalCount: number; // 总接收人数
  readCount: number; // 已读人数
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