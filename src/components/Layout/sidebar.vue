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
            <el-menu-item index="/dashboard">
                <el-icon><Histogram /></el-icon>
                <span>数据看板</span>
            </el-menu-item>
            
            <el-sub-menu index="product">
                <template #title>
                    <el-icon><Goods /></el-icon>
                    <span>商品管理</span>
                </template>
                <el-menu-item index="/product/list">商品列表</el-menu-item>
                <el-menu-item index="/product/category">分类管理</el-menu-item>
                <el-menu-item index="/product/brand">品牌管理</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/order">
                <el-icon><Tickets /></el-icon>
                <span>订单管理</span>
            </el-menu-item>
            
            <el-sub-menu index="marketing">
                <template #title>
                    <el-icon><Promotion /></el-icon>
                    <span>营销管理</span>
                </template>
                <el-menu-item index="/marketing/coupon">优惠券</el-menu-item>
                <el-menu-item index="/marketing/promotion">促销活动</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/member">
                <el-icon><User /></el-icon>
                <span>会员管理</span>
            </el-menu-item>
            
            <el-menu-item index="/warehouse">
                <el-icon><OfficeBuilding /></el-icon>
                <span>仓储管理</span>
            </el-menu-item>
            
            <el-sub-menu index="system">
                <template #title>
                    <el-icon><Setting /></el-icon>
                    <span>系统设置</span>
                </template>
                <el-menu-item index="/system/user">用户管理</el-menu-item>
                <el-menu-item index="/system/role">角色管理</el-menu-item>
                <el-menu-item index="/system/menu">菜单管理</el-menu-item>
            </el-sub-menu>
        </el-menu>
        
        <!-- 底部用户信息 -->
        <div class="sidebar-footer">
            <div class="user-info">
                <el-avatar :size="36" :src="userAvatar" />
                <div class="user-detail">
                    <div class="username">管理员</div>
                    <div class="user-role">超级管理员</div>
                </div>
            </div>
        </div>
    </el-aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// Element Plus 图标
import {
    Histogram,
    Goods,
    Tickets,
    Promotion,
    User,
    OfficeBuilding,
    Setting
} from '@element-plus/icons-vue';

const route = useRoute();
const activeMenu = ref(route.path);
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
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