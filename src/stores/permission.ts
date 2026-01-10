import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserMenu, getPermissionsListApi} from '@/api/auth'
import router from '@/router/index'
import { transformMenuToRoutes, addRoutesToHome,transformMenuToSidebar} from '@/utils/routeUtils'
import {type FrontendRoute} from '@/utils/routeUtils'

export const usePermissionStore = defineStore("permission",() => {
    const routes = ref([])
    const loaded = ref(false) // 添加加载状态
    const sidebarRoutes= ref<FrontendRoute[]>([]); //侧边栏导航
    const userPermissionList = ref<string[]>([]);
         // 获取用户菜单项
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

    // 获取用户权限标识列表
    const getUserPermissions = async () => {
       try{
            const res = await getPermissionsListApi();
            userPermissionList.value = res.data;
       }catch(error){
            throw error
       }
    }
      // 检查是否有任一权限
   const hasAnyPermission = (permissions: string[])  =>{
    if (!permissions || permissions.length === 0) return true
    return permissions.some(perm => userPermissionList.value.includes(perm))
  }
  
  // 检查是否有所有权限
  const hasAllPermissions = (permissions: string[]) =>{
    if (!permissions || permissions.length === 0) return true
    return permissions.every(perm => userPermissionList.value.includes(perm))
  }
    // 清除权限缓存
    const clearRoutes = () => {
        routes.value = []
        loaded.value = false
    }
    return {
        routes,
        sidebarRoutes,
        loaded,
        getUserPermissions,
        clearRoutes,
        generateRoutes,
        hasAnyPermission,
        hasAllPermissions
    }
})
