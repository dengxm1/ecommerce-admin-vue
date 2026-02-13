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
       <ProTable 
          :data="tableData" 
          :columns="columns"
          showAction
          stripe
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          actionWidth="240"
          :loading="loading"
          @paginationChange="paginationChange"
          >
            <template #table-header>
                <div class="table-actions">
                    <div class="actions-left">
                      <span class="role-count" v-if="pagination.total > 0">
                        共 {{ pagination.total }} 个角色
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
            </template>
            <template #name="{row}">
               <div class="menu-name">
                  <span class="name"  :style="{'color': row.isSystem == 1?'#e6a23c':'inherit'}">{{ row.name }}</span>
                  <el-tag 
                    v-if="row.isSystem == 1"
                    type="warning"
                    size="small"
                    effect="plain"
                    class="type-tag"
                  >
                    系统
                  </el-tag>
                </div>
            </template>
            <!-- 关联用户 -->
            <template #users="{row}">
               <el-button 
                  v-if="row.userCount > 0"
                  type="primary" 
                  size="small"
                  link
                  @click="viewLinkUsers(row)"
                >
                  查看
                </el-button>
                <span v-else class="no-users">
                  暂无用户
                </span>
            </template>
            
            <!-- 创建时间 -->
            <template #createdAt="{row}">
                <div>
                    {{ formatTime(row.createdAt) }}
              </div>
            </template>
            
            <!-- 操作列 -->
            <template #action="{row}">
                 <div class="action-buttons">
                   <el-button 
                      type="primary" 
                      :icon="Lock" 
                      size="small"
                      link
                      @click="handleAssignPermission(row)"
                      :disabled="row.isSystem==1 && row.code == 'TENANT_SUPER_ADMIN'"
                    >
                      分配权限
                    </el-button>
                  
                   <el-button 
                      type="success" 
                      :icon="Edit" 
                      size="small"
                      link
                      @click="handleEdit(row)"
                      :disabled="row.isSystem==1 && row.code == 'TENANT_SUPER_ADMIN'"
                    >
                      编辑
                    </el-button>
                  
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
                          :disabled="row.isSystem==1"
                          class="delete-item"
                        >
                          <span :style="{ color: row.isSystem==1? '#909399' : 'var(--danger-color)' }">
                            删除
                          </span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
              </div>
            </template>
        </ProTable>


    <!-- 新建/编辑角色对话框 -->
    <RoleFormDialog
      v-model="dialog.visible"
      :type="dialog.type"
      :data="dialog.roleData"
      @success="handleDialogSuccess"
    />

    <!-- 权限分配对话框 -->
     <PermissionDrawer 
        v-model="permissionDrawer.visible" 
        :type="permissionDrawer.type"
        :roleId="permissionDrawer.roleId"
        @confirm="handleDialogSuccess"
      />
    <!-- 关联用户对话框 -->
    <LinkUserDialog
      v-model="linkUserDialog.visible"
      :roleId="linkUserDialog.roleId" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {getRoleListApi,deleteRoleApi} from '@/api/role'
import RoleFormDialog from './components/RoleFormDialog.vue'
import PermissionDrawer from '../components/PermissionDrawer/PermissionDrawer.vue'
import LinkUserDialog from './components/LinkUserDialog.vue'

// 图标
import {
  Plus,
  Search,
  Refresh,
  RefreshRight,
  Edit,
  Lock,
  More,
  Document,
  Delete,
  User,
  Setting,
  Star,
  Tools,
  Goods,
  Coin,
  Tickets,
  DataAnalysis,
  Present
} from '@element-plus/icons-vue'
import { type TableColumn } from '@/components/ProTable/ProTable.vue'


const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

const searchFormList = ref([
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'角色名称/编码',
    clearable: true,
    style:'width: 200px',
    keyDown: () => {
      fetchRoleList()
    },
    clear: () => {
      fetchRoleList()
    }
  }
])

const searchFormRef = ref()

// 表格数据
const tableData = ref<any[]>([])

const columns = ref<TableColumn[]>([
  {
    prop: 'name',
    label: '角色名称',
    slot:'name',
  },
   {
    prop: 'code',
    label: '角色编码',
    width: 250
  },
  {
    prop: 'description',
    label: '描述',
    width: 250
  },
  {
    prop: 'users',
    label: '用户',
    slot:'users',
    // width: 120
  },
  {
    prop: 'permissionCount',
    label: '权限',
    sortable: true,
    width: 100,
    columnFormatter:(row) => {
      return row.buttonPermissionCount + row.menuPermissionCount
    }
  },
  // {
  //     prop: 'status',
  //     label:'状态',
  //     tags: true,
  //     width: 80,
  //     tagFormatter:(row,type) => {
  //       if(type == 'text'){
  //           return row.status ==1 ? '启用' : '禁用'
  //       }else{
  //         return row.status ==1 ? 'success' : 'danger'
  //       }
        
  //     }
  // },
  {
    prop: 'createdAt',
    label: '创建时间',
    slot: 'createdAt',
  }
])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})


// 对话框状态
const dialog = reactive({
  visible: false,
  type: 'create' as 'create' | 'edit',
  roleData: null as any
})

const permissionDrawer = reactive({
  visible: false,
  type:'view' as 'edit' | 'view',
  roleId: null as number | null
})

// 关联用户对话框状态
const linkUserDialog = reactive({
  visible: false,
  roleId: null as number | null
})

// 查看角色关联的用户
const viewLinkUsers = (row: any) => {
  linkUserDialog.roleId = row.id;
  linkUserDialog.visible = true;
}

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchRoleList()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchRoleList()
}

// 当前页或每页显示条目数变化时触发
const paginationChange = () => {
  fetchRoleList()
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try{
    let params = Object.assign({
      pageNum: pagination.current,
      pageSize: pagination.size
    }, searchForm)
    const res =  await getRoleListApi(params);
    tableData.value = res.data.list || [];
    pagination.total = res.data.total;
  }catch(error){
    ElMessage.error('获取用户列表失败')
    console.error(error)
  }finally{
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
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
  permissionDrawer.visible = true;
  permissionDrawer.type = 'edit';
  permissionDrawer.roleId = row.id;
}


const handleMoreCommand = (command: string, row: any) => {
  switch (command) {
    case 'permissionDetail':
      viewPermissionDetail(row)
      break
    case 'delete':
      deleteSingleRole(row)
      break
  }
}

// 查看权限详情
const viewPermissionDetail = (row: any) => {
   permissionDrawer.visible = true;
    permissionDrawer.type = 'view';
    permissionDrawer.roleId = row.id;
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
    await deleteRoleApi(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
    
  } catch (error) {
    // 用户取消
  }
}

const refreshTable = () => {
  fetchRoleList()
}

const handleDialogSuccess = () => {
  fetchRoleList()
}

const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
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
  
  .no-users {
      color: var(--text-placeholder);
      font-style: italic;
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
  
}

   .menu-name {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      flex-wrap: wrap;
      
      .name {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 14px;
      }
      
      .type-tag{
        font-size: 12px;
        padding: 0 4px;
        height: 18px;
        line-height: 18px;
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