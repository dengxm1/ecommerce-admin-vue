<template>
  <div class="menu-management">
      <!-- 菜单表格区域 -->
      <ProTable 
            :data="permissionStore.treeRoutes" 
            :columns="columns"
            rowId="id"
            defaultExpandAll
            stripe
        >
          <template #table-header>
              <div class="table-actions">
                <div class="actions-left">
                  <span class="menu-statistics">
                    统计信息
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
                </div>
              </div>
          </template>
          
              <!-- 是否可见 -->
              <template #isVisible="{row}">
              <el-tag 
                v-if="row.type !=3"
                :type="row.isVisible==1? 'success' : 'danger'"
                size="small"
                effect="light"
                class="type-tag"
              >
                {{ row.isVisible == 1 ? '可见' : '不可见' }}
              </el-tag>
          </template>
          
          <!-- 创建时间 -->
          <template #createdAt="{row}">
              {{ formatTime(row.createdAt) }}
          </template>
      </ProTable>
      <PermissionDrawer 
        v-model="permissionDrawer.visible" 
        :type="permissionDrawer.type"
        defaultExpandAll
      />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import {usePermissionStore} from '@/stores/permission'
import {Lock} from '@element-plus/icons-vue'
import { type TableColumn } from '@/components/ProTable/ProTable.vue'
import PermissionDrawer from '../components/PermissionDrawer/PermissionDrawer.vue'



const permissionStore = usePermissionStore();


const columns = ref<TableColumn[]>([
  {
    prop: 'name',
    label: '名称',
  },
    {
    prop: 'path',
    label: '路径',
  },
    {
    prop: 'component',
    label: '组件',
  },
  {
    prop: 'type',
    label: '类型',
    width: 80,
    tags: true,
    tagFormatter:(row,type) => {
      if(type == 'text'){
        return getTypeText(row.type);
      }else{
        return getTypeTagType(row.type)
      }
      
    }
  },
  {
    prop: 'permission',
    label: '权限标识',
  },
  {
    prop: 'isVisible',
    label: '可见性',
    slot:'isVisible'
  },
  {
    prop: 'sort',
    label: '排序',
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    slot: 'createdAt',
  }
])


// 统计信息
const menuStatistics = computed(() => {
  const stats = {
    directory: 0,
    menu: 0,
    button: 0,
  };
  
  const countTypes = (items: any[]) => {
    items.forEach(item => {
      if (item.type === 1) stats.directory += 1;
      else if (item.type === 2) stats.menu += 1;
      else if (item.type === 3) stats.button += 1;
      if (item.children && item.children.length > 0) {
        countTypes(item.children);
      }
    });
  };
  countTypes(permissionStore.treeRoutes);
  return stats;
});


const permissionDrawer = reactive({
  visible: false,
  type:'view' as 'edit' | 'view'
})


// 显示权限树
const showPermissionTree = () => {
  console.log('显示权限树显示权限树')
  permissionDrawer.visible = true;
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

const getTypeTagType = (type: number):  "success" | "danger" | "primary" | "warning" | "info" => {
  const types: Record<number, "success" | "danger" | "primary" | "warning" | "info"> = {
    1: "info",
    2: "primary",
    3: "warning"
  }
  return types[type as keyof typeof types] || 'info'
}


const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

</script>

<style scoped lang="scss">
.menu-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}


/* 表格区域 */
.table-section {
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


</style>