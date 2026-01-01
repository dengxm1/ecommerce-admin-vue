import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getUserInfo,getUserMenu,login as loginApi} from '@/api/auth'
import {type loginParams} from '@/types/apiType'
import { ElMessage } from 'element-plus'


export const useUserStore = defineStore('user',()=>{

    const userInfo = ref()
    const menuList = ref()

    // 用户登录
    const login = async (data:loginParams) => {
       try{
            const res = await loginApi(data)
            localStorage.setItem("assess-token",res.token)
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
    // 获取用户权限菜单
    const fetchUserMenu = async () => {
        try {
            const res = await getUserMenu()
            menuList.value = res.data
            return res
        } catch (error) {
            console.error('获取用户权限菜单失败:', error)
            throw error
        }
    }
    // 用户退出
    const logout = () => {
        localStorage.removeItem("assess-token");
          ElMessage({
            message: '退出登录成功',
            duration: 3 * 1000,
        })
        window.location.href="/"
    }
    return {
        userInfo,
        menuList,
        logout,
        login,
        fetchUserInfo,
        fetchUserMenu
    }
})
