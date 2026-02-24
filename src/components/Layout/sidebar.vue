<template>
    <el-aside class="sidebar-container">
        <!-- Logo区域 -->
        <div class="sidebar-logo">
            <div class="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2L30 16L16 30L2 16L16 2Z" fill="#FF6B35"/>
                    <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="#4ECDC4"/>
                    <circle cx="16" cy="16" r="4" fill="#FFD166"/>
                </svg>
            </div>
            <span class="logo-text">电商管理平台</span>
        </div>
        
        <!-- 菜单区域 -->
        <el-menu
            class="sidebar-menu"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
            :default-active="activeMenu"
            :collapse="false"
            router
            @select="handleSelect"
        >
            <template v-for="list in sidebarList">
                <el-sub-menu v-if="list.children"  :index="list.path">
                    <template #title>
                        <el-icon>
                            <component :is="getIconComponent(list.meta?.icon)" />
                        </el-icon>
                        <span>{{ list.meta?.title }}</span>
                    </template>
                    <el-menu-item v-for="child in list.children" :index="child.path">
                        {{ child.meta?.title }}
                    </el-menu-item>
                </el-sub-menu>
                 <el-menu-item v-else :index="list.path">
                    <el-icon>
                        <component :is="getIconComponent(list.meta?.icon)" />
                    </el-icon>
                    <span>{{ list.meta?.title }}</span>
                </el-menu-item>
            </template>
        </el-menu>
        
        <!-- 底部用户信息 -->
        <div class="sidebar-footer">
            <div class="user-info">
                <el-avatar :size="36" :src="userAvatar" />
                <div class="user-detail">
                    <div class="username">{{ userInfo.nickname|| userInfo.username }}</div>
                    <div class="user-role">{{userInfo.roleNames}}</div>
                </div>
            </div>
        </div>
    </el-aside>
</template>

<script setup lang="ts">
import {usePermissionStore} from '@/stores/permission'
// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const route = useRoute();
const activeMenu = computed(() => route.path);
const userAvatar = computed(() =>{
    return userStore.userInfo?.avatar??'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})
const userInfo = computed(() => userStore.userInfo || {})
const permissionStore = usePermissionStore(); 
const sidebarList = computed(() => permissionStore.sidebarRoutes)
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const getIconComponent = (iconName?: string) => {
    const defaultIcon = 'Goods'
    if (!iconName) {
        return ElementPlusIconsVue[defaultIcon]
    }
    return ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue] || ElementPlusIconsVue[defaultIcon]
}

</script>

<style scoped lang="scss">
.sidebar-container {
    height: 100%;
    background: linear-gradient(180deg, #304156 0%, #1c2a38 100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 4px 0 12px rgba(0, 0, 0, 0.2);
    }
}

.sidebar-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 107, 53, 0.1);
    
    .logo-icon {
        margin-right: 12px;
        transition: transform 0.3s ease;
        
        &:hover {
            transform: rotate(15deg);
        }
    }
    
    .logo-text {
        color: white;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 1px;
        background: linear-gradient(90deg, #FF6B35, #FFD166);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
}

.sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
    padding: 10px 0;
    
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
        height: 48px;
        line-height: 48px;
        margin: 4px 8px;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
            background: rgba(64, 158, 255, 0.1);
            transform: translateX(4px);
        }
        
        &.is-active {
            background: linear-gradient(90deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
            border-left: 3px solid var(--ecommerce-primary);
            color: white;
            
            .el-icon {
                color: var(--ecommerce-primary);
            }
        }
    }
    
    :deep(.el-icon) {
        margin-right: 8px;
        font-size: 18px;
    }
}

.sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    
    .user-info {
        display: flex;
        align-items: center;
        
        .user-detail {
            margin-left: 12px;
            color: white;
            
            .username {
                font-weight: 500;
                font-size: 14px;
            }
            
            .user-role {
                font-size: 12px;
                color: #bfcbd9;
                margin-top: 2px;
            }
        }
    }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
    width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
}
</style>