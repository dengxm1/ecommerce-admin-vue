import SockJS from 'sockjs-client'
import { Client, type Message } from '@stomp/stompjs'
import { ElNotification } from 'element-plus'

class WebSocketService {
  private client: Client | null = null
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()
  
  connect() {
    const token = localStorage.getItem("access-token")
    
    if (!token) {
      console.warn('[WebSocket] 未登录，无法建立连接')
      return
    }
        // 如果已经连接，不要重复连接
    if (this.connected) {
      console.log('[WebSocket] 已经连接，跳过')
      return
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
   const sockJsUrl = `${baseUrl}${import.meta.env.VITE_APP_BASE_API}/ws`
    
    console.log('[WebSocket] 正在连接...', sockJsUrl)
    
    this.client = new Client({
      // 使用 webSocketFactory 创建 SockJS 连接
      webSocketFactory: () => {
        return new SockJS(`${sockJsUrl}?token=${token}`)
      },
      // 心跳设置（毫秒）
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      // 重连延迟（毫秒）
      reconnectDelay: 3000,
      // 关闭调试输出
      debug: () => {}
    })
    
    // 连接成功回调
    this.client.onConnect = (frame) => {
      console.log('[WebSocket] 连接成功', frame)
      this.connected = true
      this.reconnectAttempts = 0
      
      // 订阅个人通知
      this.client?.subscribe('/user/queue/notifications', (message) => {
        this.handleNotification(message)
      })
      
      // 订阅广播
      this.client?.subscribe('/topic/broadcast', (message) => {
        this.handleBroadcast(message)
      })
      
      // 订阅在线人数
      this.client?.subscribe('/topic/online-count', (message) => {
        this.handleOnlineCount(message)
      })
      
      this.emit('connect', null)
    }
    
    // 连接错误回调
    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP错误', frame)
      this.connected = false
      this.emit('error', frame)
      this.reconnect()
    }
    
    // 断开连接回调
    this.client.onDisconnect = () => {
      console.log('[WebSocket] 断开连接')
      this.connected = false
      this.emit('disconnect', null)
    }
    
    // 激活连接
    this.client.activate()
  }
  
  // 处理个人通知
  private handleNotification(message: Message) {
    const body = JSON.parse(message.body)
    console.log('[WebSocket] 收到个人通知:', body)
    
    this.emit('notification', body.data)
    this.showDesktopNotification(body.data)
    this.emit('unread-count', { increment: true })
  }
  
  // 处理广播
  private handleBroadcast(message: Message) {
    const body = JSON.parse(message.body)
    console.log('[WebSocket] 收到广播:', body)
    
    this.emit('broadcast', body.data)
    
    if (body.data?.type === 'SYSTEM') {
      ElNotification({
        title: body.data.title || '系统公告',
        message: body.data.content,
        type: 'info',
        duration: 5000
      })
    }
  }
  
  // 处理在线人数
  private handleOnlineCount(message: Message) {
    const count = parseInt(message.body)
    console.log('[WebSocket] 在线人数更新:', count)
    this.emit('online-count', count)
  }
  
  // 显示桌面通知
  private showDesktopNotification(notification: any) {
    if (!('Notification' in window)) return
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title || '新通知', {
        body: notification.content,
        icon: '/favicon.ico'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }
  
  // 重连
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] 重连次数已达上限')
      this.emit('max-reconnect', null)
      return
    }
    
    this.reconnectAttempts++
    console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    // client 会自动重连，不需要手动处理
  }
  // 重新连接
  reconnectWithNewToken() {
    this.disconnect()
    this.connect()
  }
  
  // 断开连接
  disconnect() {
    this.client?.deactivate()
    this.connected = false
    this.emit('disconnect', null)
  }
  
  // 注册事件监听
  on(event: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set())
    }
    this.messageHandlers.get(event)!.add(handler)
  }
  
  // 移除事件监听
  off(event: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }
  
  // 触发事件
  private emit(event: string, data: any) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (e) {
          console.error(`[WebSocket] 事件 ${event} 处理失败`, e)
        }
      })
    }
  }
  
  // 获取连接状态
  isConnected(): boolean {
    return this.connected
  }
}

// 单例导出
export default new WebSocketService()