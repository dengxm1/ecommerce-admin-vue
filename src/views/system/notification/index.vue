<template>
  <div class="notification-management">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card" shadow="never">
        <ProForm 
          ref="searchFormRef" 
          :modelForm="searchForm" 
          :formItemList="searchFormList" 
          inline
        >
          <template #footer>
            <el-button 
              type="primary" 
              :icon="Search" 
              @click="handleSearch"
            >
              搜索
            </el-button>
            <el-button 
              :icon="Refresh" 
              @click="handleReset"
            >
              重置
            </el-button>
          </template>
        </ProForm>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <ProTable 
      rowId="id"
      :data="tableData" 
      :columns="columns"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :loading="loading"
      showSelection
      showAction
      stripe
      @paginationChange="paginationChange"
      @handleSelectionChange="handleSelectionChange"
    >
      <template #table-header>
        <div class="table-actions">
          <div class="actions-left">
            <el-button 
              v-permission="'system:notification:send'"
              type="primary" 
              :icon="Bell" 
              @click="handleSendAnnouncement"
              class="send-btn"
            >
              发送公告
            </el-button>
            <el-button 
              v-permission="'system:notification:delete'"
              :icon="Delete" 
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
              class="batch-btn"
            >
              批量删除
            </el-button>
            <el-button 
              :icon="RefreshRight" 
              circle 
              @click="refreshTable"
              title="刷新"
            />
            <span class="selected-count" v-if="selectedCount > 0">
              已选择 {{ selectedCount }} 项
            </span>
          </div>
          <div class="actions-right">
            <el-radio-group v-model="filterType"  @change="handleFilterChange">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="unread">未读</el-radio-button>
              <el-radio-button value="system">系统</el-radio-button>
              <el-radio-button value="personal">个人</el-radio-button>
              <el-radio-button value="task">任务</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 通知类型列 -->
      <template #type="{ row }">
        <el-tag :type="getTypeTag(row.type)" :icon="getTypeIcon(row.type)" size="small">
          {{ getTypeName(row.type) }}
        </el-tag>
      </template>

      <!-- 标题列 -->
      <template #title="{ row }">
        <div class="title-cell" :class="{ 'unread': row.status === 0 }">
          <span class="title-text">{{ row.title }}</span>
          <el-tag v-if="row.status === 0" size="small" type="danger" effect="dark">新</el-tag>
        </div>
      </template>

      <!-- 内容列 -->
      <template #content="{ row }">
        <div class="content-cell" :title="row.content">
          {{ row.content }}
        </div>
      </template>

      <!-- 接收范围列 -->
      <template #receiverType="{ row }">
        <div class="receiver-info">
          <el-tag size="small" :type="getReceiverTagType(row.receiverType)">
            {{ getReceiverTypeName(row.receiverType) }}
          </el-tag>
          <span v-if="row.receiverType === 'USER' && row.receiverName" class="receiver-name">
            {{ row.receiverName }}
          </span>
          <span v-else-if="row.receiverType === 'ROLE' && row.roleName" class="receiver-name">
            {{ row.roleName }}
          </span>
        </div>
      </template>

      <!-- 发送时间列 -->
      <template #createTime="{ row }">
        <div class="time-info">
          <div>{{ formatTime(row.createTime) }}</div>
          <div v-if="row.readTime" class="read-time">
            已读: {{ formatTime(row.readTime, 'MM-DD HH:mm') }}
          </div>
        </div>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <div class="action-buttons">
          <el-tooltip content="查看详情" placement="top">
            <el-button 
              type="info" 
              :icon="View" 
              size="small"
              circle
              @click="handleView(row)"
            />
          </el-tooltip>
          <el-tooltip v-if="row.status === 0" content="标记已读" placement="top">
            <el-button 
              type="success" 
              :icon="CircleCheck" 
              size="small"
              circle
              @click="handleMarkRead(row)"
            />
          </el-tooltip>
          <el-tooltip v-permission="'system:notification:delete'" content="删除" placement="top">
            <el-button 
              type="danger" 
              :icon="Delete" 
              size="small"
              circle
              @click="handleDelete(row)"
            />
          </el-tooltip>
        </div>
      </template>
    </ProTable>

    <!-- 发送公告对话框 -->
    <SendAnnouncementDialog
      v-model="sendDialog.visible"
      @success="handleSendSuccess"
    />

    <!-- 通知详情抽屉 -->
    <NotificationDetailDrawer
      v-model="detailDrawer.visible"
      :notification="detailDrawer.data"
      @mark-read="handleMarkRead"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { 
  Search, 
  Refresh, 
  Bell, 
  Delete, 
  RefreshRight,
  View,
  CircleCheck
} from '@element-plus/icons-vue'
import type { TableColumn } from '@/components/ProTable/ProTable.vue'
import { useNotificationStore } from '@/stores/notification'
import { 
  getNotificationsApi, 
  markAsReadApi, 
  deleteNotificationApi,
  batchDeleteNotificationsApi,
} from '@/api/notification'
import type { Notification } from '@/types/notification'
import SendAnnouncementDialog from './components/SendAnnouncement.vue'
import NotificationDetailDrawer from './components/NotificationDetail.vue'

