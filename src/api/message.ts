import request from '@/utils/request'
import type { BaseResponse, PageResponse } from '@/types/apiType'
import type { Message, MessagePageParams } from '@/types/message'

// 获取个人消息列表
export function getUserMessageListApi(params: MessagePageParams) {
  return request<BaseResponse<PageResponse<Message>>>({
    url: '/notification/list',
    method: 'post',
    data: params
  })
}

// 添加标记已读 API
export function markAsReadApi(id: number) {
  return request<BaseResponse>({
    url: `/notification/read/${id}`,
    method: 'post'
  })
}


// 全部标记为已读
export function markAllAsReadApi() {
  return request<BaseResponse>({
    url: '/notification/read/all',
    method: 'post'
  })
}

// 删除通知
export function deleteNotificationApi(id: number): Promise<BaseResponse> {
  return request<BaseResponse>({
    url: `/notification/${id}`,
    method: 'delete'
  })
}