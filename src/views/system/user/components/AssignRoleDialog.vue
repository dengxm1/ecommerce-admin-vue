<template>
  <!-- 角色分配弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleDialogClose"
  >
    <!-- 用户信息展示 -->
    <div class="user-info-card" v-if="userData">
      <div class="user-avatar-info">
        <el-avatar 
          :size="48" 
          :src="userData.avatar"
          :style="{
            background: 'linear-gradient(135deg, var(--ecommerce-primary), var(--ecommerce-secondary))'
          }"
        >
          {{ userData.nickname?.charAt(0) || userData.username?.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="user-main">
            <span class="username">{{ userData.username }}</span>
            <el-tag 
              :type="userData.isEnabled ? 'success' : 'danger'" 
              size="small"
            >
              {{ userData.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </div>
          <div class="user-sub">
            <span class="nickname">{{ userData.nickname || '无昵称' }}</span>
            <el-divider direction="vertical" />
            <span class="email">{{ userData.email || '无邮箱' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 当前角色状态 -->
      <div class="current-roles" v-if="userCurrentRoles.length > 0">
        <div class="section-label">当前角色：</div>
        <div class="role-tags">
          <el-tag
            v-for="role in userCurrentRoles"
            :key="role.id"
            :type="getRoleType(role.code)"
            size="small"
            closable
            @close="removeRole(role.id)"
          >
            {{ role.name }}
            <el-icon class="tag-icon"><UserFilled /></el-icon>
          </el-tag>
        </div>
      </div>
      <div v-else class="no-roles">
        <el-text type="info">该用户尚未分配任何角色</el-text>
      </div>
    </div>

    <!-- 角色选择区域 -->
    <div class="role-selection-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><Select /></el-icon>
          <span>选择角色</span>
        </div>
        <div class="section-actions">
          <el-button 
            type="text" 
            size="small"
            @click="toggleSelectAll"
          >
            {{ isAllSelected ? '取消全选' : '全选' }}
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="toggleRoleFilter"
          >
            {{ showSystemRoles ? '仅显示可用角色' : '显示所有角色' }}
          </el-button>
        </div>
      </div>

      <!-- 角色搜索 -->
      <div class="role-search">
        <el-input
          v-model="roleKeyword"
          placeholder="搜索角色名称或编码"
          clearable
          :prefix-icon="Search"
          @input="filterRoles"
        />
      </div>

      <!-- 角色列表 -->
      <div class="role-list-container">
        <div 
          v-if="filteredRoles.length === 0"
          class="empty-roles"
        >
          <el-empty description="暂无可用角色" :image-size="80" />
        </div>
        
        <el-checkbox-group 
          v-model="selectedRoleIds"
          class="role-checkbox-group"
        >
          <div 
            v-for="role in filteredRoles"
            :key="role.id"
            class="role-item"
            :class="{ 'disabled-role': role.code === 'TENANT_SUPER_ADMIN' && !isCurrentUserSuperAdmin }"
          >
            <el-checkbox 
              :label="role.id"
              :disabled="role.code === 'TENANT_SUPER_ADMIN' && !isCurrentUserSuperAdmin"
            >
              <div class="role-item-content">
                <div class="role-main">
                  <div class="role-name-code">
                    <span class="role-name">{{ role.name }}</span>
                    <el-tag 
                      size="small" 
                      :type="getRoleType(role.code)"
                      effect="light"
                    >
                      {{ role.code }}
                    </el-tag>
                  </div>
                  <div class="role-description">
                    {{ role.description || '暂无描述' }}
                  </div>
                </div>
                <div class="role-stats">
                  <div class="stat-item">
                    <el-icon><Menu /></el-icon>
                    <span>{{ role.menuCount || 0 }} 菜单</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Operation /></el-icon>
                    <span>{{ role.buttonCount || 0 }} 按钮</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>{{ role.userCount || 0 }} 用户</span>
                  </div>
                </div>
                <div class="role-actions">
                  <el-button 
                    type="text" 
                    size="small"
                    @click.stop="previewRolePermissions(role)"
                  >
                    <el-icon><View /></el-icon>
                    预览权限
                  </el-button>
                </div>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </div>

    <!-- 权限预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      :title="`${previewRole?.name} - 权限预览`"
      width="700px"
      append-to-body
    >
      <div class="permission-preview">
        <div v-if="previewRole" class="preview-header">
          <el-tag :type="getRoleType(previewRole.code)">
            {{ previewRole.code }}
          </el-tag>
          <span class="preview-desc">{{ previewRole.description }}</span>
        </div>
        
        <el-tree
          ref="previewTreeRef"
          :data="permissionTree"
          :props="treeProps"
          :default-expand-all="true"
          :highlight-current="true"
          node-key="id"
          class="permission-tree"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <div class="node-content">
                <el-icon v-if="data.icon" :size="16" class="node-icon">
                  <component :is="data.icon" />
                </el-icon>
                <span class="node-label">{{ data.label }}</span>
                <span v-if="data.type === 3" class="permission-code">
                  {{ data.permission }}
                </span>
              </div>
              <div class="node-type">
                <el-tag 
                  v-if="data.type === 1" 
                  size="small" 
                  type="info"
                >目录</el-tag>
                <el-tag 
                  v-if="data.type === 2" 
                  size="small" 
                  type="primary"
                >菜单</el-tag>
                <el-tag 
                  v-if="data.type === 3" 
                  size="small" 
                  type="success"
                >按钮</el-tag>
              </div>
            </div>
          </template>
        </el-tree>
        
        <div class="preview-summary">
          <el-text type="info">
            共 {{ permissionTree.length }} 个权限节点
          </el-text>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-text type="info" v-if="selectedRoleIds.length > 0">
            已选择 {{ selectedRoleIds.length }} 个角色
          </el-text>
        </div>
        <div class="footer-right">
          <el-button @click="handleCancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="submitting"
            :disabled="!hasChanges"
          >
            确认分配
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import {
  Search,
  Select,
  UserFilled,
  Menu,
  Operation,
  User,
  View,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'

// API接口
// import { 
//   getRoleListApi, 
//   getUserRolesApi, 
//   assignUserRolesApi 
// } from '@/api/user'
// import { getRolePermissionsApi } from '@/api/role'

interface Role {
  id: number
  name: string
  code: string
  description?: string
  menuCount?: number
  buttonCount?: number
  userCount?: number
  isSystem?: boolean
  createdAt?: string
}

interface UserData {
  id: number
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  isEnabled: boolean
  tenantId?: number
}

interface PermissionNode {
  id: number
  label: string
  children?: PermissionNode[]
  icon?: string
  type?: number  // 1:目录 2:菜单 3:按钮
  permission?: string
}

const props = defineProps<{
  modelValue: boolean
  userData: UserData | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// 弹窗状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  return props.userData 
    ? `为 ${props.userData.username} 分配角色`
    : '分配角色'
})

// 数据状态
const allRoles = ref<Role[]>([
    {
        id: 1,
        name:'超级管理员',
        code:'super-code',
        description:'超级管理员'
    },
     {
        id: 2,
        name:'商品管理员',
        code:'2',
        description:'管理商品'
    },
        {
        id: 3,
        name:'仓库管理员',
        code:'3',
        description:'管理仓库'
    },
])
const filteredRoles = ref<Role[]>([])
const userCurrentRoles = ref<Role[]>([])
const selectedRoleIds = ref<number[]>([])
const originalRoleIds = ref<number[]>([])

// 搜索和筛选
const roleKeyword = ref('')
const showSystemRoles = ref(false)
const isCurrentUserSuperAdmin = ref(false) // 当前登录用户是否为超管

// 权限预览
const previewVisible = ref(false)
const previewRole = ref<Role | null>(null)
const permissionTree = ref<PermissionNode[]>([])
const previewTreeRef = ref<InstanceType<typeof ElTree>>()
const treeProps = {
  children: 'children',
  label: 'label'
}

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 计算属性
const isAllSelected = computed(() => {
  return selectedRoleIds.value.length === filteredRoles.value.length
})

const hasChanges = computed(() => {
  const currentIds = [...selectedRoleIds.value].sort()
  const originalIds = [...originalRoleIds.value].sort()
  return JSON.stringify(currentIds) !== JSON.stringify(originalIds)
})

// 获取角色类型
const getRoleType = (code: string) => {
  const typeMap: Record<string, string> = {
    'TENANT_SUPER_ADMIN': 'danger',
    'SYS_ADMIN': 'warning',
    'PRODUCT_MANAGER': 'success',
    'ORDER_MANAGER': 'primary',
    'FINANCE_MANAGER': 'info'
  }
  return typeMap[code] || 'info'
}

// 初始化数据
const initDialog = async () => {
  if (!props.userData) return
  
  loading.value = true
  try {
    // 并行获取所有角色和用户当前角色
    // const [rolesRes, userRolesRes] = await Promise.all([
    // //   getRoleListApi({ pageSize: 1000 }), // 获取所有角色
    // //   getUserRolesApi(props.userData.id)
    // ])
    
    // // 处理角色数据
    // allRoles.value = rolesRes.data?.list || []
    // userCurrentRoles.value = userRolesRes.data || []
    
    // // 设置选中的角色ID
    // selectedRoleIds.value = userCurrentRoles.value.map(role => role.id)
    // originalRoleIds.value = [...selectedRoleIds.value]
    
    // 初始筛选
    filterRoles()
    
  } catch (error) {
    console.error('初始化弹窗失败:', error)
    ElMessage.error('加载角色数据失败')
  } finally {
    loading.value = false
  }
}

// 筛选角色
const filterRoles = () => {
  let filtered = allRoles.value
  
  // 关键词筛选
  if (roleKeyword.value.trim()) {
    const keyword = roleKeyword.value.toLowerCase()
    filtered = filtered.filter(role => 
      role.name.toLowerCase().includes(keyword) ||
      role.code.toLowerCase().includes(keyword) ||
      role.description?.toLowerCase().includes(keyword)
    )
  }
  
  // 系统角色筛选
  if (!showSystemRoles.value) {
    filtered = filtered.filter(role => !role.isSystem)
  }
  
  filteredRoles.value = filtered
}

// 切换全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRoleIds.value = []
  } else {
    selectedRoleIds.value = filteredRoles.value
      .filter(role => !(role.code === 'TENANT_SUPER_ADMIN' && !isCurrentUserSuperAdmin.value))
      .map(role => role.id)
  }
}

// 切换角色筛选
const toggleRoleFilter = () => {
  showSystemRoles.value = !showSystemRoles.value
  filterRoles()
}

// 移除角色
const removeRole = (roleId: number) => {
  selectedRoleIds.value = selectedRoleIds.value.filter(id => id !== roleId)
}

// 预览角色权限
const previewRolePermissions = async (role: Role) => {
  previewRole.value = role
  previewVisible.value = true
  
  try {
    // const res = await getRolePermissionsApi(role.id)
    // // 转换数据为树形结构
    // permissionTree.value = transformPermissionsToTree(res.data || [])
    
    // await nextTick()
    // if (previewTreeRef.value) {
    //   // 展开所有节点
    //   const allKeys = getAllNodeKeys(permissionTree.value)
    //   previewTreeRef.value.setExpandedKeys(allKeys)
    // }
  } catch (error) {
    console.error('获取权限数据失败:', error)
    ElMessage.error('加载权限数据失败')
  }
}

// 权限数据转树形结构
const transformPermissionsToTree = (permissions: any[]): PermissionNode[] => {
  // 这里需要根据您的实际数据结构进行调整
  // 示例转换逻辑
  const menuMap = new Map()
  const tree: PermissionNode[] = []
  
  // 先添加一级菜单
  permissions.forEach(perm => {
    if (perm.parentId === 0) {
      const node: PermissionNode = {
        id: perm.id,
        label: perm.name,
        icon: perm.icon,
        type: perm.type,
        permission: perm.permission
      }
      if (perm.type === 1) { // 目录
        node.children = []
      }
      menuMap.set(perm.id, node)
      tree.push(node)
    }
  })
  
  // 添加子菜单
  permissions.forEach(perm => {
    if (perm.parentId !== 0 && menuMap.has(perm.parentId)) {
      const parent = menuMap.get(perm.parentId)
      if (parent?.children) {
        const node: PermissionNode = {
          id: perm.id,
          label: perm.name,
          icon: perm.icon,
          type: perm.type,
          permission: perm.permission
        }
        parent.children.push(node)
        menuMap.set(perm.id, node)
      }
    }
  })
  
  return tree
}

// 获取所有节点key
const getAllNodeKeys = (tree: PermissionNode[]): number[] => {
  const keys: number[] = []
  
  const traverse = (nodes: PermissionNode[]) => {
    nodes.forEach(node => {
      keys.push(node.id)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  
  traverse(tree)
  return keys
}

// 提交分配
const handleSubmit = async () => {
  if (!props.userData) return
  
  try {
    await ElMessageBox.confirm(
      `确定要为用户 "${props.userData.username}" 分配选中的 ${selectedRoleIds.value.length} 个角色吗？`,
      '确认分配',
      {
        confirmButtonText: '确定分配',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    
    submitting.value = true
    
    const submitData = {
      userId: props.userData.id,
      roleIds: selectedRoleIds.value
    }
    
    // const res = await assignUserRolesApi(submitData)
    
    // ElMessage.success(res.message || '角色分配成功')
    
    // 更新用户当前角色
    userCurrentRoles.value = allRoles.value.filter(role => 
      selectedRoleIds.value.includes(role.id)
    )
    originalRoleIds.value = [...selectedRoleIds.value]
    
    // 关闭弹窗并通知成功
    dialogVisible.value = false
    emit('success')
    
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('分配角色失败:', error)
      ElMessage.error('分配角色失败')
    }
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm(
      '您有未保存的更改，确定要取消吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }
    ).then(() => {
      dialogVisible.value = false
    }).catch(() => {
      // 用户选择继续编辑
    })
  } else {
    dialogVisible.value = false
  }
}

// 弹窗关闭处理
const handleDialogClose = () => {
  // 重置状态
  roleKeyword.value = ''
  showSystemRoles.value = false
  previewVisible.value = false
  previewRole.value = null
  permissionTree.value = []
}

// 监听弹窗显示
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.userData) {
    initDialog()
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.user-info-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-light);
  
  .user-avatar-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    
    .user-details {
      flex: 1;
      
      .user-main {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        .username {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .user-sub {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .current-roles {
    .section-label {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }
    
    .role-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .el-tag {
        .tag-icon {
          margin-left: 4px;
          font-size: 12px;
        }
      }
    }
  }
  
  .no-roles {
    padding: 12px;
    text-align: center;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }
}

.role-selection-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .section-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .role-search {
    margin-bottom: 16px;
  }
  
  .role-list-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    padding: 12px;
    
    .empty-roles {
      padding: 40px 0;
    }
    
    .role-checkbox-group {
      width: 100%;
    }
    
    .role-item {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      border: 1px solid var(--el-border-color-light);
      transition: all 0.3s ease;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &:hover {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
      
      &.disabled-role {
        opacity: 0.6;
        cursor: not-allowed;
        
        &:hover {
          border-color: var(--el-border-color-light);
          background: var(--el-fill-color-light);
        }
      }
      
      :deep(.el-checkbox) {
        width: 100%;
        
        .el-checkbox__label {
          width: 100%;
        }
      }
      
      .role-item-content {
        width: 100%;
        
        .role-main {
          margin-bottom: 8px;
          
          .role-name-code {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            
            .role-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }
          }
          
          .role-description {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }
        
        .role-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            
            .el-icon {
              font-size: 12px;
            }
          }
        }
        
        .role-actions {
          text-align: right;
        }
      }
    }
  }
}

.permission-preview {
  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .preview-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .permission-tree {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    padding: 12px;
    
    .tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 6px 0;
      
      .node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .node-icon {
          color: var(--el-text-color-secondary);
        }
        
        .node-label {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
        
        .permission-code {
          font-size: 12px;
          color: var(--el-color-success);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: var(--el-color-success-light-9);
          padding: 1px 4px;
          border-radius: 3px;
          margin-left: 8px;
        }
      }
      
      .node-type {
        margin-left: 12px;
      }
    }
  }
  
  .preview-summary {
    margin-top: 12px;
    text-align: right;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .footer-left {
    .el-text {
      font-size: 14px;
    }
  }
}
</style>