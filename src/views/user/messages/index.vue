<template>
  <div class="message-center">
    <!-- 页面标题 -->
    <div class="page-header">
        <div class="header-left">
            <h2>我的消息</h2>
            <div class="header-filter">
                <el-radio-group v-model="filterType"  @change="handleFilterChange">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="unread">未读</el-radio-button>
                <el-radio-button value="system">系统公告</el-radio-button>
                <el-radio-button value="personal">个人通知</el-radio-button>
                <el-radio-button value="task">任务提醒</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <div class="header-right">
            <el-button 
                v-if="unreadCount > 0"
                type="primary" 
                :icon="CircleCheck" 
                @click="handleMarkAllRead"
                >
                全部已读
            </el-button>
        </div>
    </div>

    <!-- 消息列表 -->
    <el-card class="message-list" shadow="never">
        <!-- 滚动内容区域 -->
        <div class="message-scroll">
            <el-timeline v-if="messageList.length > 0">
                <el-timeline-item
                v-for="item in messageList"
                :key="item.notificationId"
                :type="getTimelineType(item.type)"
                :color="item.status === 0 ? '#409EFF' : '#C0C4CC'"
                :timestamp="formatTime(item.createdAt)"
                placement="top"
                >
                <div 
                    class="message-item" 
                    :class="{ 'unread': item.status === 0 }"
                    @click="handleMessageClick(item)"
                >
                    <div class="message-header">
                    <div class="message-title">
                        <el-tag :type="getTypeTag(item.type)" size="small" effect="plain">
                        {{ getTypeName(item.type) }}
                        </el-tag>
                        <span class="title-text">{{ item.title }}</span>
                        <el-badge v-if="item.status === 0" :value="'新'" type="danger" class="new-badge" />
                    </div>
                    <div class="message-actions">
                        <el-button 
                        v-if="item.status === 0"
                        type="primary" 
                        link 
                        :icon="CircleCheck"
                        @click.stop="handleMarkRead(item)"
                        >
                        标记已读
                        </el-button>
                        <el-button 
                        type="danger" 
                        link 
                        :icon="Delete"
                        @click.stop="handleDelete(item)"
                        >
                        删除
                        </el-button>
                    </div>
                    </div>
                    <div class="message-content">{{ item.content }}</div>
                </div>
                </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无消息" />
        </div>
      

      <!-- 分页 -->
      <el-pagination
       v-if="messageList.length > 0"
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 消息详情抽屉 -->
    <MessageDetailDrawer
      v-model="detailDrawer.visible"
      :message="detailDrawer.data"
      @mark-read="handleMarkRead"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import type { Message } from '@/types/message'
import MessageDetailDrawer from './components/MessageDetailDrawer.vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// 过滤类型
const filterType = ref('all')


// 消息列表
const messageList = computed<Message[]>(() => {
  pagination.total = notificationStore.userMessage?.total || 0
  return notificationStore.userMessage?.list || []
})
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 详情抽屉
const detailDrawer = reactive({
  visible: false,
  data: null
})

// 未读数量
const unreadCount = computed(() => 
  messageList.value.filter(m => m?.status === 0).length
)



// 类型映射
const typeMap = {
  SYSTEM: { name: '系统公告', tag: 'danger', timelineType: 'primary' },
  PERSONAL: { name: '个人通知', tag: 'primary', timelineType: 'success' },
  TASK: { name: '任务提醒', tag: 'warning', timelineType: 'warning' }
}

const getTypeTag = (type: string): any=> typeMap[type as keyof typeof typeMap]?.tag || 'info'
const getTypeName = (type: string) => typeMap[type as keyof typeof typeMap]?.name || type
const getTimelineType = (type: string):any => typeMap[type as keyof typeof typeMap]?.timelineType || 'info'

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 获取消息列表
const fetchMessages = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      type: (filterType.value === 'all' ? undefined : 
            filterType.value === 'unread' ? undefined : filterType.value ) as string,
      status: (filterType.value === 'unread' ? 0 : undefined) as 0 | 1 
    }
    notificationStore.getUserMessageList(params)
  } catch (error) {
    console.error('获取消息失败', error)
  } finally {
    loading.value = false
  }
}

// 过滤变化
const handleFilterChange = () => {
  pagination.current = 1
  fetchMessages()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchMessages()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchMessages()
}

// 点击消息
const handleMessageClick = (message: any) => {
  detailDrawer.data = message
  detailDrawer.visible = true
}

// 标记已读
const handleMarkRead = async (message: any) => {
  if (message.status === 1) return
  
  try {
    await notificationStore.markAsRead(message.notificationId)
    message.status = 1
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记失败', error)
  }
}

// 全部已读
const handleMarkAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('操作失败', error)
  }
}

// 删除消息
const handleDelete = async (message: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', { type: 'warning' })
    await notificationStore.deleteNotification(message.notificationId)
  } catch (error) {
    // 用户取消
  }
}

// 初始化
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped lang="scss">
.message-center {
    padding: 20px;
    background-color: #FFFFFF;
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
  .page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    
     .header-left {
      display: flex;
      align-items: center;
      gap: 24px;  // 标题和过滤标签之间的间距
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        white-space: nowrap;  // 防止标题换行
        background: linear-gradient(135deg, var(--ecommerce-primary), #ff8c5a);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .el-radio-group {
        display: flex;
        flex-wrap: nowrap;  // 防止按钮换行
        
        .el-radio-button {
          .el-radio-button__inner {
            padding: 6px 16px;
            font-size: 13px;
            white-space: nowrap;
          }
        }
      }
    }
    
    .header-right {
      flex-shrink: 0;
      margin-left: 16px;
    }
  }
  
  .message-list {
    flex: 1;  // 占据剩余空间
    display: flex;
    flex-direction: column;
    min-height: 0;  // 重要：让 flex 子项可以滚动
    :deep(.el-card__header) {
      padding: 12px 20px;
    }
     :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      min-height: 0;
    }
     .message-scroll {
      flex: 1;
      overflow-y: auto;  // 内部滚动
      padding: 20px;
      
      // 美化滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
        
        &:hover {
          background: #ccc;
        }
      }
    }
    .message-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      &.unread {
        background-color: var(--el-color-info-light-9);
        border-left: 3px solid var(--el-color-primary);
      }
      
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .message-title {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .title-text {
            font-weight: 500;
            font-size: 15px;
          }
          
          .new-badge {
            :deep(.el-badge__content) {
              transform: translateY(-50%) translateX(0);
            }
          }
        }
        
        .message-actions {
          opacity: 0;
          transition: opacity 0.3s;
        }
      }
      
      &:hover .message-actions {
        opacity: 1;
      }
      
      .message-content {
        color: var(--el-text-color-regular);
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .message-data {
        margin-top: 8px;
        padding: 8px;
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
        
        pre {
          margin: 0;
          font-size: 12px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>