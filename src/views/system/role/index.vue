<template>
  <div class="role-management">
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

    <!-- 角色表格区域 -->
    <div class="table-section">
      <el-card shadow="never">
        <!-- 表格操作栏 -->
        <div class="table-actions">
          <div class="actions-left">
            <span class="role-count" v-if="roleStatistics.total > 0">
              共 {{ roleStatistics.total }} 个角色
              <template v-if="roleStatistics.custom > 0">
                ({{ roleStatistics.custom }} 个自定义角色)
              </template>
            </span>
          </div>
          <div class="actions-right">
            <el-button 
              type="primary" 
              :icon="Plus" 
              @click="handleCreate"
              class="create-btn"
            >
              新建角色
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
          showAction
          stripe
          >
            
            <!-- 角色描述 -->
            <template #description="{row}">
                <div class="description-cell">
                  <div class="description-text">
                    {{ row.description || '暂无描述' }}
                  </div>
                  <div class="permission-count" v-if="row.permissionCount > 0">
                    <el-tag size="small" type="info">
                      {{ row.permissionCount }} 项权限
                    </el-tag>
                  </div>
                </div>
            </template>
            
            <!-- 关联用户 -->
            <template #users="{row}">
               <div class="user-tags">
                <div class="user-info" v-if="row.userCount > 0">
                  <el-popover
                    placement="top-start"
                    title="关联用户"
                    :width="200"
                    trigger="hover"
                    v-if="row.users && row.users.length > 0"
                  >
                    <template #reference>
                      <div class="user-avatars">
                        <el-avatar 
                          v-for="user in row.users.slice(0, 2)"
                          :key="user.id"
                          :size="28"
                          :src="user.avatar"
                          class="user-avatar"
                        >
                          {{ user.nickname?.charAt(0) || user.username?.charAt(0) }}
                        </el-avatar>
                        <el-tag 
                          v-if="row.userCount > 2"
                          size="small"
                          type="info"
                          class="more-tag"
                        >
                          +{{ row.userCount - 2 }}
                        </el-tag>
                      </div>
                    </template>
                    <div class="user-list">
                      <div 
                        v-for="user in row.users" 
                        :key="user.id"
                        class="user-item"
                      >
                        <el-avatar :size="24" :src="user.avatar">
                          {{ user.nickname?.charAt(0) || user.username?.charAt(0) }}
                        </el-avatar>
                        <span class="user-name">{{ user.nickname || user.username }}</span>
                      </div>
                    </div>
                  </el-popover>
                  <div class="user-count">
                    <span class="count-text">{{ row.userCount }} 人</span>
                  </div>
                </div>
                <span v-else class="no-users">
                  暂无用户
                </span>
              </div>
            </template>
            
            <!-- 角色状态 -->
            <template #status="{row}">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  :loading="row.statusLoading"
                  @change="(val) => toggleRoleStatus(row, val)"
                  :disabled="row.code === 'TENANT_SUPER_ADMIN'"
                />
            </template>
            
            <!-- 创建时间 -->
            <template #createdAt="{row}">
                <div class="time-info">
                  <div class="create-time">
                    {{ formatTime(row.createdAt, 'MM-DD') }}
                  </div>
                  <div class="update-time" v-if="row.updatedAt">
                    {{ formatTime(row.updatedAt, 'MM-DD') }}
                  </div>
              </div>
            </template>
            
            <!-- 操作列 -->
            <template #action="{row}">
                 <div class="action-buttons">
                  <el-tooltip content="分配权限" placement="top">
                    <el-button 
                      type="primary" 
                      :icon="Lock" 
                      size="small"
                      link
                      @click="handleAssignPermission(row)"
                    >
                      权限
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="编辑" placement="top">
                    <el-button 
                      type="success" 
                      :icon="Edit" 
                      size="small"
                      link
                      @click="handleEdit(row)"
                      :disabled="row.isSystem && row.code !== 'TENANT_SUPER_ADMIN'"
                    >
                      编辑
                    </el-button>
                  </el-tooltip>
                  
                  <el-dropdown 
                    @command="handleMoreCommand($event, row)"
                    trigger="click"
                    size="small"
                  >
                    <el-button 
                      type="info" 
                      :icon="More" 
                      size="small"
                      link
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item 
                          command="copy"
                          :icon="CopyDocument"
                        >
                          复制角色
                        </el-dropdown-item>
                        
                        <el-dropdown-item 
                          command="viewUsers"
                          :disabled="row.userCount === 0"
                          :icon="UserFilled"
                        >
                          查看用户
                        </el-dropdown-item>
                        
                        <el-dropdown-item 
                          command="permissionDetail"
                          :icon="Document"
                          divided
                        >
                          权限详情
                        </el-dropdown-item>
                        
                        <el-dropdown-item 
                          command="delete" 
                          divided
                          :icon="Delete"
                          :disabled="row.isSystem"
                          class="delete-item"
                        >
                          <span :style="{ color: row.isSystem ? '#909399' : 'var(--danger-color)' }">
                            删除
                          </span>
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
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </el-card>
    </div>

    <!-- 新建/编辑角色对话框 -->
    <!-- <RoleFormDialog
      v-model="dialog.visible"
      :type="dialog.type"
      :role-data="dialog.roleData"
      @success="handleDialogSuccess"
    /> -->

    <!-- 权限分配对话框 -->
    <!-- <PermissionDialog
      v-model="permissionDialog.visible"
      :role-data="permissionDialog.roleData"
      @success="handlePermissionSuccess"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 图标
