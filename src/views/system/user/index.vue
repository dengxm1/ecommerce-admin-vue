<template>
  <div class="user-management">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card class="search-card" shadow="never">
        <ProForm ref="searchFormRef" :modelForm="searchForm" :formItemList="searchFormList" inline>
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
                  <el-button 
                  type="primary"
                    link
                    @click="toggleAdvancedSearch"
                    class="advanced-btn"
                  >
                    {{ showAdvanced ? '收起' : '高级筛选' }}
                    <el-icon :class="{ 'rotate-icon': showAdvanced }">
                      <ArrowDown />
                    </el-icon>
                  </el-button>
            </template>
        </ProForm>
        <!-- 高级筛选（可折叠） -->
        <el-collapse-transition>
          <div v-show="showAdvanced" class="advanced-search">
            <el-divider />
            <ProForm ref="advancedFormRef" :modelForm="searchForm" :formItemList="advancedFormList" inline></ProForm>
          </div>
        </el-collapse-transition>
      </el-card>
    </div>

    <!-- 用户表格区域 -->
    <div class="table-section">
      <el-card shadow="never">
        <!-- 表格操作栏 -->
        <div class="table-actions">
          <div class="actions-left">
            <el-button 
              :icon="Delete" 
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
              class="batch-btn"
            >
              批量删除
            </el-button>
            <el-button 
              :icon="Download" 
              @click="handleExport"
              class="export-btn"
            >
              导出数据
            </el-button>
            <span class="selected-count" v-if="selectedRows.length > 0">
              已选择 {{ selectedRows.length }} 项
            </span>
          </div>
          <div class="actions-right">
             <el-button 
                v-permission="'system:user:add'"
                type="primary" 
                :icon="Plus" 
                @click="handleCreate"
                class="create-btn"
                >
                新建用户
              </el-button>
            <el-button 
              :icon="RefreshRight" 
              circle 
              @click="refreshTable"
              title="刷新"
            />
          </div>
        </div>
        
        <ProTable 
          :data="tableData" 
          :columns="columns"
          showSelection
          showAction
          stripe
          >
            <template #userInfo="{row}">
                <div class="user-info-cell">
                  <el-avatar 
                    :size="36" 
                    :src="row.avatar"
                    class="user-avatar"
                  >
                    {{ row.nickname?.charAt(0) || row.username?.charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="username">{{ row.username }}</div>
                    <div class="nickname">{{ row.nickname || '未设置昵称' }}</div>
                  </div>
                </div>
            </template>
            <template #linkInfo="{row}">
                <div class="contact-info">
                  <div class="email">
                    <el-icon><Message /></el-icon>
                    <span>{{ row.email || '未设置邮箱' }}</span>
                  </div>
                  <div class="phone">
                    <el-icon><Iphone /></el-icon>
                    <span>{{ row.phone || '未设置手机' }}</span>
                  </div>
              </div>
            </template>
            <template #role="{row}">
               <div class="role-tags">
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  size="small"
                  :type="getRoleTagType(role.name)"
                  class="role-tag"
                >
                  {{ role.name }}
                </el-tag>
                <span v-if="!row.roles || row.roles.length === 0" class="no-role">
                  未分配角色
                </span>
              </div>
            </template>
            <template #passwordStatus="{row}">
                <div class="password-status">
                <el-tooltip 
                  :content="row.isInitialPassword ? '使用初始密码，建议修改' : '密码已修改'"
                  placement="top"
                >
                  <el-tag 
                    :type="row.isInitialPassword ? 'warning' : 'info'"
                    size="small"
                  >
                    {{ row.isInitialPassword ? '初始密码' : '已修改' }}
                  </el-tag>
                </el-tooltip>
              </div>
            </template>
            <template #createdAt="{row}">
                <div class="time-info">
                  <div class="create-time">
                    {{ formatTime(row.createdAt) }}
                  </div>
                  <div class="last-login" v-if="row.lastLoginTime">
                    最后登录：{{ formatTime(row.lastLoginTime, 'MM-DD HH:mm') }}
                  </div>
              </div>
            </template>
            <template #action="{row}">
                 <div class="action-buttons">
                <el-tooltip content="编辑" placement="top">
                  <el-button 
                    type="primary" 
                    :icon="Edit" 
                    size="small"
                    circle
                    @click="handleEdit(row)"
                  />
                </el-tooltip>
                <el-tooltip content="分配角色" placement="top">
                  <el-button 
                    type="success" 
                    :icon="UserFilled" 
                    size="small"
                    circle
                    @click="handleAssignRole(row)"
                  />
                </el-tooltip>
                <el-tooltip content="重置密码" placement="top">
                  <el-button 
                    type="warning" 
                    :icon="Lock" 
                    size="small"
                    circle
                    @click="handleResetPassword(row)"
                  />
                </el-tooltip>
                <el-dropdown 
                  @command="handleMoreCommand($event, row)"
                  trigger="click"
                >
                  <el-button 
                    type="info" 
                    :icon="More" 
                    size="small"
                    circle
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        command="toggleStatus"
                        :divided="row.isEnabled"
                      >
                        <el-icon>
                          <component :is="row.isEnabled ? CircleClose : CircleCheck" />
                        </el-icon>
                        {{ row.isEnabled ? '禁用账户' : '启用账户' }}
                      </el-dropdown-item>
                      <el-dropdown-item 
                        command="forcePasswordChange"
                        :disabled="row.isInitialPassword"
                      >
                        <el-icon><Key /></el-icon>
                        强制修改密码
                      </el-dropdown-item>
                      <el-dropdown-item 
                        command="viewLogs"
                        divided
                      >
                        <el-icon><Document /></el-icon>
                        查看操作日志
                      </el-dropdown-item>
                      <el-dropdown-item 
                        command="delete" 
                        divided
                        class="delete-item"
                      >
                        <el-icon><Delete /></el-icon>
                        <span style="color: var(--danger-color)">删除账户</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
        </ProTable>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </el-card>
    </div>

    <!-- 新建/编辑用户对话框 -->
    <UserFormDialog
      v-model="userDialog.visible"
      :title="userDialog.title"
      @success="handleDialogSuccess"
    />

    <!-- 分配角色对话框 -->
    <!-- <AssignRoleDialog
      v-model="roleDialog.visible"
      :user-data="roleDialog.userData"
      @success="handleRoleAssignSuccess"
    /> -->

    <!-- 重置密码对话框 -->
    <!-- <ResetPasswordDialog
      v-model="resetDialog.visible"
      :user-data="resetDialog.userData"
      @success="handleResetSuccess"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import dayjs from 'dayjs'

// 组件
import UserFormDialog from './components/UserFormDialog.vue'
// import AssignRoleDialog from './components/AssignRoleDialog.vue'
// import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

// API（模拟）
// import { 
//   getUserList, 
//   deleteUser, 
//   batchDeleteUsers,
//   toggleUserStatus,
//   exportUserData
// } from '@/api/system/user'

// 图标
import {
  Plus,
  Search,
  Refresh,
  ArrowDown,
  Delete,
  Download,
  RefreshRight,
  Message,
  Iphone,
  CircleCheck,
  CircleClose,
  Edit,
  UserFilled,
  Lock,
  More,
  Key,
  Document
} from '@element-plus/icons-vue'
import {type TableColumn} from '@/components/ProTable/ProTable.vue'
// 表格引用
const userTableRef = ref<InstanceType<typeof ElTable>>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  roleId: '',
  dateRange: [],
  email: '',
  phone: '',
  lastLogin: []
})

