import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/components/Layout/index.vue'
import {setupPermissionGuard} from './permission'

// 静态路由定义
const staticRouteDefinitions: RouteRecordRaw[] = [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index.vue'),
          meta: {
          title: '概览',
          hidden: false,
        }
  },
  {
    path: '/profile',
    name: 'user-profile',
    component: () => import('@/views/user/index.vue'),
    meta: { 
      title: '个人中心', 
      hidden: true,
      icon: 'User'
    }
  },
  {
    path: '/messages',
    name: 'UserMessages',
    component: () => import('@/views/user/messages/index.vue'),
    meta: { 
      title: '消息中心', 
      hidden: true,
      icon: 'Message'
    }
  }
]
// 导出静态路由的原始配置（用于侧边栏筛选）
export const staticRouteMeta = staticRouteDefinitions.map(route => ({
  path: route.path,
  name: route.name as string,
  meta: route.meta
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'dashboard' },
      component: Layout,
      children: staticRouteDefinitions
    },
    {
      path:'/login',
      name:'login',
      component:() => import("@/views/login/index.vue"),
      meta: {
        title: '登录',
        hidden: true,      // 不在侧边栏显示
        noTab: true,       // 不添加标签页
        noAuth: true,
      }
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import("@/views/404/index.vue"),
        meta: {
          title: '404',
          hidden: true,
          noTab: true,       // 不添加标签页
          noAuth: true
        }
      },
  ],
})
setupPermissionGuard(router)
export default router
