<template>
  <div 
    class="notification-item" 
    :class="{ 'unread': notification.status === 0 }"
    @click="handleClick"
  >
    <!-- 图标 -->
    <div class="item-icon" :class="iconClass">
      <el-icon :size="20">
        <component :is="iconComponent" />
      </el-icon>
    </div>
    
    <!-- 内容 -->
    <div class="item-content">
      <div class="item-header">
        <span class="item-title">{{ notification.title }}</span>
        <span class="item-time">{{ formatTime }}</span>
      </div>
      <div class="item-desc">{{ notification.content }}</div>
    </div>
    
    <!-- 操作 -->
    <div class="item-actions" @click.stop>
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button text :icon="More" size="small" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-if="notification.status === 0"
              command="markRead"
              :icon="CircleCheck"
            >
              标记已读
            </el-dropdown-item>
            <el-dropdown-item 
              command="delete"
              :icon="Delete"
              divided
              class="delete-item"
            >
              删除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Bell, 
  BellFilled, 
  ChatDotRound, 
  CircleCheck,
  Delete,
  More
} from '@element-plus/icons-vue'
import type { Notification } from '@/types/notification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  (e: 'click', notification: Notification): void
  (e: 'mark-read', id: number): void
  (e: 'delete', id: number): void
}>()

// 图标映射
const iconMap = {
  SYSTEM: BellFilled,
  PERSONAL: Bell,
  TASK: ChatDotRound
}

// 图标类名映射
const iconClassMap = {
  SYSTEM: 'system',
  PERSONAL: 'personal',
  TASK: 'task'
}

// 图标组件
const iconComponent = computed(() => iconMap[props.notification.type] || Bell)

// 图标类名
const iconClass = computed(() => iconClassMap[props.notification.type] || '')

// 格式化时间
const formatTime = computed(() => {
  return dayjs(props.notification.createTime).fromNow()
})

// 点击项目
const handleClick = () => {
  emit('click', props.notification)
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'markRead':
      emit('mark-read', props.notification.id)
      break
    case 'delete':
      emit('delete', props.notification.id)
      break
  }
}
</script>

<style scoped lang="scss">
.notification-item {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--border-color-light);
  position: relative;
  
  &:hover {
    background-color: var(--bg-color);
    
    .item-actions {
      opacity: 1;
    }
  }
  
  &.unread {
    background-color: rgba(64, 158, 255, 0.05);
    
    .item-title {
      font-weight: 600;
    }
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--primary-color);
      border-radius: 0 2px 2px 0;
    }
  }
}

.item-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.system {
    background: linear-gradient(135deg, #409EFF, #79bbff);
    color: white;
  }
  
  &.personal {
    background: linear-gradient(135deg, #67C23A, #95d475);
    color: white;
  }
  
  &.task {
    background: linear-gradient(135deg, #E6A23C, #f4d19b);
    color: white;
  }
}

.item-content {
  flex: 1;
  min-width: 0;
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    
    .item-title {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .item-time {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
  
  .item-desc {
    font-size: 13px;
    color: var(--text-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.item-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .delete-item {
    color: var(--danger-color);
  }
}
</style>