const searchFormList = ref([
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'用户名/昵称/邮箱',
    clearable: true,
    style:'width: 200px'
  },
  {
    type:'select',
    label:'状态',
    prop:'status',
    placeholder:'全部状态',
    clearable: true,
    style:'width: 120px',
    options:[
      {
        id: 'enabled',
        label:'启用'
      },
       {
        id: 'disabled',
        label:'禁用'
      }
    ]
  },
  {
    type:'select',
    label:'角色',
    prop:'roleId',
    placeholder:'全部角色',
    clearable: true,
    style:'width: 140px',
    selectProps:{
      value:'id',
      label:'name'
    },
    options:[
      { id: 1, name: '超级管理员' },
      { id: 2, name: '系统管理员' },
      { id: 3, name: '商品专员' },
      { id: 4, name: '订单客服' },
      { id: 5, name: '财务人员' }
    ]
  },
    {
    type:'dateRange',
    label:'创建时间',
    prop:'dateRange',
    style:'width: 240px',
  }
])

const advancedFormList = ref([
  {
    type:'input',
    label:'邮箱',
    prop:'email',
    placeholder:'邮箱地址',
    clearable: true,
    style:'width: 200px'
  },
   {
    type:'input',
    label:'手机号',
    prop:'phone',
    placeholder:'手机号码',
    clearable: true,
    style:'width: 200px'
  },
     {
    type:'dateRange',
    label:'最后登录',
    prop:'lastLogin',
    clearable: true,
    style:'width: 240px'
  },
])


