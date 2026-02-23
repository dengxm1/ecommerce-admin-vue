<template>
  <div class="dashboard">
    <!-- 1. 欢迎标题区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>欢迎回来，{{ user.nickname || user.username }}！</h1>
        <p>当前系统：电商后台管理系统（权限管理核心版）</p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
      </div>
    </div>
    
    <!-- 2. 核心数据卡片 -->
    <div class="stats-cards">
      <el-card class="stats-card main-stats">
        <template #header>
          <div class="card-header">
            <h3>系统核心数据</h3>
            <el-tag size="small" type="info">实时更新</el-tag>
          </div>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">当前租户</div>
            <div class="stat-value">默认商户</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">总用户数</div>
            <div class="stat-value">{{ stats.userCount }} <span class="stat-unit">人</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">角色数量</div>
            <div class="stat-value">{{ stats.roleCount }} <span class="stat-unit">个</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">权限节点</div>
            <div class="stat-value">{{ stats.permissionCount }} <span class="stat-unit">个</span></div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card status-card">
        <template #header>
          <div class="card-header">
            <h3>权限控制状态</h3>
            <el-tag size="small" type="success">正常运行</el-tag>
          </div>
        </template>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-icon success">✓</div>
            <div class="status-info">
              <div class="status-name">动态路由</div>
              <div class="status-desc">已启用</div>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon success">✓</div>
            <div class="status-info">
              <div class="status-name">按钮级权限</div>
              <div class="status-desc">已实现</div>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon warning">⚡</div>
            <div class="status-info">
              <div class="status-name">租户隔离</div>
              <div class="status-desc">已预留</div>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon success">✓</div>
            <div class="status-info">
              <div class="status-name">数据权限</div>
              <div class="status-desc">已实现</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 3. RBAC权限模型架构（带功能列表） -->
    <el-card class="rbac-card">
      <template #header>
        <div class="card-header">
          <h3>RBAC权限模型架构</h3>
        </div>
      </template>
      
      <div class="model-container">
        <!-- 模型图示（三层结构） -->
        <div class="model-visualization">
          <!-- 用户层 -->
          <div class="model-layer">
            <div class="layer-header">
              <span class="layer-title">用户层</span>
              <el-tag size="small" round>{{ stats.userCount }}</el-tag>
            </div>
            <div class="layer-content">
              <div class="layer-icon">👥</div>
              <div class="layer-desc">系统用户</div>
              <ul class="layer-features">
                <li>新增用户</li>
                <li>编辑用户</li>
                <li>批量删除</li>
                <li>导出数据</li>
                <li>分配角色</li>
                <li>查看权限</li>
                <li>启用/禁用</li>
                <li>重置密码</li>
                <li>图片上传</li>
              </ul>
            </div>
          </div>
          
          <div class="model-arrow">↓</div>
          
          <!-- 角色层 -->
          <div class="model-layer">
            <div class="layer-header">
              <span class="layer-title">角色层</span>
              <el-tag size="small" round>{{ stats.roleCount }}</el-tag>
            </div>
            <div class="layer-content">
              <div class="layer-icon">🎭</div>
              <div class="layer-desc">权限集合</div>
              <ul class="layer-features">
                <li>新建角色</li>
                <li>编辑角色</li>
                <li>分配权限</li>
                <li>查看用户</li>
                <li>删除角色</li>
              </ul>
            </div>
          </div>
          
          <div class="model-arrow">↓</div>
          
          <!-- 权限层 -->
          <div class="model-layer">
            <div class="layer-header">
              <span class="layer-title">权限层</span>
              <el-tag size="small" round>{{ stats.permissionCount }}</el-tag>
            </div>
            <div class="layer-content">
              <div class="layer-icon">🔐</div>
              <div class="layer-desc">菜单/按钮</div>
              <ul class="layer-features">
                <li>查看权限树</li>
                <li>统计信息</li>
                <li>权限详情</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 权限生效流程说明 -->
        <div class="process-section">
          <h4>权限生效流程</h4>
          <el-steps :active="5" finish-status="success" simple class="process-steps">
            <el-step title="用户登录" icon="User"></el-step>
            <el-step title="查询角色" icon="Lock"></el-step>
            <el-step title="获取权限" icon="Key"></el-step>
            <el-step title="动态路由" icon="Menu"></el-step>
            <el-step title="按钮控制" icon="SwitchButton"></el-step>
          </el-steps>
          
          <div class="process-detail">
            <div class="process-item">
              <span class="process-number">1</span>
              <span class="process-text">用户登录 → 根据用户ID查询关联角色</span>
            </div>
            <div class="process-item">
              <span class="process-number">2</span>
              <span class="process-text">根据角色ID查询关联菜单权限</span>
            </div>
            <div class="process-item">
              <span class="process-number">3</span>
              <span class="process-text">后端返回权限树 → 前端动态注册路由</span>
            </div>
            <div class="process-item">
              <span class="process-number">4</span>
              <span class="process-text">侧边栏根据权限动态渲染</span>
            </div>
            <div class="process-item">
              <span class="process-number">5</span>
              <span class="process-text">通过自定义指令控制按钮显示/隐藏</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 4. 技术栈卡片 -->
    <el-card class="tech-card">
      <template #header>
        <div class="card-header">
          <h3>技术架构</h3>
          <el-tag size="small" type="success">v1.0.0</el-tag>
        </div>
      </template>
      
      <div class="tech-cloud">
        <div class="tech-item" v-for="tech in techStack" :key="tech.name">
          <el-tooltip :content="tech.desc" placement="top">
            <div class="tech-badge">
              <span class="tech-icon">{{ tech.icon }}</span>
              <span class="tech-name">{{ tech.name }}</span>
            </div>
          </el-tooltip>
        </div>
      </div>
    </el-card>
    
    <!-- 5. 系统功能卡片（个人中心、消息中心、系统公告） -->
  <el-card class="system-card">
    <template #header>
      <div class="card-header">
        <h3>账户与通知</h3>
        <el-tag size="small" type="warning">个人中心 · 消息 · 公告</el-tag>
      </div>
    </template>
    <div class="system-grid">
      <div class="system-item">
        <div class="system-icon">👤</div>
        <div class="system-info">
          <div class="system-name">个人中心</div>
          <div class="system-desc">编辑资料、修改头像、修改密码、绑定手机</div>
        </div>
      </div>
      <div class="system-item">
        <div class="system-icon">💬</div>
        <div class="system-info">
          <div class="system-name">消息中心</div>
          <div class="system-desc">在线人数、查看通知、标记已读、删除消息</div>
        </div>
      </div>
      <div class="system-item">
        <div class="system-icon">📢</div>
        <div class="system-info">
          <div class="system-name">系统公告</div>
          <div class="system-desc">管理员发送公告、查看历史公告</div>
        </div>
      </div>
    </div>
  </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref, computed } from 'vue'

