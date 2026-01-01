import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserMenu} from '@/api/auth'

export const usePermissionStore = defineStore("permission",() => {
     const routes = ref([])
         // 获取用户权限菜单
    const generateRoutes = async () => {
        try {
            const res = await getUserMenu()
            routes.value = res.data
            return res
        } catch (error) {
            console.error('获取用户权限菜单失败:', error)
            throw error
        }
    }
    return {
        routes,
        generateRoutes
    }
})
