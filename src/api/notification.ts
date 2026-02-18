import request from '@/utils/request'
import type { BaseResponse } from '@/types/apiType'
import type { Notification } from '@/types/notification'

// 获取未读通知
export function getUnreadNotificationsApi(): Promise<BaseResponse<Notification[]>> {
  return request<BaseResponse<Notification[]>>({
    url: '/notification/unread',
    method: 'get'
  })
}

// 获取所有通知（分页）
export function getNotificationsApi(params: {
  pageNum: number
  pageSize: number
  type?: string
  status?: number | string
}) {
  return request<BaseResponse<{
    list: Notification[]
    total: number
  }>>({
    url: '/notification/list',
    method: 'post',
    data: params
  })
}

// 标记已读
export function markAsReadApi(id: number): Promise<BaseResponse> {
  return request<BaseResponse>({
    url: `/notification/read/${id}`,
    method: 'post'
  })
}

// 全部标记已读
export function markAllAsReadApi(): Promise<BaseResponse> {
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

// 批量删除
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