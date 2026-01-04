import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserInfo,login as loginApi} from '@/api/auth'
import type{ loginParams} from '@/types/apiType'
import { ElMessage } from 'element-plus'


export const useUserStore = defineStore('user',()=>{

    const userInfo = ref()
     const userLoaded = ref(false) // 用户信息加载状态

    // 用户登录
    const login = async (data:loginParams) => {
       try{
            const res = await loginApi(data)
            localStorage.setItem("access-token",res.token)
            await fetchUserInfo()
            return res
       }catch(error){
            throw error
       }
    }    
      // 获取用户信息
    const fetchUserInfo = async () => {
        if (userLoaded.value) {
            return userInfo.value
        }
        try {
            const res = await getUserInfo()
            userInfo.value = res.data
             userLoaded.value = true
            return res
        } catch (error) {
            console.error('获取用户信息失败:', error)
            userLoaded.value = false
            throw error
        }
    }
    // 清除用户信息
    const clearUserInfo = () => {
        userInfo.value = null
        userLoaded.value = false
    }
    // 用户退出
    const logout = () => {
        localStorage.removeItem("access-token");
        clearUserInfo();
          ElMessage({
            message: '退出登录成功',
            duration: 3 * 1000,
        })
        window.location.href="/"
    }
    return {
        userInfo,
        logout,
        login,
        clearUserInfo,
        fetchUserInfo
    }
})
