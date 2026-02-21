import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserInfo,login as loginApi, loginByPhone as loginByPhoneApi} from '@/api/auth'
import type{ loginParams} from '@/types/apiType'
import { ElMessage } from 'element-plus'
import { useTabsStore } from './tabs'
import {getDashboardStatsApi} from '@/api/auth'
interface stats{
    userCount: number,
    roleCount: number,
    permissionCount: number
}  
export const useUserStore = defineStore('user',()=>{
    const router = useRouter()
    const userInfo = ref()
    const dashboardStats = ref<stats| null>(null)
    const tabsStore = useTabsStore()
    // 用户登录
    const login = async (data:loginParams) => {
       try{
            const res = await loginApi(data)
            localStorage.setItem("access-token",res.token)
            return res
       }catch(error){
            throw error
       }
    }   
    
    // 手机号登录
    const loginByPhone = async (data:{phone: string, code: string}) => {
       try{
            const res = await loginByPhoneApi(data)
            localStorage.setItem("access-token",res.token)
            return res
       }catch(error){
            throw error
       }
    }   
      // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const res = await getUserInfo()
            userInfo.value = res.data
            return res
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }
    // 获取概览数据统计
    const getDashboardStats =  async () => {
         try {
            const res = await getDashboardStatsApi()
            dashboardStats.value = res.data
            return res
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }
    // 清除用户信息
    const clearUserInfo = () => {
        tabsStore.resetTab()
        userInfo.value = null
    }
    // 用户退出
    const logout = () => {
        localStorage.removeItem("access-token");
        clearUserInfo();
        router.push({path:'/login',replace: true})
          ElMessage({
            message: '退出登录成功',
            duration: 3 * 1000,
        })
    }
    return {
        userInfo,
        dashboardStats,
        logout,
        login,
        loginByPhone,
        clearUserInfo,
        fetchUserInfo,
        getDashboardStats
    }
})