import {
  Plus,
  Search,
  Refresh,
  RefreshRight,
  Edit,
  Lock,
  CopyDocument,
  More,
  UserFilled,
  Document,
  Delete,
  User,
  Setting,
  Star,
  Tools,
  Goods,
  Monitor,
  Coin,
  Tickets,
  DataAnalysis,
  Present
} from '@element-plus/icons-vue'
import { type TableColumn } from '@/components/ProTable/ProTable.vue'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  isSystem: ''
})

const searchFormList = ref([
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'角色名称/编码',
    clearable: true,
    style:'width: 200px'
  },
  {
    type:'select',
    label:'状态',
    prop:'status',
    placeholder:'全部状态',
    clearable: true,
    style:'width: 100px',
    options:[
      {
        value: '1',
        label:'启用'
      },
      {
        value: '0',
        label:'禁用'
      }
    ]
  },
  {
    type:'select',
    label:'类型',
    prop:'isSystem',
    placeholder:'全部类型',
    clearable: true,
    style:'width: 100px',
    options:[
      { value: 'true', label: '系统' },
      { value: 'false', label: '自定义' }
    ]
  }
])

const searchFormRef = ref()

// 表格数据
const tableData = ref<any[]>([
  {
    id: 1,
    name: '租户超级管理员',
    code: 'TENANT_SUPER_ADMIN',
    description: '拥有系统所有权限，最高权限角色',
    status: 1,
    isSystem: true,
    permissionCount: 42,
    userCount: 1,
    users: [
      { id: 1, username: 'admin', nickname: '超级管理员', avatar: '' }
    ],
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-03-20 15:30:00',
    statusLoading: false
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'SYSTEM_ADMIN',
    description: '管理系统设置、用户和角色',
    status: 1,
    isSystem: true,
    permissionCount: 18,
    userCount: 2,
    users: [
      { id: 2, username: 'sysadmin', nickname: '系统管理员', avatar: '' },
      { id: 3, username: 'manager', nickname: '经理', avatar: '' }
    ],
    createdAt: '2024-01-05 14:20:00',
    updatedAt: null,
    statusLoading: false
  },
  {
    id: 3,
    name: '商品管理员',
    code: 'PRODUCT_MANAGER',
    description: '负责商品上下架、分类管理',
    status: 1,
    isSystem: false,
    permissionCount: 12,
    userCount: 3,
    users: [
      { id: 4, username: 'product1', nickname: '商品专员A', avatar: '' },
      { id: 5, username: 'product2', nickname: '商品专员B', avatar: '' }
    ],
    createdAt: '2024-02-15 09:00:00',
    updatedAt: '2024-03-10 11:20:00',
    statusLoading: false
  },
  {
    id: 4,
    name: '订单客服',
    code: 'ORDER_SERVICE',
    description: '处理订单、售后和客户咨询',
    status: 1,
    isSystem: false,
    permissionCount: 10,
    userCount: 5,
    users: [
      { id: 6, username: 'service1', nickname: '客服A', avatar: '' },
      { id: 7, username: 'service2', nickname: '客服B', avatar: '' }
    ],
    createdAt: '2024-02-20 13:30:00',
    updatedAt: null,
    statusLoading: false
  },
  {
    id: 5,
    name: '财务人员',
    code: 'FINANCE_STAFF',
    description: '财务对账、收支管理',
    status: 1,
    isSystem: false,
    permissionCount: 8,
    userCount: 2,
    users: [
      { id: 8, username: 'finance1', nickname: '财务A', avatar: '' }
    ],
    createdAt: '2024-03-01 15:45:00',
    updatedAt: null,
    statusLoading: false
  },
  {
    id: 6,
    name: '仓库管理员',
    code: 'WAREHOUSE_KEEPER',
    description: '库存管理、出入库操作',
    status: 0,
    isSystem: false,
    permissionCount: 9,
    userCount: 2,
    users: [
      { id: 9, username: 'warehouse1', nickname: '仓管员', avatar: '' }
    ],
    createdAt: '2024-03-05 10:20:00',
    updatedAt: '2024-03-12 14:30:00',
    statusLoading: false
  },
  {
    id: 7,
    name: '营销专员',
    code: 'MARKETING_SPECIALIST',
    description: '活动策划、优惠券管理',
    status: 1,
    isSystem: false,
    permissionCount: 7,
    userCount: 3,
    users: [
      { id: 10, username: 'marketing1', nickname: '营销A', avatar: '' },
      { id: 11, username: 'marketing2', nickname: '营销B', avatar: '' }
    ],
    createdAt: '2024-03-08 11:00:00',
    updatedAt: null,
    statusLoading: false
  },
  {
    id: 8,
    name: '数据分析师',
    code: 'DATA_ANALYST',
    description: '查看分析报表和数据统计',
    status: 1,
    isSystem: false,
    permissionCount: 6,
    userCount: 1,
    users: [],
    createdAt: '2024-03-10 16:45:00',
    updatedAt: null,
    statusLoading: false
  }
])

