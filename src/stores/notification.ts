import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import websocketService from '@/utils/websocket'
import { 
  getUnreadNotificationsApi, 
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  getUserMessageListApi
} from '@/api/message'
import {getOnlineCountApi} from '@/api/notification'
import type { Message } from '@/types/message'
import type { PageResponse } from '@/types/apiType'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<Message[]>([])
  const unreadCount = ref(0)
  const onlineCount = ref(0)
  const connected = ref(false)
  const loading = ref(false)
  const isWebSocketInitialized = ref(false)
  const userMessage = ref<PageResponse<Message>>({
    list: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // 计算属性
  const systemNotifications = computed(() => 
    notifications.value.filter(n => n.type === 'SYSTEM')
  )
  
  const personalNotifications = computed(() => 
    notifications.value.filter(n => n.type === 'PERSONAL')
  )
  
  const taskNotifications = computed(() => 
    notifications.value.filter(n => n.type === 'TASK')
  )

  /**
   * 初始化 WebSocket
   */
  const initWebSocket = () => {
    if (isWebSocketInitialized.value) {
      console.log('[NotificationStore] WebSocket 已经初始化，跳过')
      return
    }
    
    console.log('[NotificationStore] 初始化 WebSocket')
    isWebSocketInitialized.value = true

      // 先移除所有旧监听（避免重复）
  websocketService.off('online-count', handleOnlineCount)
  websocketService.off('connect', handleConnect)
  websocketService.off('disconnect', handleDisconnect)
  websocketService.off('error', handleError)
  websocketService.off('notification', handleNewNotification)
  websocketService.off('broadcast', handleBroadcast)
  websocketService.off('unread-count', handleUnreadCount)
  websocketService.off('admin-delete', handleAdminDelete)
  websocketService.off('fetch-online-count', fetchOnlineCount)

    // 监听连接事件
    websocketService.on('connect', handleConnect)
    websocketService.on('fetch-online-count', fetchOnlineCount)
    websocketService.on('disconnect', handleDisconnect)
    websocketService.on('error', handleError)
    websocketService.on('notification', handleNewNotification)
    websocketService.on('broadcast', handleBroadcast)
    websocketService.on('online-count', handleOnlineCount)
    websocketService.on('unread-count', handleUnreadCount)
    websocketService.on('admin-delete', handleAdminDelete)
    
    // 连接 WebSocket
    websocketService.connect()
  }

    /**
   * 检查并连接 WebSocket
   */
  const connectIfNeeded = () => {
    const token = localStorage.getItem('access-token')
    if (token && !websocketService.isConnected()) {
      console.log('[NotificationStore] 检测到token，尝试连接WebSocket')
      initWebSocket()
    }
  }

  /**
   * 处理连接成功
   */
  const handleConnect = () => {
    connected.value = true
    fetchUnreadNotifications()
  }

    /**
   * 获取在线人数
   */
  const fetchOnlineCount = async () => {  
    try {
      const res = await getOnlineCountApi()
      onlineCount.value = res.data || 0
    } catch (error) {
      console.error('获取在线人数失败', error)
    }
  }

  /**
   * 处理断开连接
   */
  const handleDisconnect = () => {
    connected.value = false
  }

  /**
   * 处理错误
   */
  const handleError = (error: any) => {
    console.error('WebSocket 错误:', error)
  }

  /**
   * 处理新通知
   */
  const handleNewNotification = (message: Message) => {
    notifications.value.unshift(message)
    if (message.status === 0) {
      unreadCount.value++
    }
    userMessage.value.list.unshift(message)
    userMessage.value.total = userMessage.value.total + 1
  }

  /**
   * 处理广播
   */
  const handleBroadcast = (message: Message) => {
    notifications.value.unshift(message)
    if (message.status === 0) {
      unreadCount.value++
    }
    userMessage.value.list.unshift(message)
    userMessage.value.total = userMessage.value.total + 1
  }

  const handleAdminDelete = (ids: number[]) => {
    notifications.value = notifications.value.filter(n => !ids.includes(n.notificationId))
    unreadCount.value = notifications.value.filter(n => n.status === 0).length
    userMessage.value.list = userMessage.value.list.filter(m => !ids.includes(m.notificationId))
    userMessage.value.total = userMessage.value.total - ids.length
  }

  /**
   * 处理在线人数更新
   */
  const handleOnlineCount = (count: number) => {
    onlineCount.value = count
  }

  /**
   * 处理未读计数
   */
  const handleUnreadCount = (data: { increment?: boolean }) => {
    if (data.increment) {
      unreadCount.value++
    } else {
      fetchUnreadCount()
    }
  }

  /**
   * 获取未读通知
   */
  const fetchUnreadNotifications = async () => {
    loading.value = true
    try {
      const res = await getUnreadNotificationsApi()
      notifications.value = res.data || []
      unreadCount.value = (res.data || []).filter((n: Message) => n.status === 0).length
    } catch (error) {
      console.error('获取未读通知失败', error)
    } finally {
      loading.value = false
    }
  }


  /**
   * 获取未读数量
   */
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationsApi()
      unreadCount.value = (res.data || []).filter((n: Message) => n.status === 0).length
    } catch (error) {
      console.error('获取未读数量失败', error)
    }
  }

    /**
   * 获取消息中心数据
   */
  const getUserMessageList = async (params: 
    { pageNum: number;
      pageSize: number; 
      type?: string; 
      status?: 0 | 1
     } ={ pageNum: 1, pageSize: 10 }
  ) => {
    try {
      const res = await getUserMessageListApi(params)
      userMessage.value = res.data || {
      list: [],
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 0
    }
      return res.data || {}
    }catch (error) {
      console.error('获取消息列表失败', error)
    }
  }

  /**
   * 标记为已读
   */
  const markAsRead = async (id: number) => {
    try {
      await markAsReadApi(id)
      const notification = notifications.value.find(n => n.notificationId === id)
      if (notification && notification.status === 0) {
        notification.status = 1
        unreadCount.value--
      }
      userMessage.value.list = userMessage.value.list.map((m: Message) => {
        if (m.notificationId === id) {
          return { ...m, status: 1 }
        }
        return m
      })
      return true
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  /**
   * 全部标记为已读
   */
  const markAllAsRead = async () => {
    try {
      await markAllAsReadApi()
      notifications.value.forEach(n => {
        if (n.status === 0) {
          n.status = 1
        }
      })
      unreadCount.value = 0
      userMessage.value.list = userMessage.value.list.map((m: Message) => {
        if (m.status === 0) {
          return { ...m, status: 1 }
        }
        return m
      })
      ElMessage.success('已全部标记为已读')
      return true
    } catch (error) {
      console.error('全部标记已读失败', error)
    }
  }

  /**
   * 删除通知
   */
  const deleteNotification = async (id: number) => {
    try {
      await deleteNotificationApi(id)
      const targetNotification = notifications.value.find(n => n.notificationId === id)
    if (targetNotification) {
      if (targetNotification.status === 0) {
        unreadCount.value--
      }
      notifications.value = notifications.value.filter(n => n.notificationId !== id)
    }
    userMessage.value.list = userMessage.value.list.filter((m: Message) => m.notificationId !== id)
    userMessage.value.total = userMessage.value.total - 1
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除通知失败', error)
    }
  }

  /**
   * 清理 WebSocket 连接
   */
  const cleanup = () => {
    isWebSocketInitialized.value = false
    websocketService.disconnect()
    websocketService.off('connect', handleConnect)
    websocketService.off('disconnect', handleDisconnect)
    websocketService.off('error', handleError)
    websocketService.off('notification', handleNewNotification)
    websocketService.off('broadcast', handleBroadcast)
    websocketService.off('online-count', handleOnlineCount)
    websocketService.off('unread-count', handleUnreadCount)
    websocketService.off('admin-delete', handleAdminDelete)
    websocketService.off('fetch-online-count', fetchOnlineCount)
  }

  return {
    // 状态
    notifications,
    unreadCount,
    onlineCount,
    connected,
    loading,
    userMessage,
    
    // 计算属性
    systemNotifications,
    personalNotifications,
    taskNotifications,
    
    // 方法
    initWebSocket,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanup,
    connectIfNeeded,
    getUserMessageList
  }
})