const userStore = useUserStore()

const user = computed(() => userStore.userInfo)
const stats = computed(() => {
  const statsData = userStore.dashboardStats
  return {
    userCount: statsData?.userCount ?? 0,
    roleCount: statsData?.roleCount ?? 0,
    permissionCount: statsData?.permissionCount ?? 0
  }
})

watch(()=> userStore.dashboardStats,(newVal) =>{
  if(!newVal){
    userStore.getDashboardStats()
  }
},{
  immediate: true
})

// 技术栈数据
const techStack = ref([
  { name: 'Vue 3', icon: '🟢', desc: '渐进式JavaScript框架' },
  { name: 'TypeScript', icon: '🔷', desc: '类型安全的JavaScript' },
  { name: 'Element Plus', icon: '🎨', desc: 'Vue 3组件库' },
  { name: 'Pinia', icon: '🍍', desc: '状态管理' },
  { name: 'RBAC', icon: '🔒', desc: '权限控制模型' },
  { name: '动态路由', icon: '🔄', desc: '权限动态加载' },
  { name: '多租户', icon: '🏢', desc: '租户隔离支持' },
  { name: 'Vite', icon: '⚡', desc: '构建工具' }
])

// 获取真实数据
onMounted(async () => {
    console.log('数据看板数据看板')
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 欢迎区域 - 重新设计 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  
  .welcome-content {
    position: relative;
    z-index: 2;
    
    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: white;
    }
    
    p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .welcome-decoration {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      
      &:nth-child(1) {
        width: 200px;
        height: 200px;
        top: -50px;
        right: -50px;
      }
      
      &:nth-child(2) {
        width: 150px;
        height: 150px;
        bottom: -30px;
        right: 100px;
      }
      
      &:nth-child(3) {
        width: 100px;
        height: 100px;
        bottom: 20px;
        right: 200px;
      }
    }
  }
}

