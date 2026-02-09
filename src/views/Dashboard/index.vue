<template>
  <div class="dashboard">
    <!-- 1. 欢迎标题 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ user.nickname }}！</h1>
      <p>当前系统：电商后台管理系统（权限管理核心版）</p>
    </div>
    
    <!-- 2. 核心数据卡片 -->
    <div class="stats-cards">
      <el-card>
        <h3>系统核心数据</h3>
        <div class="stat-item">
          <span>当前租户</span>
          <strong>默认商户</strong>
        </div>
        <div class="stat-item">
          <span>总用户数</span>
          <strong>{{ stats.userCount }} 人</strong>
        </div>
        <div class="stat-item">
          <span>角色数量</span>
          <strong>{{ stats.roleCount }} 个</strong>
        </div>
        <div class="stat-item">
          <span>权限节点</span>
          <strong>{{ stats.menuCount }} 个</strong>
        </div>
      </el-card>
      
      <el-card>
        <h3>权限控制状态</h3>
        <div class="status-tag success">动态路由 √ 已启用</div>
        <div class="status-tag success">按钮级权限 √ 已实现</div>
        <div class="status-tag success">租户隔离 √ 已预留</div>
        <div class="status-tag success">数据权限 √ 已实现</div>
      </el-card>
    </div>
    
    <!-- 3. RBAC模型展示（重点！） -->
    <el-card class="rbac-model">
      <h3>RBAC权限模型架构</h3>
      <div class="model-diagram">
        <div class="model-level">
          <div class="level-title">用户 ({{ stats.userCount }})</div>
          <div class="level-items">
            <el-tag v-for="user in recentUsers" :key="user.id">
              {{ user.username }}
            </el-tag>
          </div>
        </div>
        
        <div class="model-arrow">↓ 分配角色</div>
        
        <div class="model-level">
          <div class="level-title">角色 ({{ stats.roleCount }})</div>
          <div class="level-items">
            <el-tag 
              v-for="role in roles" 
              :key="role.id"
              :type="role.code === 'TENANT_SUPER_ADMIN' ? 'danger' : ''"
            >
              {{ role.name }}
            </el-tag>
          </div>
        </div>
        
        <div class="model-arrow">↓ 授予权限</div>
        
        <div class="model-level">
          <div class="level-title">菜单/权限 ({{ stats.menuCount }})</div>
          <div class="level-items">
            <el-tag size="small" v-for="menu in topMenus" :key="menu.id">
              {{ menu.name }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <div class="process-description">
        <h4>权限生效流程：</h4>
        <ol>
          <li>用户登录 → 根据用户ID查询关联角色</li>
          <li>根据角色ID查询关联菜单权限</li>
          <li>后端返回权限树 → 前端动态注册路由</li>
          <li>侧边栏根据权限动态渲染</li>
          <li>按钮根据permission字段控制显示/隐藏</li>
        </ol>
      </div>
    </el-card>
    
    <!-- 4. 当前用户权限概览 -->
    <el-card v-if="currentUserPermissions">
      <h3>我的权限概览</h3>
      <div class="permission-summary">
        <p>所属角色：<el-tag v-for="role in userRoles" :key="role.id">{{ role.name }}</el-tag></p>
        <p>可访问模块：{{ currentUserPermissions.modules.join('、') }}</p>
        <p>可用操作：{{ currentUserPermissions.operations.length }} 个按钮级权限</p>
      </div>
    </el-card>
    
    <!-- 5. 技术栈展示（可选） -->
    <el-card class="tech-stack">
      <h3>技术架构</h3>
      <div class="tech-items">
        <el-tag type="info">Vue 3 + TypeScript</el-tag>
        <el-tag type="info">Element Plus</el-tag>
        <el-tag type="info">Pinia状态管理</el-tag>
        <el-tag type="info">RBAC权限模型</el-tag>
        <el-tag type="info">动态路由</el-tag>
        <el-tag type="info">多租户预留</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const user = computed(() => userStore.userInfo)
const stats = ref({
  userCount: 0,
  roleCount: 0,
  menuCount: 0
})

// 获取真实数据
// onMounted(async () => {
//   // 调用API获取统计数据
//   const res = await axios.get('/api/dashboard/stats')
//   stats.value = res.data
// })
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
  background: var(--bg-color);
  min-height: 100%;
  
  // 为所有卡片添加统一的样式
  .el-card {
    border: none;
    border-radius: 12px;
    box-shadow: var(--shadow-light);
    margin-bottom: 20px;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }
    
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      padding-bottom: 12px;
      border-bottom: 2px solid var(--ecommerce-primary);
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 16px;
        background: var(--ecommerce-primary);
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, var(--ecommerce-primary) 0%, #ff8c5a 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: var(--shadow-medium);
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: white;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

/* 核心数据卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  .el-card {
    padding: 24px;
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      span {
        color: var(--text-secondary);
        font-size: 14px;
      }
      
      strong {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
    
    .status-tag {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      margin: 6px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      
      &.success {
        background: rgba(103, 194, 58, 0.1);
        color: #67c23a;
        border: 1px solid rgba(103, 194, 58, 0.3);
      }
      
      &.info {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
        border: 1px solid rgba(64, 158, 255, 0.3);
      }
    }
  }
}

/* RBAC模型展示 */
.rbac-model {
  padding: 24px;
  
  .model-diagram {
    margin: 20px 0;
    padding: 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }
  
  .model-level {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .level-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      font-size: 15px;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background: var(--ecommerce-primary);
        border-radius: 50%;
        margin-right: 8px;
      }
    }
    
    .level-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .el-tag {
        padding: 8px 12px;
        font-size: 14px;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
  
  .model-arrow {
    text-align: center;
    margin: 12px 0;
    color: var(--ecommerce-secondary);
    font-weight: 500;
    font-size: 14px;
  }
  
  .process-description {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    
    h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
      color: var(--text-primary);
    }
    
    ol {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 10px;
        color: var(--text-regular);
        line-height: 1.6;
        padding-left: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &::marker {
          color: var(--ecommerce-primary);
          font-weight: 600;
        }
      }
    }
  }
}

/* 当前用户权限概览 */
.el-card:has(.permission-summary) {
  padding: 24px;
  
  .permission-summary {
    p {
      margin: 0 0 16px 0;
      color: var(--text-regular);
      font-size: 14px;
      line-height: 1.6;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-tag {
        margin: 0 4px;
        vertical-align: middle;
      }
    }
  }
}

/* 技术栈展示 */
.tech-stack {
  padding: 24px;
  
  .tech-items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .el-tag {
      padding: 8px 16px;
      font-size: 14px;
      border-radius: 6px;
      background: rgba(78, 205, 196, 0.1);
      border: 1px solid rgba(78, 205, 196, 0.3);
      color: var(--ecommerce-secondary);
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        background: rgba(78, 205, 196, 0.2);
      }
    }
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .welcome-section {
    padding: 24px;
    
    h1 {
      font-size: 22px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .tech-stack {
    .tech-items {
      justify-content: center;
    }
  }
}
</style>