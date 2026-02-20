<template>
  <el-popover
    placement="bottom-end"
    :width="360"
    trigger="click"
    popper-class="notification-popover"
    @hide="handlePopoverHide"
  >
    <template #reference>
      <div class="notification-badge" @click="handleClick">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
          <el-icon :size="20">
            <Bell />
          </el-icon>
        </el-badge>
        <span v-if="onlineCount > 0" class="online-dot"></span>
      </div>
    </template>

    <div class="notification-container">
      <!-- 头部 -->
      <div class="notification-header">
        <div class="header-left">
          <span class="title">通知中心</span>
          <span class="online-info">
            <el-icon><User /></el-icon>
            {{ onlineCount }}人在线
          </span>
        </div>
        <div class="header-right">
          <el-button 
            v-if="unreadCount > 0"
            type="primary" 
            link 
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>
          <el-button type="primary" link @click="handleViewAll">
            查看全部
          </el-button>
        </div>
      </div>

      <!-- 通知列表 -->
      <el-scrollbar height="400px" class="notification-list">
        <div v-if="loading" class="list-loading">
          <el-skeleton :rows="3" animated />
        </div>
        
        <template v-else>
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <el-empty description="暂无通知" />
          </div>
          
          <NotificationItem
            v-for="item in filteredNotifications"
            :key="item.id"
            :notification="item"
            @click="handleNotificationClick"
            @mark-read="handleMarkRead"
            @delete="handleDelete"
          />
        </template>
      </el-scrollbar>

      <!-- 底部 -->
      <div class="notification-footer">
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="unread">未读</el-radio-button>
          <el-radio-button value="system">系统</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, User } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import NotificationItem from './NotificationItem.vue'
import type { Notification } from '@/types/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// 过滤类型
const filterType = ref<'all' | 'unread' | 'system'>('all')

// 计算属性
const unreadCount = computed(() => notificationStore.unreadCount)
const onlineCount = computed(() => notificationStore.onlineCount)
const loading = computed(() => notificationStore.loading)

// 过滤后的通知
const filteredNotifications = computed(() => {
  const notifications = notificationStore.notifications
  
  switch (filterType.value) {
    case 'unread':
      return notifications.filter(n => n.status === 0)
    case 'system':
      return notifications.filter(n => n.type === 'SYSTEM')
    default:
      return notifications
  }
})

// 点击通知
const handleNotificationClick = async (notification: Notification) => {
  // 标记已读
  if (notification.status === 0) {
    await notificationStore.markAsRead(notification.id)
  }
  
  // 根据通知类型跳转
  if (notification.data?.path) {
    router.push(notification.data.path)
  }
}

// 标记已读
const handleMarkRead = (id: number) => {
  notificationStore.markAsRead(id)
}

// 全部标记已读
const handleMarkAllRead = () => {
  notificationStore.markAllAsRead()
}

// 删除通知
const handleDelete = (id: number) => {
  notificationStore.deleteNotification(id)
}

// 查看全部
const handleViewAll = () => {
  router.push({name:'UserMessages'})
}

// 点击图标
const handleClick = () => {
  // 可以在这里做统计
}

// 弹窗关闭
const handlePopoverHide = () => {
  // 可以重置过滤条件
  // filterType.value = 'all'
}

// 初始化
onMounted(() => {
  // 请求桌面通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  // 清理
})
</script>

<style scoped lang="scss">
.notification-badge {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: var(--text-regular);
  
  &:hover {
    background: var(--bg-color);
    color: var(--ecommerce-primary);
  }
  
  .online-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: var(--success-color);
    border-radius: 50%;
    border: 2px solid var(--header-bg);
  }
}

.notification-container {
  width: 100%;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .online-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--success-color);
      background: rgba(103, 194, 58, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
      
      .el-icon {
        font-size: 12px;
      }
    }
  }
  
  .header-right {
    display: flex;
    gap: 8px;
  }
}

.notification-list {
  min-height: 200px;
  
  .list-loading {
    padding: 20px;
  }
  
  .empty-state {
    padding: 40px 0;
  }
}

.notification-footer {
  padding: 12px 16px;
  text-align: center;
  border-top: 1px solid var(--border-color);
  
  :deep(.el-radio-group) {
    width: 100%;
    
    .el-radio-button {
      flex: 1;
    }
  }
}
</style>