const notificationStore = useNotificationStore()

const searchFormRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: '',
  dateRange: []
})

const searchFormList = computed(() => [
  {
    type: 'input',
    label: '关键词',
    prop: 'keyword',
    placeholder: '标题/内容',
    clearable: true,
    style: 'width: 200px',
    keyEnter: () => fetchData()
  },
  {
    type: 'select',
    label: '类型',
    prop: 'type',
    placeholder: '全部类型',
    clearable: true,
    style: 'width: 120px',
    options: [
      { id: 'SYSTEM', label: '系统公告' },
      { id: 'PERSONAL', label: '个人通知' },
      { id: 'TASK', label: '任务提醒' }
    ],
    clear: () => fetchData()
  },
  {
    type: 'select',
    label: '状态',
    prop: 'status',
    placeholder: '全部状态',
    clearable: true,
    style: 'width: 120px',
    options: [
      { id: 0, label: '未读' },
      { id: 1, label: '已读' }
    ],
    clear: () => fetchData()
  },
  {
    type: 'dateRange',
    label: '发送时间',
    prop: 'dateRange',
    style: 'width: 240px',
    clear: () => fetchData()
  }
])

// 表格列配置
const columns = ref<TableColumn[]>([
  {
    prop: 'type',
    label: '类型',
    slot: 'type',
    width: 100
  },
  {
    prop: 'title',
    label: '标题',
    slot: 'title',
    minWidth: 200
  },
  {
    prop: 'content',
    label: '内容',
    slot: 'content',
    minWidth: 250
  },
  {
    prop: 'receiverType',
    label: '接收范围',
    slot: 'receiverType',
    width: 150
  },
  {
    prop: 'senderName',
    label: '发送人',
    width: 120
  },
  {
    prop: 'createTime',
    label: '发送时间',
    slot: 'createTime',
    width: 180,
    sortable: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    tags: true,
    tagFormatter: (row, type) => {
      if (type === 'text') {
        return row.status === 0 ? '未读' : '已读'
      } else {
        return row.status === 0 ? 'danger' : 'info'
      }
    }
  }
])

// 数据
const tableData = ref<Notification[]>([])
const loading = ref(false)
const selectedRows = ref<Notification[]>([])
const filterType = ref('all')

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 对话框状态
const sendDialog = reactive({
  visible: false
})

const detailDrawer = reactive({
  visible: false,
  data: null as Notification | null
})

// 计算属性
const selectedCount = computed(() => selectedRows.value.length)
const selectedKeys = computed(() => selectedRows.value.map(item => item.id))

