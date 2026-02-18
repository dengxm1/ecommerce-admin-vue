<template>
    <el-header class="header-container">
        <view class="header-wrapper">
        <!-- 左侧：面包屑和页面标题 -->
       <div class="header-left">
        <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item 
                v-for="(item, index) in breadcrumbs" 
                :key="index"
            >
            <el-icon v-if="index === 0 && item.icon">
                <component :is="getIconComponent(item.icon)" />
            </el-icon>
            {{ item.title }}
            </el-breadcrumb-item>
        </el-breadcrumb>
    </div>
        <!-- 右侧：工具和用户 -->
        <div class="header-right">
            <!-- 消息通知 -->
            <NotificationCenter />
            
            <!-- 全屏切换 -->
            <div class="tool-item" @click="toggleFullscreen">
                <el-icon :size="20"><FullScreen /></el-icon>
            </div>
            
            <!-- 主题切换 -->
            <div class="tool-item" @click="toggleTheme">
                <el-icon :size="20"><Moon /></el-icon>
            </div>
            
            <!-- 用户信息 -->
            <el-dropdown trigger="click" class="user-dropdown">
                <div class="user-avatar">
                    <el-avatar :size="36" :src="userAvatar" />
                    <div class="user-info">
                        <span class="username">{{ userInfo.nickname|| userInfo.username }}</span>
                        <el-icon><ArrowDown /></el-icon>
                    </div>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="goToProfile">
                            <el-icon><User /></el-icon>
                            个人中心
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="logout">
                            <el-icon><SwitchButton /></el-icon>
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        </view>
        <Tabs/>
    </el-header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission'; 
// Element Plus 图标
import {
    FullScreen,
    Moon,
    ArrowDown,
    User,
    SwitchButton,
} from '@element-plus/icons-vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import NotificationCenter from '@/components/NotificationCenter/index.vue'

const route = useRoute();
const router = useRouter();
const userAvatar = computed(() =>{
    return userStore.userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo)

const permissionStore = usePermissionStore()

const getIconComponent = (iconName?: string) => {
    const defaultIcon = 'Goods'
    if (!iconName) {
        return ElementPlusIconsVue[defaultIcon]
    }
    return ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue] || ElementPlusIconsVue[defaultIcon]
}

// 面包屑
const breadcrumbs = computed(() => {
  const breadcrumbItems: { title: string; path: string; icon?: string }[] = [];
  const currentPath = route.path;
  
  // 递归查找当前路径的父级链
  const findPathChain = (routes: any[], parentChain: any[] = []): any[] | null => {
    for (const item of routes) {

      // 如果当前项匹配路径
      if (item.path === currentPath) {
        // 返回父级链 + 当前项
        return [...parentChain, item];
      }
      
      // 如果有子路由，递归查找
      if (item.children && item.children.length > 0) {
        const result = findPathChain(item.children, [...parentChain, item]);
        if (result) return result;
      }
    }
    return null;
  };

  // 获取从根到当前页面的所有路由项
  const pathChain = findPathChain(permissionStore.sidebarRoutes, []);
  
  if (pathChain && pathChain.length > 0) {
    pathChain.forEach((item, index) => {
      // 如果是父节点（不是最后一个）或者是最后一个（当前页）
      if (index < pathChain.length - 1 || index === pathChain.length - 1) {
        breadcrumbItems.push({
          title: item.meta.title,
          path: item.path,
          icon: index === 0 ? item.meta.icon : undefined
        });
      }
    });
  }
  
  return breadcrumbItems;
});

// 新增：路由跳转方法
const goToProfile = () => {
  router.push({ path: '/profile' })
}

// 退出登录
const logout = () => {
    userStore.logout()
}

const toggleFullscreen = () => {
    console.log('切换全屏');
};

const toggleTheme = () => {
    console.log('切换主题');
};
</script>

<style scoped lang="scss">
.header-container {
    height: auto !important; /* 改为自适应高度 */
    padding: 0 !important; /* 移除内边距 */
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, 
            var(--ecommerce-primary) 0%, 
            var(--ecommerce-secondary) 50%, 
            var(--ecommerce-accent) 100%);
    }
}
.header-wrapper{
    height: 60px;
    background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: relative;
    z-index: 10;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, 
            var(--ecommerce-primary) 0%, 
            var(--ecommerce-secondary) 50%, 
            var(--ecommerce-accent) 100%);
    }  
}
.header-left {
    display: flex;
    flex-direction: column;
    min-width: 300px;
    
    .page-title {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        
        .title-icon {
            color: var(--ecommerce-primary);
            margin-right: 8px;
            font-size: 20px;
        }
        
        h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            background: linear-gradient(90deg, var(--text-primary), var(--ecommerce-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    }
    
   .breadcrumb {
        :deep(.el-breadcrumb__item) {
            .el-breadcrumb__inner {
                display: flex;
                align-items: center;
                
                .el-icon {
                    margin-right: 4px;
                }
            }
            
            &:last-child {
                .el-breadcrumb__inner {
                    color: var(--ecommerce-primary);
                    font-weight: 500;
                }
            }
        }
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .header-tool {
        .tool-item {
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.3s ease;
            color: var(--text-regular);
            
            &:hover {
                background: var(--bg-color);
                color: var(--ecommerce-primary);
            }
        }
        
        :deep(.el-dropdown-menu) {
            margin-top: 8px;
            
            .notification-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                min-width: 280px;
                padding: 8px 0;
                
                .el-icon {
                    margin-top: 2px;
                }
                
                .notification-title {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .notification-desc {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-top: 2px;
                }
            }
        }
    }
    
    .user-dropdown {
        .user-avatar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 4px 8px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            
            &:hover {
                background: var(--bg-color);
                border-color: var(--border-color);
                
                .user-info .username {
                    color: var(--ecommerce-primary);
                }
            }
            
            .user-info {
                display: flex;
                align-items: center;
                gap: 4px;
                
                .username {
                    font-weight: 500;
                    color: var(--text-primary);
                    transition: color 0.3s ease;
                }
                
                .el-icon {
                    color: var(--text-secondary);
                    font-size: 12px;
                }
            }
        }
        
        :deep(.el-dropdown-menu) {
            .el-icon {
                margin-right: 8px;
                vertical-align: middle;
            }
        }
    }
}
</style>
