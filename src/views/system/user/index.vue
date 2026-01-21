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
      <ProTable 
          :data="tableData" 
          :columns="columns"
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :loading="loading"
          showSelection
          showAction
          stripe
          >
            <template #table-header>
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
            </template>
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
                  :key="role.roleId"
                  size="small"
                  :type="getRoleTagType(role.roleName)"
                  class="role-tag"
                >
                  {{ role.roleName }}
                </el-tag>
                <span v-if="!row.roles || row.roles.length === 0" class="no-role">
                  未分配角色
                </span>
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
                  <el-tooltip content="查看详情" placement="top">
                    <el-button 
                      type="info" 
                      :icon="View" 
                      size="small"
                      circle
                      @click="handlerView(row)"
                    />
                  </el-tooltip>
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
                        command="viewPermissions"
                      >
                        <el-icon><Lock /></el-icon>
                        <span>查看权限</span>
                      </el-dropdown-item>
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
                        command="resetPassword"
                        :divided="row.isEnabled"
                      >
                        <el-icon><Lock /></el-icon>
                        <span>重置密码</span>
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

    <!-- 新建/编辑用户对话框 -->
    <UserFormDialog
      v-model="userDialog.visible"
      :title="userDialog.title"
      :type="userDialog.type"
      :data="userDialog.userData"
      @success="handleDialogSuccess"
    />

    <!-- 分配角色对话框 -->
    <AssignRoleDialog
      v-model="roleDialog.visible"
      :user-data="roleDialog.userData"
      @success="handleRoleAssignSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model="resetDialog.visible"
      :user-data="resetDialog.userData"
      @success="handleResetSuccess"
    />
    <!-- 用户权限查看对话框 -->
    <PermissionDrawer
      v-model="permissionDrawer.visible"
      :type="permissionDrawer.type"
      :default-checked-keys="permissionDrawer.defaultCheckedKeys"
      ></PermissionDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {getUserListApi,updateUserStatusApi,deleteUserApi, getUserPermissionIdsApi} from '@/api/user'

// 组件
import UserFormDialog from './components/UserFormDialog.vue'
import AssignRoleDialog from './components/AssignRoleDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'
import PermissionDrawer from '../components/PermissionDrawer/PermissionDrawer.vue'


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
  View
} from '@element-plus/icons-vue'
import {type TableColumn} from '@/components/ProTable/ProTable.vue'

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
const tableData = ref<any[]>([])

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
        tagFormatter:(row,type) => {
          if(type == 'text'){
             return row.isEnabled == 1 ? '启用' : '禁用'
          }else{
            return row.isEnabled==1? 'success' : 'danger'
          }
         
        }
    },
    {
        prop: 'passwordStatus',
        label:'密码状态',
        tags: true,
        tagFormatter:(row,type) => {
          if(type == 'text'){
             return row.passwordStatus ==1 ? '初始密码' : '已修改'
          }else{
            return row.passwordStatus ==1 ? 'warning' : 'info'
          }
         
        }
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
  size: 10,
  total: 0
})


const loading = ref(false)
const selectedRows = ref<any[]>([])

// 对话框状态
const userDialog = reactive({
  visible: false,
  title:"新增用户",
  type: 'create' as 'create' | 'edit' | 'view',
  userData: null as any
})

const roleDialog = reactive({
  visible: false,
  userData: null as any,
})

const resetDialog = reactive({
  visible: false,
  userData: null as any
})

const permissionDrawer = reactive({
  visible: false,
  type:'userView' as 'view' | 'userView' | 'edit',
  defaultCheckedKeys:  [] as (string | number)[]
})



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

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    let params = {
      pageNum: pagination.current,
      pageSize: pagination.size
    }
  const res =  await getUserListApi(params);
   if(res.data){
      tableData.value = res.data.list;
      pagination.total = res.data.total
   }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}

const handleSelectionChange = (rows: any[]) => {
  console.log('rows===',rows)
  selectedRows.value = rows
}

const handleSortChange = (sort: any) => {
  console.log('排序变化:', sort)
  // 调用API重新获取排序后的数据
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
  userDialog.title ="新增用户"
  userDialog.userData = null
  userDialog.visible = true
}

const handleEdit = (row: any) => {
  userDialog.type = 'edit'
  userDialog.title ="编辑用户"
  userDialog.userData = { ...row }
  userDialog.visible = true
}

const handlerView = (row:any) => {
    userDialog.type = 'view'
    userDialog.title ="查看用户"
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
    case 'viewPermissions':
      getUserPermissionIdsApi(row.id).then( res=>{
        const permissionIds = res.data || [];
        permissionDrawer.defaultCheckedKeys = permissionIds;
        permissionDrawer.visible = true;
      })
      break
    case 'toggleStatus':
      toggleUserStatus(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
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
      await updateUserStatusApi({
      id: row.id,
      isEnabled: Number(newStatus)
    })
    
    ElMessage.success(`${action}成功`)
    row.isEnabled = newStatus
    
  } catch (error) {
    // 用户取消
  }
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
    
    await deleteUserApi([row.id])

    ElMessage.success('删除成功')
    fetchUserList()
    
  } catch (error) {
    // 用户取消
  }
}

const handleDialogSuccess = () => {
  fetchUserList()
}

const handleRoleAssignSuccess = () => {
  roleDialog.userData = null
  fetchUserList()
}

const handleResetSuccess = () => {
  // 如果需要刷新密码状态，可以重新获取用户数据
  fetchUserList()
}

const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

const getRoleTagType = (roleName: string): 'success' | 'danger' | 'primary' | 'warning' | 'info' => {
  const typeMap: Record<string, 'success' | 'danger' | 'primary' | 'warning' | 'info'> = {
    '租户超级管理员': 'danger',
    '系统管理员': 'warning',
    '商品专员': 'success',
    '订单客服': 'info',
    '财务人员': 'primary'
  }
  return typeMap[roleName] || 'primary'
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