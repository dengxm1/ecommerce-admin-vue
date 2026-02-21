<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useNotificationStore } from './stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// 处理页面刷新
onMounted(() => {
  console.log('[App] 组件挂载，检查WebSocket连接')
  // 页面刷新时，如果已登录就连接
  notificationStore.connectIfNeeded()
})

// 监听路由变化（处理从登录页跳转）
router.afterEach((to, from) => {
  console.log('[App] 路由变化:', from.path, '->', to.path)
  
  // 从登录页跳转到其他页面，说明刚登录成功
  if (from.path === '/login' && to.path !== '/login') {
    console.log('[App] 检测到登录成功，连接WebSocket')
    notificationStore.connectIfNeeded()
  }
  
  // 跳转到登录页，说明要登出
  if (to.path === '/login' && from.path !== '/login') {
    console.log('[App] 检测到登出，断开WebSocket')
    notificationStore.cleanup()
  }
})
</script>

<style scoped lang="scss">
</style>
