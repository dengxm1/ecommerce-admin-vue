title
<template>
  <el-drawer
    v-model="drawerVisible"
    :title="message?.title || '消息详情'"
    :size="500"
    destroy-on-close
  >
    <div v-if="message" class="message-detail">
      <!-- 消息头部 -->
      <div class="detail-header">
        <el-tag :type="getTypeTag(message.type)" size="large">
          {{ getTypeName(message.type) }}
        </el-tag>
        <span class="detail-time">{{ formatTime(message.createTime) }}</span>
      </div>

      <!-- 消息内容 -->
      <div class="detail-content">
        <p>{{ message.content }}</p>
      </div>


      <!-- 底部按钮 -->
      <div class="detail-footer">
        <el-button 
          v-if="message.status === 0"
          type="primary" 
          @click="handleMarkRead"
        >
          标记为已读
        </el-button>
          <el-button type="danger" @click="handleDelete">
          删除
        </el-button>
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
  message: Notification | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'mark-read', message: Notification): void
  (e: 'delete', message: Notification): void
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

// 格式化时间
const formatTime = (time: string, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

// 标记已读
const handleMarkRead = () => {
  if (props.message) {
    emit('mark-read', props.message)
    drawerVisible.value = false
  }
}

// 删除通知
const handleDelete = () => {
  emit('delete', props.message!)
  drawerVisible.value = false
}
</script>

<style scoped lang="scss">
.message-detail{
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
}


.detail-footer {
  margin-top: auto;
  padding-top: 20px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}
</style>