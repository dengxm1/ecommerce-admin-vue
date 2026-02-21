<template>
  <el-drawer
    v-model="drawerVisible"
    :title="notification?.title || '通知详情'"
    :size="500"
    destroy-on-close
    @closed="handleClosed"
  >
    <div v-if="notification" class="notification-detail">
      <!-- 通知头部 -->
      <div class="detail-header">
        <el-tag :type="getTypeTag(notification.type)" size="large">
          {{ getTypeName(notification.type) }}
        </el-tag>
        <span class="detail-time">{{ formatTime(notification.createTime) }}</span>
      </div>
      
      <!-- 通知内容 -->
      <div class="detail-content">
        <h3 class="content-title">{{ notification.title }}</h3>
        <div class="content-body">{{ notification.content }}</div>
      </div>
      
      <!-- 发送信息 -->
      <div class="detail-info">
        <div class="info-item">
          <span class="info-label">发送人：</span>
          <span class="info-value">{{ notification.senderName || '系统' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">接收范围：</span>
          <span class="info-value">
            {{ getReceiverTypeName(notification.receiverType) }}
            <template v-if="notification.receiverType === 'USER' && notification.receiverName">
              ：{{ notification.receiverName }}
            </template>
            <template v-else-if="notification.receiverType === 'ROLE' && notification.roleName">
              ：{{ notification.roleName }}
            </template>
          </span>
        </div>
        <div class="info-item" v-if="notification.readTime">
          <span class="info-label">阅读时间：</span>
          <span class="info-value">{{ formatTime(notification.readTime) }}</span>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="detail-footer">
        <el-button @click="drawerVisible = false">关闭</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { Notification } from '@/types/notification'

const props = defineProps<{
  modelValue: boolean
  notification: Notification | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 抽屉显示
const drawerVisible = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  drawerVisible.value = val
})
watch(drawerVisible, (val) => {
  emit('update:modelValue', val)
})

// 类型映射
const typeMap = {
  SYSTEM: { name: '系统公告', tag: 'danger' },
  PERSONAL: { name: '个人通知', tag: 'primary' },
  TASK: { name: '任务提醒', tag: 'warning' }
}

const receiverTypeMap = {
  ALL: '全体用户',
  USER: '指定用户',
  ROLE: '指定角色'
}

// 获取类型标签
const getTypeTag = (type: string):any => typeMap[type as keyof typeof typeMap]?.tag || 'info'
const getTypeName = (type: string) => typeMap[type as keyof typeof typeMap]?.name || type
const getReceiverTypeName = (type: string) => receiverTypeMap[type as keyof typeof receiverTypeMap] || type

// 格式化时间
const formatTime = (time: string, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}


// 关闭后清理
const handleClosed = () => {
  // 清理
}
</script>

<style scoped lang="scss">
.notification-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  
  .detail-time {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.detail-content {
  margin-bottom: 24px;
  
  .content-title {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .content-body {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-regular);
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--bg-color);
    padding: 16px;
    border-radius: var(--radius-medium);
  }
}


.detail-footer {
  margin-top: auto;
  padding-top: 20px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}
</style>