/* 卡片通用样式 */
.el-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
  
  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 18px;
          background: #667eea;
          border-radius: 2px;
          margin-right: 12px;
        }
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

/* 核心数据卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  .stats-card {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      
      .stat-item {
        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.2;
          
          .stat-unit {
            font-size: 14px;
            font-weight: normal;
            color: #7f8c8d;
            margin-left: 4px;
          }
        }
      }
    }
    
    &.main-stats .stat-item:first-child .stat-value {
      font-size: 20px;
      color: #667eea;
    }
  }
  
  .status-card {
    .status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      
      .status-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 12px;
        
        .status-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 18px;
          
          &.success {
            background: rgba(103, 194, 58, 0.1);
            color: #67c23a;
          }
          
          &.warning {
            background: rgba(230, 162, 60, 0.1);
            color: #e6a23c;
          }
        }
        
        .status-info {
          .status-name {
            font-size: 14px;
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 4px;
          }
          
          .status-desc {
            font-size: 12px;
            color: #7f8c8d;
          }
        }
      }
    }
  }
}

/* RBAC模型卡片 */
.rbac-card {
  .model-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .model-visualization {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    border-radius: 16px;
    
    .model-layer {
      flex: 1;
      text-align: center;
      
      .layer-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
        
        .layer-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
      
      .layer-content {
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        
        .layer-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .layer-desc {
          font-size: 13px;
          color: #7f8c8d;
        }
      }
    }
    
    .model-arrow {
      font-size: 24px;
      color: #667eea;
      margin: 0 16px;
      font-weight: 600;
    }
  }
  
  .process-section {
    h4 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .process-steps {
      margin-bottom: 24px;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
    }
    
    .process-detail {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      
      .process-item {
        flex: 1 1 calc(50% - 6px);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 10px;
        
        .process-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          color: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .process-text {
          font-size: 13px;
          color: #2c3e50;
          line-height: 1.4;
        }
      }
    }
  }
}

/* 技术栈卡片 */
.tech-card {
  .tech-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .tech-item {
      .tech-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 30px;
        color: white;
        font-size: 14px;
        cursor: default;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }
        
        .tech-icon {
          font-size: 18px;
        }
        
        .tech-name {
          font-weight: 500;
        }
      }
    }
  }
}

/* 系统功能卡片样式 */
.system-card {
  .system-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    
    .system-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      
      .system-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 10px;
        font-size: 20px;
      }
      
      .system-info {
        .system-name {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        .system-desc {
          font-size: 12px;
          color: #7f8c8d;
        }
      }
    }
  }
}

/* 功能列表样式 */
.layer-features {
  margin-top: 12px;
  padding-left: 0;
  list-style: none;
  text-align: left;
  font-size: 12px;
  color: #5a6a7a;
  li {
    padding: 4px 0;
    border-bottom: 1px dashed #e0e4e8;
    &:last-child {
      border-bottom: none;
    }
    &::before {
      content: "•";
      color: #667eea;
      font-weight: bold;
      margin-right: 8px;
    }
  }
}

/* 响应式调整 */
@media screen and (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .model-visualization {
    flex-direction: column;
    gap: 16px;
    
    .model-arrow {
      transform: rotate(90deg);
    }
  }
  
  .process-detail {
    .process-item {
      flex: 1 1 100%;
    }
  }
}

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
  
  .status-grid {
    grid-template-columns: 1fr !important;
  }
  
  .system-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>