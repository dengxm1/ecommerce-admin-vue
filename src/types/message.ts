export interface Message {
  id: number;
  type: 'SYSTEM' | 'PERSONAL' | 'TASK';
  title: string;
  content: string;
  senderName?: string;      // 个人中心不需要 senderId，只需要名字
  status: 0 | 1;
  createTime: string;
}

export interface MessagePageParams {
  pageNum: number;
  pageSize: number;
  type?: string;            // 过滤类型
  status?: 0 | 1;           // 过滤状态
}