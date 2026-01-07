<template>
  <div class="menu-management">
    <!-- 搜索区域 -->
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

    <!-- 菜单表格区域 -->
    <div class="table-section">
      <el-card shadow="never">
        <!-- 表格操作栏 -->
        <div class="table-actions">
          <div class="actions-left">
            <span class="menu-statistics">
              共 {{ menuStatistics.total }} 个菜单项
              <el-tag size="small" type="info" class="stat-tag">
                目录: {{ menuStatistics.directory }}
              </el-tag>
              <el-tag size="small" type="primary" class="stat-tag">
                菜单: {{ menuStatistics.menu }}
              </el-tag>
              <el-tag size="small" type="warning" class="stat-tag">
                按钮: {{ menuStatistics.button }}
              </el-tag>
            </span>
          </div>
          <div class="actions-right">
            <!-- 查看权限树按钮 -->
            <el-button 
              type="info" 
              :icon="Lock"
              @click="showPermissionTree"
              class="permission-btn"
            >
              查看权限树
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
          stripe
          showAction
          >
            <!-- 菜单信息 -->
            <template #menuInfo="{row}">
                <div class="menu-info-cell">
                  <div class="menu-icon">
                    <el-icon :size="20" :color="getIconColor(row)">
                      <component :is="row.icon ? row.icon.replace('ep:', '') : getDefaultIcon(row.type)" />
                    </el-icon>
                  </div>
                  <div class="menu-details">
                    <div class="menu-name">
                      <span class="name">{{ row.name }}</span>
                      <el-tag 
                        v-if="row.type === 3"
                        type="warning"
                        size="small"
                        effect="plain"
                        class="type-tag"
                      >
                        按钮
                      </el-tag>
                      <el-tag 
                        v-if="!row.isVisible"
                        type="danger"
                        size="small"
                        effect="plain"
                        class="visibility-tag"
                      >
                        隐藏
                      </el-tag>
                    </div>
                    <div class="menu-path">
                      <span v-if="row.path" class="path">{{ row.path }}</span>
                      <span v-else class="no-path">-</span>
                    </div>
                  </div>
                </div>
            </template>
            
            <!-- 菜单类型 -->
            <template #type="{row}">
                <el-tag 
                  :type="getTypeTagType(row.type)"
                  size="small"
                  effect="light"
                  class="type-tag"
                >
                  {{ getTypeText(row.type) }}
                </el-tag>
            </template>
            
            <!-- 权限标识 -->
            <template #permission="{row}">
                <div class="permission-cell">
                  <div v-if="row.permission" class="permission-tag">
                    <el-tag
                      size="small"
                      type="info"
                      effect="plain"
                      class="permission-content"
                      @click="copyPermission(row.permission)"
                    >
                      {{ row.permission }}
                    </el-tag>
                    <el-tooltip content="点击复制" placement="top">
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </el-tooltip>
                  </div>
                  <span v-else class="no-permission">-</span>
                </div>
            </template>
            
            <!-- 是否可见 -->
            <template #isVisible="{row}">
                <el-switch
                  v-model="row.isVisible"
                  :active-value="1"
                  :inactive-value="0"
                  :loading="row.visibleLoading"
                  @change="(val) => toggleMenuVisibility(row, val)"
                  :disabled="row.type === 3 || row.isSystem"
                />
            </template>
            
            <!-- 排序 -->
            <template #sort="{row}">
                <div class="sort-cell">
                  <span class="sort-value">{{ row.sort }}</span>
                  <div class="sort-actions" v-if="!row.isSystem">
                    <el-button 
                      :icon="ArrowUp" 
                      size="small" 
                      circle
                      :disabled="row.sort <= 1"
                      @click="adjustSort(row, 'up')"
                    />
                    <el-button 
                      :icon="ArrowDown" 
                      size="small" 
                      circle
                      @click="adjustSort(row, 'down')"
                    />
                  </div>
                </div>
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
                  <!-- 只能修改图标和排序 -->
                  <el-tooltip content="修改图标" placement="top">
                    <el-button 
                      type="primary" 
                      :icon="Picture" 
                      size="small"
                      circle
                      @click="handleEditIcon(row)"
                      :disabled="row.isSystem"
                    />
                  </el-tooltip>
                  
                  <!-- 更多操作下拉菜单 -->
                  <el-dropdown 
                    @command="handleMoreCommand($event, row)"
                    trigger="click"
                    size="small"
                  >
                    <el-button 
                      type="info" 
                      :icon="More" 
                      size="small"
                      circle
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <!-- 只有非系统菜单且非按钮类型的菜单可以修改可见性 -->
                        <el-dropdown-item 
                          command="toggleVisible"
                          :disabled="row.type === 3 || row.isSystem"
                          :icon="View"
                        >
                          {{ row.isVisible === 1 ? '设为隐藏' : '设为显示' }}
                        </el-dropdown-item>
                        
                        <!-- 查看权限详情 -->
                        <el-dropdown-item 
                          command="viewPermissionDetail"
                          :icon="Lock"
                          :disabled="!row.permission"
                        >
                          权限详情
                        </el-dropdown-item>
                        
                        <!-- 查看使用角色 -->
                        <el-dropdown-item 
                          command="viewUsingRoles"
                          :icon="UserFilled"
                        >
                          使用角色 ({{ row.roleCount || 0 }})
                        </el-dropdown-item>
                        
                        <!-- 系统菜单提示 -->
                        <el-dropdown-item 
                          v-if="row.isSystem"
                          divided
                          disabled
                        >
                          <span class="system-menu-hint">
                            <el-icon><InfoFilled /></el-icon>
                            系统菜单，不可修改
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

    <!-- 修改图标对话框 -->
    <el-dialog
      v-model="iconDialog.visible"
      title="选择图标"
      width="500px"
    >
      <div class="icon-selector">
        <div class="icon-search">
          <el-input
            v-model="iconSearchText"
            placeholder="搜索图标名称"
            clearable
            prefix-icon="Search"
          />
        </div>
        <div class="icon-list">
          <div 
            v-for="icon in filteredIcons"
            :key="icon"
            :class="['icon-item', { selected: icon === selectedIcon }]"
            @click="selectedIcon = icon"
          >
            <el-icon :size="24">
              <component :is="icon" />
            </el-icon>
            <span class="icon-name">{{ icon }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="iconDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveIcon">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 图标
import {
  Search,
  Refresh,
  RefreshRight,
  Lock,
  More,
  Picture,
  View,
  UserFilled,
  CopyDocument,
  ArrowUp,
  ArrowDown,
  InfoFilled,
  Document,
  Menu as MenuIcon,
  Connection,
  Setting,
  Goods,
  SoldOut,
  OfficeBuilding,
  Promotion,
  UserFilled as UserFilledIcon,
  Money,
  DataAnalysis,
  Tools,
} from '@element-plus/icons-vue'
import { type TableColumn } from '@/components/ProTable/ProTable.vue'



// 图标库（Element Plus 图标）
const iconList = [
  'Home', 'Setting', 'User', 'Lock', 'Menu', 'Document', 'List', 'Grid',
  'Goods', 'SoldOut', 'OfficeBuilding', 'Promotion', 'Money', 'DataAnalysis',
  'Tools', 'CreditCard', 'Discount', 'Present', 'Box', 'Location', 'PieChart',
  'TrendCharts', 'BankCard', 'SortUp', 'List', 'Grid', 'Search', 'Plus',
  'Edit', 'Delete', 'Download', 'Upload', 'View', 'Hide', 'Sort', 'Filter',
  'Message', 'Iphone', 'Calendar', 'Timer', 'Warning', 'Success', 'Error',
  'InfoFilled', 'QuestionFilled', 'Star', 'Heart', 'Share', 'Collection',
  'ChatDotRound', 'ChatLineRound', 'ChatSquare', 'Phone', 'VideoCamera',
  'Camera', 'Picture', 'Folder', 'FolderOpened', 'FolderDelete', 'FolderChecked',
  'Files', 'CopyDocument', 'DocumentCopy', 'DocumentAdd', 'DocumentDelete',
  'DocumentChecked', 'Tickets', 'CollectionTag', 'Postcard', 'Notebook',
  'MagicStick', 'Monitor', 'Watch', 'Camera', 'Microphone', 'Headset',
  'Mouse', 'Cpu', 'Connection', 'SetUp', 'Operation', 'Open', 'TurnOff',
  'Refresh', 'RefreshRight', 'RefreshLeft', 'Finished', 'Sort', 'Rank',
  'Histogram', 'PieChart', 'DataLine', 'DataBoard', 'DataAnalysis'
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  isVisible: ''
})

