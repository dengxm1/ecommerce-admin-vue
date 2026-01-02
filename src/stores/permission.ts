import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserMenu} from '@/api/auth'
import router from '@/router/index'
import { transformMenuToRoutes, addRoutesToHome,transformMenuToSidebar} from '@/utils/routeUtils'
import {type BackendMenuItem} from '@/utils/routeUtils'

export const usePermissionStore = defineStore("permission",() => {
    const routes = ref([])
    const loaded = ref(false) // 添加加载状态
    const sidebarRoutes= ref([]); //侧边栏导航
         // 获取用户权限菜单
    const generateRoutes = async () => {
          // 如果已经加载过，直接返回
        if (loaded.value) {
            return routes.value
        }
        try {
            const res = await getUserMenu()
            routes.value = res.data
            // 转换为前端路由
            const frontendRoutes = transformMenuToRoutes(res.data)
            // 添加到路由表中
            addRoutesToHome(router, frontendRoutes)
            // 生成侧边栏导航
             const sidebarList = transformMenuToSidebar(res.data);
             sidebarRoutes.value = sidebarList
            loaded.value = true // 标记为已加载
            return res
        } catch (error) {
            console.error('获取用户权限菜单失败:', error)
            loaded.value = false // 加载失败，下次重试
            throw error
        }
    }
    // 清除权限缓存
    const clearRoutes = () => {
        routes.value = []
        loaded.value = false
    }
    return {
        routes,
        sidebarRoutes,
        clearRoutes,
        generateRoutes
    }
})
