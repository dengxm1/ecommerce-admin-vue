<template>
    <el-header class="header-container">
        <view class="header-wrapper">
            <!-- 左侧：面包屑和页面标题 -->
        <div class="header-left">
            <div class="page-title">
                <el-icon class="title-icon"><component :is="currentPage.icon" /></el-icon>
                <h1>{{ currentPage.title }}</h1>
            </div>
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item :to="{ path: '/' }">
                    <el-icon><House /></el-icon> 首页
                </el-breadcrumb-item>
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                    {{ item }}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <!-- 右侧：工具和用户 -->
        <div class="header-right">
            <!-- 消息通知 -->
            <el-dropdown trigger="click" class="header-tool">
                <div class="tool-item">
                    <el-badge :value="3" :max="99">
                        <el-icon :size="20"><Bell /></el-icon>
                    </el-badge>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <div class="notification-item">
                                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                                <div>
                                    <div class="notification-title">新订单</div>
                                    <div class="notification-desc">用户下单了商品 #12345</div>
                                </div>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item divided>
                            <div class="notification-item">
                                <el-icon color="#E6A23C"><Warning /></el-icon>
                                <div>
                                    <div class="notification-title">库存预警</div>
                                    <div class="notification-desc">商品 #67890 库存不足</div>
                                </div>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            
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
                        <span class="username">管理员</span>
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

// Element Plus 图标
import {
    House,
    Bell,
    CircleCheck,
    Warning,
    FullScreen,
    Moon,
    ArrowDown,
    User,
    SwitchButton,
    Histogram,
    Goods,
    Tickets
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

const userStore = useUserStore();

// 模拟当前页面信息
const currentPage = computed(() => {
    const path = route.path;
    if (path.includes('dashboard')) return { title: '数据看板', icon: Histogram };
    if (path.includes('product')) return { title: '商品管理', icon: Goods };
    if (path.includes('order')) return { title: '订单管理', icon: Tickets };
    return { title: '电商管理平台', icon: Histogram };
});

// 模拟面包屑
const breadcrumbs = computed(() => {
    return route.path.split('/').filter(Boolean).map(item => 
        item.charAt(0).toUpperCase() + item.slice(1)
    );
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