// 类型映射
const typeMap = {
  SYSTEM: { name: '系统公告', tag: 'danger', icon: 'Bell' },
  PERSONAL: { name: '个人通知', tag: 'primary', icon: 'User' },
  TASK: { name: '任务提醒', tag: 'warning', icon: 'ChatDotRound' }
}
type ReceiverType = 'ALL' | 'USER' | 'ROLE'
type TagType = 'info' | 'primary' | 'success' | 'warning' | 'danger'
const receiverTypeMap: Record<ReceiverType, { name: string; tag: TagType }> = {
  ALL: { name: '全体用户', tag: 'info' },
  USER: { name: '指定用户', tag: 'primary' },
  ROLE: { name: '指定角色', tag: 'success' }
}


// 获取类型标签
const getTypeTag = (type: string): any => typeMap[type as keyof typeof typeMap]?.tag || 'info'
const getTypeIcon = (type: string) => typeMap[type as keyof typeof typeMap]?.icon
const getTypeName = (type: string) => typeMap[type as keyof typeof typeMap]?.name || type


const isValidReceiverType = (type: string): type is ReceiverType => {
  return type in receiverTypeMap
}
// 获取接收类型标签
const getReceiverTagType = (type: string): TagType =>{
    if (isValidReceiverType(type)) {
    return receiverTypeMap[type].tag
  }
  return 'info' // 默认值
}

const getReceiverTypeName = (type: string) => receiverTypeMap[type as keyof typeof receiverTypeMap]?.name || type

// 格式化时间
const formatTime = (time: string, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

// 过滤变化
const handleFilterChange = (val: any) => {
  if (val === 'unread') {
    searchForm.status = '0'
  } else if (val === 'system') {
    searchForm.type = 'SYSTEM'
  } else if (val === 'personal') {
    searchForm.type = 'PERSONAL'
  } else if (val === 'task') {
    searchForm.type = 'TASK'
  } else {
    searchForm.type = ''
    searchForm.status = ''
  }
  pagination.current = 1
  fetchData()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  filterType.value = 'all'
  pagination.current = 1
  fetchData()
}

// 分页变化
const paginationChange = () => {
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...searchForm
    }
    const res = await getNotificationsApi(params)
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('获取通知列表失败', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}

// 刷新
const refreshTable = () => {
  selectedRows.value = []
  fetchData()
}

// 选择变化
const handleSelectionChange = (rows: Notification[]) => {
  selectedRows.value = rows
}

// 查看详情
const handleView = (row: Notification) => {
  detailDrawer.data = row
  detailDrawer.visible = true
  
  // 如果是未读，自动标记已读
  if (row.status === 0) {
    handleMarkRead(row)
  }
}

// 标记已读
const handleMarkRead = async (row: Notification) => {
  if (row.status === 1) return
  
  try {
    await markAsReadApi(row.id)
    row.status = 1
    notificationStore.fetchUnreadCount()
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记已读失败', error)
  }
}

// 删除单条
const handleDelete = async (row: Notification) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '删除确认',
      { type: 'warning' }
    )
    
    await deleteNotificationApi(row.id)
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      pagination.total--
    }
    notificationStore.fetchUnreadCount()
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条通知吗？`,
      '批量删除确认',
      { type: 'warning' }
    )
    
    await batchDeleteNotificationsApi(selectedKeys.value)
    selectedRows.value = []
    fetchData()
    notificationStore.fetchUnreadCount()
    ElMessage.success('批量删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 发送公告
const handleSendAnnouncement = () => {
  sendDialog.visible = true
}

// 发送成功
const handleSendSuccess = () => {
  fetchData()
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.notification-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 20px;
  
  .search-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-large);
    
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .actions-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .send-btn {
      background: linear-gradient(135deg, var(--ecommerce-primary), #ff8c5a);
      border: none;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
      }
    }
    
    .selected-count {
      font-size: 14px;
      color: var(--text-secondary);
      margin-left: 8px;
    }
  }
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.unread {
    .title-text {
      font-weight: 600;
      color: var(--primary-color);
    }
  }
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-regular);
}

.receiver-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .receiver-name {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.time-info {
  .read-time {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>