const searchFormList = ref([
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'菜单名称/路径/权限标识',
    clearable: true,
    style:'width: 240px'
  },
  {
    type:'select',
    label:'类型',
    prop:'type',
    placeholder:'全部类型',
    clearable: true,
    style:'width: 100px',
    options:[
      {
        value: '1',
        label:'目录'
      },
      {
        value: '2',
        label:'菜单'
      },
      {
        value: '3',
        label:'按钮'
      }
    ]
  },
  {
    type:'select',
    label:'可见性',
    prop:'isVisible',
    placeholder:'全部状态',
    clearable: true,
    style:'width: 100px',
    options:[
      { value: '1', label: '显示' },
      { value: '0', label: '隐藏' }
    ]
  }
])

const searchFormRef = ref()

// 表格数据（模拟数据 - 基于您的数据库设计）
const tableData = ref<any[]>([
  {
    id: 1,
    name: '系统管理',
    type: 1,
    path: '/system',
    component: null,
    icon: 'ep:setting',
    sort: 1,
    permission: 'system:view',
    isVisible: 1,
    isSystem: true,
    roleCount: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 2,
    parentId: 1,
    name: '用户管理',
    type: 2,
    path: '/system/user',
    component: 'system/user/index',
    icon: 'ep:user',
    sort: 1,
    permission: 'system:user:view',
    isVisible: 1,
    isSystem: true,
    roleCount: 2,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 3,
    parentId: 1,
    name: '角色管理',
    type: 2,
    path: '/system/role',
    component: 'system/role/index',
    icon: 'ep:lock',
    sort: 2,
    permission: 'system:role:view',
    isVisible: 1,
    isSystem: true,
    roleCount: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 4,
    parentId: 1,
    name: '菜单管理',
    type: 2,
    path: '/system/menu',
    component: 'system/menu/index',
    icon: 'ep:menu',
    sort: 3,
    permission: 'system:menu:view',
    isVisible: 1,
    isSystem: true,
    roleCount: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 5,
    parentId: 2,
    name: '新增用户',
    type: 3,
    path: null,
    component: null,
    icon: 'ep:plus',
    sort: 1,
    permission: 'system:user:add',
    isVisible: 1,
    isSystem: true,
    roleCount: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 6,
    parentId: 2,
    name: '编辑用户',
    type: 3,
    path: null,
    component: null,
    icon: 'ep:edit',
    sort: 2,
    permission: 'system:user:edit',
    isVisible: 1,
    isSystem: true,
    roleCount: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  },
  {
    id: 7,
    name: '商品管理',
    type: 1,
    path: '/product',
    component: null,
    icon: 'ep:goods',
    sort: 2,
    permission: 'product:view',
    isVisible: 1,
    isSystem: false,
    roleCount: 3,
    createdAt: '2024-02-15 14:20:00',
    updatedAt: null
  },
  {
    id: 8,
    parentId: 7,
    name: '商品列表',
    type: 2,
    path: '/product/list',
    component: 'product/list/index',
    icon: 'ep:list',
    sort: 1,
    permission: 'product:list:view',
    isVisible: 1,
    isSystem: false,
    roleCount: 3,
    createdAt: '2024-02-15 14:20:00',
    updatedAt: null
  },
  {
    id: 9,
    name: '首页',
    type: 2,
    path: '/dashboard',
    component: 'dashboard/index',
    icon: 'ep:home',
    sort: 0,
    permission: null,
    isVisible: 1,
    isSystem: true,
    roleCount: 0,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: null
  }
])