const columns = ref<TableColumn[]>([
  {
    prop: 'name',
    label: '角色名称',
    // slot: 'name',
    minWidth: 180
  },
   {
    prop: 'code',
    label: '角色编码',
    // slot: 'code',
    minWidth: 180
  },
  {
    prop: 'description',
    label: '描述',
    // slot: 'description',
    minWidth: 200
  },
  {
    prop: 'users',
    label: '用户',
    // slot: 'users',
    width: 140
  },
  {
    prop: 'permissionCount',
    label: '权限',
    width: 80,
    sortable: true
  },
  {
    prop: 'status',
    label: '状态',
    slot: 'status',
    width: 80
  },
  {
    prop: 'createdAt',
    label: '时间',
    slot: 'createdAt',
    width: 120
  }
])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 8
})

// 统计信息
const roleStatistics = reactive({
  total: 0,
  enabled: 0,
  disabled: 0,
  system: 0,
  custom: 0
})

// 对话框状态
const dialog = reactive({
  visible: false,
  type: 'create' as 'create' | 'edit',
  roleData: null as any
})

const permissionDialog = reactive({
  visible: false,
  roleData: null as any
})

// 初始化统计信息
const updateStatistics = () => {
  const data = tableData.value
  roleStatistics.total = data.length
  roleStatistics.enabled = data.filter(item => item.status === 1).length
  roleStatistics.disabled = data.filter(item => item.status === 0).length
  roleStatistics.system = data.filter(item => item.isSystem).length
  roleStatistics.custom = data.filter(item => !item.isSystem).length
}

// 方法
const handleSearch = () => {
  pagination.current = 1
  fetchRoleList()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1
  fetchRoleList()
}

