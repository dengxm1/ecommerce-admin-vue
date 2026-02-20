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