const columns = ref<TableColumn[]>([
  {
    prop: 'name',
    label: '菜单信息',
    slot: 'menuInfo',
    minWidth: 250
  },
  {
    prop: 'type',
    label: '类型',
    slot: 'type',
    width: 80
  },
  {
    prop: 'permission',
    label: '权限标识',
    slot: 'permission',
    width: 180
  },
  {
    prop: 'isVisible',
    label: '可见性',
    slot: 'isVisible',
    width: 100
  },
  {
    prop: 'sort',
    label: '排序',
    slot: 'sort',
    width: 120
  },
  {
    prop: 'roleCount',
    label: '使用角色',
    width: 100,
    sortable: true
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
  total: 9
})

// 统计信息
const menuStatistics = reactive({
  total: 0,
  directory: 0,
  menu: 0,
  button: 0,
  visible: 0,
  hidden: 0
})

// 对话框状态
const iconDialog = reactive({
  visible: false,
  menuData: null as any
})

const permissionDialog = reactive({
  visible: false
})

// 图标选择相关
const iconSearchText = ref('')
const selectedIcon = ref('')
const filteredIcons = computed(() => {
  if (!iconSearchText.value) return iconList
  return iconList.filter(icon => 
    icon.toLowerCase().includes(iconSearchText.value.toLowerCase())
  )
})

// 权限树数据（实际应从后端获取）
const permissionTreeData = ref<any[]>([])

// 初始化统计信息
const updateStatistics = () => {
  const data = tableData.value
  menuStatistics.total = data.length
  menuStatistics.directory = data.filter(item => item.type === 1).length
  menuStatistics.menu = data.filter(item => item.type === 2).length
  menuStatistics.button = data.filter(item => item.type === 3).length
  menuStatistics.visible = data.filter(item => item.isVisible === 1).length
  menuStatistics.hidden = data.filter(item => item.isVisible === 0).length
}

// 方法
const handleSearch = () => {
  pagination.current = 1
  fetchMenuList()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1
  fetchMenuList()
}

const fetchMenuList = async () => {
  // 模拟API调用
  updateStatistics()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchMenuList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchMenuList()
}

const refreshTable = () => {
  fetchMenuList()
  ElMessage.success('刷新成功')
}

// 显示权限树
const showPermissionTree = async () => {
  // 实际应该调用API获取权限树数据
  permissionTreeData.value = generatePermissionTree()
  permissionDialog.visible = true
}

// 生成权限树（模拟）
const generatePermissionTree = () => {
  // 这里应该从后端获取完整的权限树结构
  return tableData.value.map(menu => ({
    id: menu.id,
    name: menu.name,
    type: menu.type,
    permission: menu.permission,
    path: menu.path,
    icon: menu.icon,
    roleCount: menu.roleCount,
    children: menu.type === 1 ? 
      tableData.value.filter(item => item.parentId === menu.id) : 
      []
  })).filter(item => !item.parentId)
}

// 修改图标
const handleEditIcon = (row: any) => {
  if (row.isSystem) {
    ElMessage.warning('系统菜单图标不能修改')
    return
  }
  
  iconDialog.menuData = row
  selectedIcon.value = row.icon ? row.icon.replace('ep:', '') : ''
  iconDialog.visible = true
}

// 保存图标
const saveIcon = () => {
  if (!selectedIcon.value) {
    ElMessage.warning('请选择图标')
    return
  }
  
  // 调用API更新图标
  const newIcon = `ep:${selectedIcon.value}`
  iconDialog.menuData.icon = newIcon
  
  ElMessage.success('图标修改成功')
  iconDialog.visible = false
}

// 切换菜单可见性
const toggleMenuVisibility = async (row: any, newVisible: any) => {
  if (row.type === 3) {
    ElMessage.warning('按钮权限没有可见性概念')
    row.isVisible = 1
    return
  }
  
  if (row.isSystem) {
    ElMessage.warning('系统菜单可见性不能修改')
    row.isVisible = 1
    return
  }
  
  try {
    row.visibleLoading = true
    
    const action = newVisible === 1 ? '显示' : '隐藏'
    
    // await ElMessageBox.confirm(
    //   `确定要${action}菜单 "${row.name}" 吗？${action === '隐藏' ? '隐藏后侧边栏将不显示此菜单。' : ''}`,
    //   `${action}确认`,
    //   {
    //     confirmButtonText: `确定${action}`,
    //     cancelButtonText: '取消'
    //   }
    // )
    
    // API调用
    // await updateMenuVisibility(row.id, newVisible)
    
    // ElMessage.success(`${action}成功`)
    updateStatistics()
    
  } catch (error) {
    // 用户取消，恢复原状态
    row.isVisible = newVisible === 1 ? 0 : 1
  } finally {
    row.visibleLoading = false
  }
}

// 调整排序
const adjustSort = async (row: any, direction: 'up' | 'down') => {
  if (row.isSystem) {
    ElMessage.warning('系统菜单排序不能修改')
    return
  }
  
  const newSort = direction === 'up' ? row.sort - 1 : row.sort + 1
  
  // 检查边界
  if (newSort < 0) {
    ElMessage.warning('已经是第一个了')
    return
  }
  
  // 调用API更新排序
  try {
    // await updateMenuSort(row.id, newSort)
    row.sort = newSort
    ElMessage.success('排序调整成功')
    
    // 重新获取列表以刷新排序
    fetchMenuList()
  } catch (error) {
    ElMessage.error('排序调整失败')
  }
}

// 复制权限标识
const copyPermission = async (permission: string) => {
  try {
    await navigator.clipboard.writeText(permission)
    ElMessage.success('权限标识已复制')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 更多操作
const handleMoreCommand = (command: string, row: any) => {
  switch (command) {
    case 'toggleVisible':
      toggleMenuVisibility(row, row.isVisible === 1 ? 0 : 1)
      break
    case 'viewPermissionDetail':
      viewPermissionDetail(row)
      break
    case 'viewUsingRoles':
      viewUsingRoles(row)
      break
  }
}

const viewPermissionDetail = (row: any) => {
  if (!row.permission) {
    ElMessage.warning('此菜单项没有权限标识')
    return
  }
  
  ElMessageBox.alert(
    `<div style="font-size: 14px;">
      <p><strong>权限标识:</strong> <code>${row.permission}</code></p>
      <p><strong>菜单名称:</strong> ${row.name}</p>
      <p><strong>菜单类型:</strong> ${getTypeText(row.type)}</p>
      <p><strong>使用角色数:</strong> ${row.roleCount || 0}</p>
      <p><strong>前端路径:</strong> ${row.path || '-'}</p>
    </div>`,
    '权限详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

const viewUsingRoles = (row: any) => {
  ElMessage.info(`查看菜单 "${row.name}" 的使用角色列表`)
  // 实际项目中可以打开一个对话框展示使用此菜单的角色列表
}

// 辅助函数
const getTypeText = (type: number): string => {
  const types = {
    1: '目录',
    2: '菜单',
    3: '按钮'
  }
  return types[type as keyof typeof types] || '未知'
}

const getTypeTagType = (type: number): string => {
  const types = {
    1: 'info',
    2: 'primary',
    3: 'warning'
  }
  return types[type as keyof typeof types] || 'info'
}

const getDefaultIcon = (type: number): string => {
  const icons = {
    1: 'Document',
    2: 'Menu',
    3: 'Connection'
  }
  return icons[type as keyof typeof types] || 'Document'
}

const getIconColor = (row: any): string => {
  if (row.type === 1) return '#409EFF'   // 目录 - 蓝色
  if (row.type === 2) return '#67C23A'   // 菜单 - 绿色
  if (row.type === 3) return '#E6A23C'   // 按钮 - 黄色
  return '#909399'
}

const formatTime = (time: string, format: string = 'MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

// 初始化
onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped lang="scss">
.menu-management {
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
      .menu-statistics {
        font-size: 14px;
        color: var(--text-secondary);
        
        .stat-tag {
          margin-left: 8px;
          font-size: 11px;
        }
      }
    }
    
    .actions-right {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .permission-btn {
        background: linear-gradient(135deg, #9B39F4, #BA68C8);
        border: none;
        color: white;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(155, 57, 244, 0.3);
        }
      }
    }
  }
  
  /* 表格单元格样式 */
  .menu-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .menu-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
      border-radius: 6px;
    }
    
    .menu-details {
      .menu-name {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        
        .name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .type-tag, .visibility-tag {
          font-size: 10px;
          padding: 0 4px;
          height: 16px;
          line-height: 16px;
        }
      }
      
      .menu-path {
        .path {
          font-size: 11px;
          color: var(--text-secondary);
          font-family: 'Monaco', 'Menlo', monospace;
          background: #f5f7fa;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .no-path {
          font-size: 11px;
          color: var(--text-placeholder);
          font-style: italic;
        }
      }
    }
  }
  
  .permission-cell {
    .permission-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      
      .permission-content {
        flex: 1;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #e8f4ff;
          transform: translateY(-1px);
        }
      }
      
      .copy-icon {
        color: var(--text-secondary);
        font-size: 12px;
        cursor: pointer;
        
        &:hover {
          color: var(--primary-color);
        }
      }
    }
    
    .no-permission {
      font-size: 12px;
      color: var(--text-placeholder);
      font-style: italic;
    }
  }
  
  .sort-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .sort-value {
      font-weight: 500;
      color: var(--text-primary);
      min-width: 30px;
      text-align: center;
    }
    
    .sort-actions {
      display: flex;
      gap: 4px;
      
      .el-button {
        width: 24px;
        height: 24px;
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
      padding: 4px;
    }
    
    .system-menu-hint {
      color: var(--text-secondary);
      font-size: 12px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  /* 分页 */
  .pagination-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
  }
}

/* 图标选择器 */
.icon-selector {
  height: 400px;
  display: flex;
  flex-direction: column;
  
  .icon-search {
    margin-bottom: 16px;
  }
  
  .icon-list {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-medium);
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: var(--primary-color);
        background: #f0f9ff;
      }
      
      &.selected {
        border-color: var(--primary-color);
        background: #ecf5ff;
        color: var(--primary-color);
      }
      
      .icon-name {
        margin-top: 8px;
        font-size: 10px;
        color: var(--text-secondary);
        text-align: center;
        word-break: break-all;
      }
    }
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
  
  .icon-list {
    grid-template-columns: repeat(4, 1fr) !important;
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

.icon-item {
  transition: all 0.2s ease;
}
</style>