const fetchRoleList = async () => {
  // 模拟API调用
  updateStatistics()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchRoleList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchRoleList()
}

const handleCreate = () => {
  dialog.type = 'create'
  dialog.roleData = null
  dialog.visible = true
}

const handleEdit = (row: any) => {
  if (row.isSystem && row.code !== 'TENANT_SUPER_ADMIN') {
    ElMessage.warning('系统内置角色不允许编辑')
    return
  }
  
  dialog.type = 'edit'
  dialog.roleData = { ...row }
  dialog.visible = true
}

const handleAssignPermission = (row: any) => {
  permissionDialog.roleData = { ...row }
  permissionDialog.visible = true
}

const toggleRoleStatus = async (row: any, newStatus: any) => {
  // 超级管理员角色不允许禁用
  if (row.code === 'TENANT_SUPER_ADMIN' && newStatus === 0) {
    ElMessage.warning('超级管理员角色不能禁用')
    row.status = 1
    return
  }
  
  try {
    row.statusLoading = true
    
    const action = newStatus === 1 ? '启用' : '禁用'
    const confirmMessage = newStatus === 0 
      ? `禁用后，关联的 ${row.userCount} 个用户将无法使用此角色的权限，确定要禁用吗？`
      : `确定要启用角色 "${row.name}" 吗？`
    
    // await ElMessageBox.confirm(
    //   confirmMessage,
    //   `${action}确认`,
    //   {
    //     confirmButtonText: `确定${action}`,
    //     cancelButtonText: '取消',
    //     type: newStatus === 1 ? 'success' : 'warning'
    //   }
    // )
    
    // API调用
    // await toggleRoleStatus(row.id, newStatus)
    // updateStatistics()
    
  } catch (error) {
    // 用户取消，恢复原状态
    row.status = newStatus === 1 ? 0 : 1
  } finally {
    row.statusLoading = false
  }
}

const handleMoreCommand = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      handleCopyRole(row)
      break
    case 'viewUsers':
      viewRoleUsers(row)
      break
    case 'permissionDetail':
      viewPermissionDetail(row)
      break
    case 'delete':
      deleteSingleRole(row)
      break
  }
}

const handleCopyRole = (row: any) => {
  ElMessageBox.prompt('请输入新角色名称', '复制角色', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: `${row.name} - 复制`,
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '角色名称不能为空'
      }
      if (value.length > 20) {
        return '角色名称不能超过20个字符'
      }
      return true
    }
  }).then(({ value }) => {
    // 调用API复制角色
    ElMessage.success(`角色 "${row.name}" 已复制为 "${value}"`)
    fetchRoleList()
  }).catch(() => {
    // 取消
  })
}

const viewRoleUsers = (row: any) => {
  ElMessage.info(`查看角色 "${row.name}" 的用户列表`)
  // 实际项目中可以跳转到用户管理页面，并自动筛选该角色的用户
}

const viewPermissionDetail = (row: any) => {
  ElMessage.info(`查看角色 "${row.name}" 的权限详情`)
  // 可以打开一个对话框展示具体的权限列表
}

