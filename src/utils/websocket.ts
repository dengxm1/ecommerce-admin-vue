import SockJS from 'sockjs-client'
import { Client, type Message } from '@stomp/stompjs'
import { ElNotification } from 'element-plus'

class WebSocketService {
  private client: Client | null = null
  private connected = false
  private connecting = false  // 添加连接中标志
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()
  private userId: string | null = null
  
  connect() {

      // 如果已经连接，先断开旧的
    if (this.client && this.connected) {
      console.log('[WebSocket] 已有连接，先断开旧的')
      this.disconnect()
    }

    if (this.connecting) {
      console.log('[WebSocket] 正在连接中，跳过')
      return
    }
            // 如果已经连接，不要重复连接
    if (this.connected) {
      console.log('[WebSocket] 已经连接，跳过')
      return
    }
    const token = localStorage.getItem("access-token")
    
    if (!token) {
      console.warn('[WebSocket] 未登录，无法建立连接')
      return
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://dengxinyi.cn'
   const sockJsUrl = `${baseUrl}${import.meta.env.VITE_APP_BASE_API}/ws`
   
    this.connecting = true
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
      this.connecting = false
      this.reconnectAttempts = 0

    // 从 token 获取用户ID
    const userId = this.getUserIdFromToken()
    console.log('[WebSocket] 当前用户ID:', userId)
      
       if (userId) {
       // 订阅个人通知
          this.client?.subscribe(`/queue/notifications/${userId}`, (message) => {
            this.handleNotification(message)  
          })
        } else {
          console.warn('[WebSocket] 无法获取用户ID，个人通知将不可用')
        }

      // 上报用户上线
      this.reportUserOnline()
      // 订阅广播
      this.client?.subscribe('/topic/broadcast', (message) => {
        this.handleBroadcast(message)
      })
      
      // 订阅在线人数
      this.client?.subscribe('/topic/online-count', (message) => {
        this.handleOnlineCount(message)
      })

      // 管理员删除公告
      this.client?.subscribe('/topic/admin-delete', (message) => {
          this.handleAdminDelete(message)
      })
      
      this.emit('connect', null)
    }
    
    // 连接错误回调
    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP错误', frame)
      this.connected = false
      this.connecting = false
      this.userId = null
      this.emit('error', frame)
      this.reconnect()
    }
    
    // 断开连接回调
    this.client.onDisconnect = () => {
      console.log('[WebSocket] 断开连接')
      this.connected = false
      this.connecting = false
      this.userId = null
      this.emit('disconnect', null)
    }
    
    // 激活连接
    this.client.activate()
  }

// 上报用户上线
private reportUserOnline() {
  const userId = this.getUserIdFromToken()
  this.userId = userId;
  if (userId) {
    // 通过发送一个特殊的消息来上报用户ID
    this.client?.publish({
      destination: '/app/user.online',
      body: JSON.stringify({ userId: userId })
    })
    console.log('[WebSocket] 已上报用户上线:', userId)
  }
}

  // 上报用户下线
  private  reportUserOffline() {
    if (this.userId && this.client && this.connected) {
      this.client.publish({
        destination: '/app/user.offline',
        body: JSON.stringify({ userId: this.userId })
      })
      console.log('[WebSocket] 已上报用户下线:', this.userId)
    }
  }

  // 处理个人通知
  private handleNotification(message: Message) {
    const body = JSON.parse(message.body)
    console.log('[WebSocket] 收到个人通知:', body)
    
    this.emit('notification', body.data)
    this.showDesktopNotification(body.data)
      ElNotification({
        title: body.data.title || '个人通知',
        message: body.data.content,
        type: 'primary',
        duration: 5000
      })
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

  // 处理管理员删除通知
  private handleAdminDelete(message: Message) {
      const body = JSON.parse(message.body)
      console.log('[WebSocket] 管理员删除:', body)
      this.emit('admin-delete', body.data)
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
  async disconnect() {
    console.log('[WebSocket] 断开连接22')
   this.reportUserOffline(); //上报用户下线
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

private getUserIdFromToken(): string | null {
  const token = localStorage.getItem('access-token')
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[WebSocket] 无效的token格式')
      return null
    }
    
    const payloadBase64 = parts[1]
    if (!payloadBase64) return null
    
    // 解析 JWT payload
    const payload = JSON.parse(atob(payloadBase64))
    
    // ✅ 根据你的 token 结构，userId 在 sub 字段
    return payload.sub || null
  } catch (e) {
    console.error('[WebSocket] 解析token失败', e)
    return null
  }
}

}

// 单例导出
const instance = new WebSocketService()
export default instance