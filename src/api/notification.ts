import request from '@/utils/request'
import type { BaseResponse } from '@/types/apiType'
import type { Notification } from '@/types/notification'

// 管理员获取通知列表
export function getAdminNotificationsApi(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  type?: string
  status?: number | null,
  receiverType?: string
  senderId?: number
  dateRange?: string[]
}) {
  return request<BaseResponse<{
    list: Notification[]
    total: number
    pageNum: number
    pageSize: number
  }>>({
    url: '/notification/admin/list',
    method: 'post',
    data: params
  })
}

// 获取未读通知
export function getUnreadNotificationsApi(): Promise<BaseResponse<Notification[]>> {
  return request<BaseResponse<Notification[]>>({
    url: '/notification/unread',
    method: 'get'
  })
}

// 管理员批量删除
export function batchDeleteNotificationsApi(ids: number[]): Promise<BaseResponse> {
  return request<BaseResponse>({
    url: '/notification/batch',
    method: 'delete',
    data: ids
  })
}

// 发送系统公告（需要权限）
export function sendAnnouncementApi(data: {
  title: string
  content: string
}): Promise<BaseResponse> {
  return request<BaseResponse>({
    url: '/notification/announcement',
    method: 'post',
    data
  })
}

// 发送个人通知（需要权限）
export function sendPersonalNotificationApi(data: {
  receiverId: number
  title: string
  content: string
}): Promise<BaseResponse> {
  return request<BaseResponse>({
    url: '/notification/personal',
    method: 'post',
    data
  })
}

// 获取在线人数
export function getOnlineCountApi(): Promise<BaseResponse<number>> {
  return request<BaseResponse<number>>({
    url: '/notification/online-count',
    method: 'get'
  })
}