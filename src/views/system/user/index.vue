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
        </template>
      </ProForm>
      </el-card>
    </div>

    <!-- 用户表格区域 -->
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
                    :icon="Delete" 
                    :disabled="selectedRows.length === 0"
                    @click="handleBatchDelete"
                    class="batch-btn"
                    v-permission="'system:user:batch-delete'"
                  >
                    批量删除
                  </el-button>
                  <el-button 
                    :icon="Download" 
                    @click="handleExport"
                    class="export-btn"
                    :disabled="exportLoading"
                    v-permission="'system:user:export'"
                  >
                    导出数据
                  </el-button>
                  <span class="selected-count" v-if="selectedCount > 0">
                    已选择 {{ selectedCount }} 项
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
                  type="primary"
                  class="role-tag"
                >
                  {{ role.roleName }}
                </el-tag>
                <span v-if="!row.roles || row.roles.length === 0" class="no-role">
                  未分配角色
                </span>
              </div>
            </template>
            <template #action="{row}">
                 <div class="action-buttons">
                  <el-tooltip content="查看详情" placement="top">
                    <el-button 
                      v-permission="'system:user:view'"
                      type="info" 
                      :icon="View" 
                      size="small"
                      circle
                      @click="handlerView(row)"
                    />
                  </el-tooltip>
                <el-tooltip content="编辑" placement="top">
                  <el-button 
                    v-permission="'system:user:edit'"
                    type="primary" 
                    :icon="Edit" 
                    size="small"
                    circle
                    @click="handleEdit(row)"
                  />
                </el-tooltip>
                <el-tooltip content="分配角色" placement="top">
                  <el-button 
                    v-permission="'system:user:assign-roles'"
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
                       v-if="hasAnyPermission(['system:user:view-permission'])"
                        command="viewPermissions"
                      >
                        <el-icon><Lock /></el-icon>
                        <span>查看权限</span>
                      </el-dropdown-item>
                      <el-dropdown-item 
                        v-if="hasAllPermission(['system:user:enable','system:user:disable'])"
                        command="toggleStatus"
                        divided
                      >
                        <el-icon >
                          <component :is="row.isEnabled ? CircleClose : CircleCheck" />
                        </el-icon>
                        {{ row.isEnabled ? '禁用账户' : '启用账户' }}
                      </el-dropdown-item>
                      <el-dropdown-item 
                        v-if="hasAnyPermission(['system:user:reset-password'])"
                        command="resetPassword"
                        divided
                      >
                        <el-icon><Lock /></el-icon>
                        <span>重置密码</span>
                      </el-dropdown-item>
                      <el-dropdown-item 
                        v-if="hasAnyPermission(['system:user:delete'])"
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
import {getUserListApi,updateUserStatusApi,deleteUserApi, getUserPermissionIdsApi,exportUserDataApi} from '@/api/user'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()
const hasAnyPermission = (perm: string[]) => permissionStore.hasAnyPermission(perm)
const hasAllPermission = (perm: string[]) => permissionStore.hasAllPermissions(perm)

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
import {useRoleStore, type Role} from '@/stores/role'

const roleStore = useRoleStore();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  isEnabled: '',
  roleId: '',
  dateRange: []
})

const searchFormList = computed(() => [
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'用户名/昵称/邮箱/手机号',
    clearable: true,
    style:'width: 200px',
    keyEnter: () => {
      fetchUserList()
    },
    clear: () => {
      fetchUserList()
    },
     inputParse: (value: string) => {
        return value.replace(/\s+/g, '')
    }
  },
  {
    type:'select',
    label:'状态',
    prop:'isEnabled',
    placeholder:'全部状态',
    clearable: true,
    style:'width: 120px',
    options:[
      {
        id: 1,
        label:'启用'
      },
       {
        id: 0,
        label:'禁用'
      }
    ],
    clear: () => {
      fetchUserList()
    }
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
    options: roleStore.roleList as Role[],
    clear: () => {
      fetchUserList()
    }
  },
    {
    type:'dateRange',
    label:'创建时间',
    prop:'dateRange',
    style:'width: 240px',
    clear: () => {
      fetchUserList()
    }
  }
])

const searchFormRef = ref()
const tableData = ref<any[]>([])

const columns = ref<TableColumn[]>([
    {
        prop: 'userInfo',
        label:'用户信息',
        slot:'userInfo',
        sortable: true,
        width: 200
    },
    {
        prop: 'linkInfo',
        label:'联系信息',
        slot:'linkInfo',
        width: 200
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
        sortable: true,
        columnFormatter: (row) => {
          return formatTime(row.createdAt)
        }
    }
])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})


const loading = ref(false)
const exportLoading = ref(false)
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

// 选中的行的key值数组
const selectedKeys = ref<(number)[]>([])


// 搜索
const handleSearch = () => {
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchUserList()
}

// 当前页或每页显示条目数变化时触发
const paginationChange = () => {
  fetchUserList()
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
  let params = Object.assign({
      pageNum: pagination.current,
      pageSize: pagination.size
    }, searchForm)
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
  selectedRows.value = rows
  selectedKeys.value = rows.map(item => item.id) 
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
    await deleteUserApi(selectedKeys.value)
    ElMessage.success('删除成功')
    selectedRows.value = []
    selectedKeys.value = []
    fetchUserList()
    
  } catch (error) {
    // 用户取消
  }
}

// 导出当前筛选条件下的数据，忽略分页
const handleExport = async () => {
   if (exportLoading.value) {
    ElMessage.warning('正在导出中，请稍候...')
    return
  }
  try {
    exportLoading.value = true
    await exportUserDataApi(searchForm);
      ElMessage.success({
      message: '文件正在下载中，请稍后查看下载文件夹',
      duration: 3000
    })
  } catch (error) {
  } finally {
     // 延迟清除状态,避免频繁点击
    setTimeout(() => {
      exportLoading.value = false
    }, 2000)
  }
}

const refreshTable = () => {
  selectedRows.value = []
  selectedKeys.value = []
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


// 初始化
onMounted(() => {
  console.log('用户页面初始化')
  fetchUserList();
  roleStore.fetchAllRoles();
  const token = localStorage.getItem('access-token')
  if (token) {
  console.log(token.split('.')[1])  // 查看 payload 部分
  const payload = JSON.parse(atob(token.split('.')[1]!))
  console.log(payload)  // 看看 userId 在哪个字段
  }
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