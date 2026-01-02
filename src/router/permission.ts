import router from "@/router/index"

import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

// 白名单：不需要登录就可以访问的页面
const whiteList = ['/login', '/404', '/500']

export const setupPermissionGuard = (router: Router) => {
  console.log('路由守卫调用，路由守卫调用')
  // 路由前置守卫
  router.beforeEach(async (to, from) => {

    // 获取用户Store和权限Store
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = localStorage.getItem("access-token")

    // 如果有token
    if (hasToken) {
      // 如果前往登录页，跳转到首页
      if (to.path === '/login') {
        return {path:'/'}
      }
      if(!userStore.userInfo){
        await userStore.fetchUserInfo()
        await permissionStore.generateRoutes()
      }
      console.log('userStore.userInfo==',userStore.userInfo)
      return true
    }else{
      if (!whiteList.includes(to.path)) {
          return {path: `/login?redirect=${to.path}`}
      }
       return true
    }
  })

  // 路由后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    const title = to.meta?.title as string || '电商管理后台'
    document.title = `${title} - 电商管理系统`
    
    // 结束进度条
    // if (window.$loadingBar) {
    //   window.$loadingBar.finish()
    // }
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('路由加载失败，请刷新页面')
  })
}


