import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserInfo,login as loginApi} from '@/api/auth'
import type{ loginParams} from '@/types/apiType'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user',()=>{
    const router = useRouter()
    const userInfo = ref()

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
    // 清除用户信息
    const clearUserInfo = () => {
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
        logout,
        login,
        clearUserInfo,
        fetchUserInfo
    }
})