const searchFormRef = ref()
const advancedFormRef = ref()
const showAdvanced = ref(false)
const tableData = ref<any[]>([
    {
    id: 1,
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    roles: [{ id: 1, name: '超级管理员' }],
    isEnabled: true,
    isInitialPassword: false,
    createdAt: '2024-01-01 10:00:00',
    lastLoginTime: '2024-03-20 15:30:00'
  },
  {
    id: 2,
    username: 'product_manager',
    nickname: '商品经理',
    email: 'product@example.com',
    phone: '13800138001',
    avatar: '',
    roles: [{ id: 3, name: '商品专员' }],
    isEnabled: true,
    isInitialPassword: true,
    createdAt: '2024-02-15 14:20:00',
    lastLoginTime: '2024-03-19 09:15:00'
  },
  {
    id: 3,
    username: 'order_service',
    nickname: '订单客服',
    email: 'service@example.com',
    phone: '',
    avatar: '',
    roles: [{ id: 4, name: '订单客服' }, { id: 5, name: '财务人员' }],
    isEnabled: true,
    isInitialPassword: false,
    createdAt: '2024-03-01 09:00:00',
    lastLoginTime: null
  },
  {
    id: 4,
    username: 'disabled_user',
    nickname: '禁用用户',
    email: 'disabled@example.com',
    phone: '13800138002',
    avatar: '',
    roles: [],
    isEnabled: false,
    isInitialPassword: true,
    createdAt: '2024-03-10 16:45:00',
    lastLoginTime: null
  }
])

const columns = ref<TableColumn[]>([
    {
        prop: 'userInfo',
        label:'用户信息',
        slot:'userInfo',
        sortable: true
    },
    {
        prop: 'linkInfo',
        label:'联系信息',
        slot:'linkInfo',
    },
    {
        prop: 'role',
        label:'角色',
        slot:'role',
    },
    {
        prop: 'status',
        label:'状态',
        tags: true,
        formatter:(row,type) => {
          if(type == 'text'){
             return row.isEnabled ? '启用' : '禁用'
          }else{
            return row.isEnabled ? 'success' : 'danger'
          }
         
        }
    },
    {
        prop: 'passwordStatus',
        label:'密码状态',
        slot:'passwordStatus',
    },
    {
        prop: 'createdAt',
        label:'创建时间',
        slot:'createdAt',
        sortable: true,
    }
])

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 表格数据
const loading = ref(false)
const userList = ref<any[]>([])
const selectedRows = ref<any[]>([])

// 对话框状态
const userDialog = reactive({
  visible: false,
  title:"新增用户",
  type: 'create' as 'create' | 'edit',
  userData: null as any
})

const roleDialog = reactive({
  visible: false,
  userData: null as any
})

const resetDialog = reactive({
  visible: false,
  userData: null as any
})

// 角色选项（模拟数据）
const roleOptions = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '系统管理员' },
  { id: 3, name: '商品专员' },
  { id: 4, name: '订单客服' },
  { id: 5, name: '财务人员' }
])


// 计算属性
const selectedCount = computed(() => selectedRows.value.length)

// 方法
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  advancedFormRef.value?.resetFields()
  pagination.current = 1
  fetchUserList()
}

const fetchUserList = async () => {
  loading.value = true
  try {
    
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: any[]) => {
  console.log('rows===',rows)
  selectedRows.value = rows
}

const handleSortChange = (sort: any) => {
  console.log('排序变化:', sort)
  // 实际项目中这里会调用API重新获取排序后的数据
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchUserList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchUserList()
}

const handleCreate = () => {
  userDialog.type = 'create'
  userDialog.userData = null
  userDialog.visible = true
}

const handleEdit = (row: any) => {
  userDialog.type = 'edit'
  userDialog.userData = { ...row }
  userDialog.visible = true
}

const handleAssignRole = (row: any) => {
  roleDialog.userData = { ...row }
  roleDialog.visible = true
}

const handleResetPassword = (row: any) => {
  resetDialog.userData = { ...row }
  resetDialog.visible = true
}

const handleMoreCommand = (command: string, row: any) => {
  switch (command) {
    case 'toggleStatus':
      toggleUserStatus(row)
      break
    case 'forcePasswordChange':
      forcePasswordChange(row)
      break
    case 'viewLogs':
      viewUserLogs(row)
      break
    case 'delete':
      deleteSingleUser(row)
      break
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    
    // API调用
    
    ElMessage.success('删除成功')
    selectedRows.value = []
    fetchUserList()
    
  } catch (error) {
    // 用户取消
  }
}

const handleExport = async () => {
  loading.value = true
  try {
    // todo:导出
    ElMessage.success('导出任务已开始，请稍后查看下载列表')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

const refreshTable = () => {
  fetchUserList()
}

const toggleUserStatus = async (row: any) => {
  try {
    const newStatus = !row.isEnabled
    const action = newStatus ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消',
        type: newStatus ? 'success' : 'warning'
      }
    )
    
    // API调用
    
    ElMessage.success(`${action}成功`)
    row.isEnabled = newStatus
    
  } catch (error) {
    // 用户取消
  }
}

const forcePasswordChange = (row: any) => {
  ElMessageBox.confirm(
    `强制用户 "${row.username}" 下次登录时必须修改密码？`,
    '强制修改密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(() => {
    ElMessage.success('设置成功，用户下次登录时必须修改密码')
  }).catch(() => {
    // 取消
  })
}

