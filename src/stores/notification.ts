import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import websocketService from '@/utils/websocket'
import { 
  getUnreadNotificationsApi, 
  markAsReadApi, 
  markAllAsReadApi,
  deleteNotificationApi 
} from '@/api/notification'
import type { Notification } from '@/types/notification'
import { ElMessage } from 'element-plus'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const onlineCount = ref(0)
  const connected = ref(false)
  const loading = ref(false)

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
    // 监听连接事件
    websocketService.on('connect', handleConnect)
    websocketService.on('disconnect', handleDisconnect)
    websocketService.on('error', handleError)
    websocketService.on('notification', handleNewNotification)
    websocketService.on('broadcast', handleBroadcast)
    websocketService.on('online-count', handleOnlineCount)
    websocketService.on('unread-count', handleUnreadCount)
    
    // 连接 WebSocket
    websocketService.connect()
  }

  /**
   * 处理连接成功
   */
  const handleConnect = () => {
    connected.value = true
    fetchUnreadNotifications()
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
  const handleNewNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
    if (notification.status === 0) {
      unreadCount.value++
    }
  }

  /**
   * 处理广播
   */
  const handleBroadcast = (notification: Notification) => {
    notifications.value.unshift(notification)
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
      unreadCount.value = (res.data || []).filter((n: Notification) => n.status === 0).length
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
      unreadCount.value = (res.data || []).filter((n: Notification) => n.status === 0).length
    } catch (error) {
      console.error('获取未读数量失败', error)
    }
  }

  /**
   * 标记为已读
   */
  const markAsRead = async (id: number) => {
    try {
      await markAsReadApi(id)
      const notification = notifications.value.find(n => n.id === id)
      if (notification && notification.status === 0) {
        notification.status = 1
        unreadCount.value--
      }
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
      ElMessage.success('已全部标记为已读')
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
    const targetNotification = notifications.value.find(n => n.id === id)
    if (targetNotification) {
      if (targetNotification.status === 0) {
        unreadCount.value--
      }
      notifications.value = notifications.value.filter(n => n.id !== id)
    }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除通知失败', error)
    }
  }

  /**
   * 清理 WebSocket 连接
   */
  const cleanup = () => {
    websocketService.disconnect()
    websocketService.off('connect', handleConnect)
    websocketService.off('disconnect', handleDisconnect)
    websocketService.off('error', handleError)
    websocketService.off('notification', handleNewNotification)
    websocketService.off('broadcast', handleBroadcast)
    websocketService.off('online-count', handleOnlineCount)
    websocketService.off('unread-count', handleUnreadCount)
  }

  return {
    // 状态
    notifications,
    unreadCount,
    onlineCount,
    connected,
    loading,
    
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
    cleanup
  }
})