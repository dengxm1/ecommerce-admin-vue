import router from "@/router/index"

import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

// 白名单：不需要登录就可以访问的页面
const whiteList = ['/login', '/404', '/500']

export const setupPermissionGuard = (router: Router) => {
  // 路由前置守卫
  router.beforeEach(async (to, from, next) => {

    // 获取用户Store和权限Store
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = localStorage.getItem("assess-token")

    // 如果有token
    if (hasToken) {
      // 如果前往登录页，跳转到首页
      if (to.path === '/login') {
        next({ path: '/' })
        return
      }

      // 如果用户信息不存在，重新获取
      if (!userStore.userInfo) {
        try {
          // 获取用户信息
          // await userStore.fetchUserInfo()
          
          // // 获取用户权限菜单
          // await permissionStore.generateRoutes()
          
          // // 动态添加路由
          // permissionStore.routes.forEach(route => {
          //   router.addRoute(route)
          // })
          
          // 确保addRoute完成
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，可能是token过期
          await userStore.logout()
          next(`/login?redirect=${to.path}`)
          ElMessage.error('登录状态已过期，请重新登录')
        }
      } else {
        // 用户信息已存在，直接放行
        next()
      }
    } else {
      // 没有token的情况
      
      // 如果在白名单中，直接放行
      if (whiteList.includes(to.path)) {
        next()
      } else {
        // 重定向到登录页，带上redirect参数
        next(`/login?redirect=${to.path}`)
        // if (window.$loadingBar) {
        //   window.$loadingBar.finish()
        // }
      }
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