const viewUserLogs = (row: any) => {
  ElMessage.info(`查看用户 ${row.username} 的操作日志`)
}

const deleteSingleUser = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
    )
    
    // API调用
    
    ElMessage.success('删除成功')
    fetchUserList()
    
  } catch (error) {
    // 用户取消
  }
}

const handleDialogSuccess = () => {
  userDialog.visible = false
  fetchUserList()
}

const handleRoleAssignSuccess = () => {
  roleDialog.visible = false
  fetchUserList()
}

const handleResetSuccess = () => {
  resetDialog.visible = false
  // 如果需要刷新密码状态，可以重新获取用户数据
  // fetchUserList()
}

const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

const getRoleTagType = (roleName: string): string => {
  const typeMap: Record<string, string> = {
    '超级管理员': 'danger',
    '系统管理员': 'warning',
    '商品专员': 'success',
    '订单客服': 'info',
    '财务人员': 'primary'
  }
  return typeMap[roleName] || ''
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 20px;
  
  .search-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-large);
    background: white;
    
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
  
  .advanced-btn {
    margin-left: 16px;
    
    .rotate-icon {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
  }
  
  .advanced-search {
    .el-divider {
      margin: 20px 0;
    }
  }
}

/* 表格区域 */
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  
  :deep(.el-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-large);
    background: white;
    
    .el-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
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
      
      .batch-btn, .export-btn {
        border-radius: 6px;
      }
      
      .selected-count {
        font-size: 14px;
        color: var(--text-secondary);
        margin-left: 8px;
      }
    }
    
    .actions-right {
      display: flex;
      align-items: center;
      gap: 12px;
      .create-btn {
        background: linear-gradient(135deg, var(--ecommerce-primary), #ff8c5a);
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        margin-right: 8px;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
      }
    }
  }
  
  /* 表格单元格样式 */
  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-avatar {
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--ecommerce-primary), var(--ecommerce-secondary));
      color: white;
      font-weight: 600;
    }
    
    .user-details {
      .username {
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px;
      }
      
      .nickname {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
  
  .contact-info {
    .email, .phone {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-regular);
      
      .el-icon {
        color: var(--text-secondary);
        font-size: 14px;
      }
    }
    
    .phone {
      margin-top: 4px;
    }
  }
  
  .role-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .role-tag {
      margin: 2px;
    }
    
    .no-role {
      font-size: 12px;
      color: var(--text-placeholder);
      font-style: italic;
    }
  }
  
  .status-tag {
    display: inline-flex;
    align-items: center;
    
    .status-icon {
      font-size: 12px;
      margin-right: 4px;
    }
  }
  
  .password-status {
    display: flex;
  }
  
  .time-info {
    .create-time {
      font-size: 13px;
      color: var(--text-regular);
      margin-bottom: 4px;
    }
    
    .last-login {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    
    .delete-item {
      color: var(--danger-color);
    }
  }
  
  /* 分页 */
  .pagination-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
  }
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .search-section {
    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 12px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    
    .header-right {
      width: 100%;
      
      .create-btn {
        width: 100%;
      }
    }
  }
  
  .table-actions {
    flex-direction: column;
    gap: 12px;
    
    .actions-left, .actions-right {
      width: 100%;
      justify-content: flex-start;
    }
  }
}

/* 动画效果 */
.el-button {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.el-tag {
  transition: all 0.2s ease;
}
</style>