const deleteSingleRole = async (row: any) => {
  if (row.isSystem) {
    ElMessage.warning('系统角色不能删除')
    return
  }
  
  if (row.userCount > 0) {
    await ElMessageBox.confirm(
      `角色 "${row.name}" 关联了 ${row.userCount} 个用户，删除后这些用户将失去此角色的权限。确定要删除吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } else {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  }
  
  try {
    // API调用
    // await deleteRole(row.id)
    
    ElMessage.success('删除成功')
    fetchRoleList()
    
  } catch (error) {
    // 用户取消
  }
}

const refreshTable = () => {
  fetchRoleList()
  ElMessage.success('刷新成功')
}

const handleDialogSuccess = () => {
  dialog.visible = false
  fetchRoleList()
}

const handlePermissionSuccess = () => {
  permissionDialog.visible = false
  fetchRoleList()
}

const formatTime = (time: string, format: string = 'MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

const getRoleIcon = (code: string) => {
  const iconMap: Record<string, any> = {
    'TENANT_SUPER_ADMIN': Star,
    'SYSTEM_ADMIN': Setting,
    'PRODUCT_MANAGER': Goods,
    'ORDER_SERVICE': Tickets,
    'FINANCE_STAFF': Coin,
    'WAREHOUSE_KEEPER': Tools,
    'MARKETING_SPECIALIST': Present,
    'DATA_ANALYST': DataAnalysis
  }
  return iconMap[code] || User
}

const getRoleIconColor = (code: string) => {
  const colorMap: Record<string, string> = {
    'TENANT_SUPER_ADMIN': '#E6A23C',  // 金色
    'SYSTEM_ADMIN': '#9B39F4',       // 紫色
    'PRODUCT_MANAGER': '#67C23A',    // 绿色
    'ORDER_SERVICE': '#409EFF',      // 蓝色
    'FINANCE_STAFF': '#F56C6C',      // 红色
    'WAREHOUSE_KEEPER': '#909399',   // 灰色
    'MARKETING_SPECIALIST': '#FF85C0', // 粉色
    'DATA_ANALYST': '#36CFC9'        // 青色
  }
  return colorMap[code] || '#409EFF'
}

// 初始化
onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped lang="scss">
.role-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 16px;
  
  .search-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-large);
    background: white;
    
    :deep(.el-card__body) {
      padding: 16px 20px;
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
      .role-count {
        font-size: 14px;
        color: var(--text-secondary);
        
        &:before {
          content: "📊 ";
          margin-right: 4px;
        }
      }
    }
    
    .actions-right {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .create-btn {
        background: linear-gradient(135deg, var(--ecommerce-primary), #ff8c5a);
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }
      }
    }
  }
  
  /* 表格单元格样式 */
  .role-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .role-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
      border-radius: 8px;
    }
    
    .role-details {
      .role-name {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        .name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .system-tag {
          font-size: 10px;
          padding: 0 4px;
          height: 16px;
          line-height: 16px;
        }
      }
      
      .role-code {
        font-size: 11px;
        color: var(--text-secondary);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }
  
  .description-cell {
    .description-text {
      font-size: 13px;
      color: var(--text-regular);
      line-height: 1.4;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .permission-count {
      .el-tag {
        font-size: 11px;
        padding: 0 6px;
        height: 20px;
      }
    }
  }
  
  .user-tags {
    .user-info {
      .user-avatars {
        display: flex;
        align-items: center;
        gap: -8px;
        margin-bottom: 4px;
        
        .user-avatar {
          border: 2px solid white;
          box-shadow: var(--shadow-light);
          transition: transform 0.2s;
          
          &:hover {
            transform: translateY(-2px);
          }
        }
        
        .more-tag {
          margin-left: 4px;
          font-size: 11px;
        }
      }
      
      .user-count {
        font-size: 12px;
        color: var(--text-secondary);
        
        .count-text {
          display: inline-block;
          padding: 2px 6px;
          background: #f5f7fa;
          border-radius: 4px;
        }
      }
    }
    
    .no-users {
      font-size: 12px;
      color: var(--text-placeholder);
      font-style: italic;
    }
    
    .user-list {
      .user-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        
        .user-name {
          font-size: 13px;
          color: var(--text-regular);
        }
      }
    }
  }
  
  .time-info {
    font-size: 12px;
    
    .create-time {
      color: var(--text-regular);
      margin-bottom: 2px;
    }
    
    .update-time {
      color: var(--text-secondary);
    }
  }
  
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .el-button {
      padding: 4px 8px;
      font-size: 13px;
    }
    
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
@media screen and (max-width: 768px) {
  .table-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    
    .actions-left, .actions-right {
      width: 100%;
    }
    
    .actions-right {
      justify-content: space-between;
    }
  }
  
  .action-buttons {
    flex-wrap: wrap;
    gap: 2px;
  }
}

/* 动画效果 */
.el-button {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.el-switch {
  --el-switch-on-color: var(--ecommerce-primary);
}
</style>