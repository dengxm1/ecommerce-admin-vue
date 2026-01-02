<template>
  <div class="login-container">
    <!-- 左侧电商品牌展示区 -->
    <div class="login-left">
      <div class="brand-wrapper">
        <div class="logo">
          <i class="ep-shopping-bag"></i>
        </div>
        <h1 class="brand-name">电商管理后台</h1>
        <p class="brand-description">专业电商解决方案 · 多租户架构支持</p>
        
        <div class="features">
          <div class="feature-item">
            <i class="ep-goods"></i>
            <span>商品管理</span>
          </div>
          <div class="feature-item">
            <i class="ep-sold-out"></i>
            <span>订单管理</span>
          </div>
          <div class="feature-item">
            <i class="ep-user-filled"></i>
            <span>会员管理</span>
          </div>
          <div class="feature-item">
            <i class="ep-data-analysis"></i>
            <span>数据分析</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <!-- 登录表单 -->
        <div class="login-form">
          <div class="form-header">
            <h2>账号登录</h2>
            <p>欢迎使用电商管理后台系统</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <!-- 租户选择（为多租户扩展预留） -->
            <el-form-item prop="tenantId" v-if="showTenantSelect">
              <el-select
                v-model="loginForm.tenantId"
                placeholder="请选择租户"
                clearable
                class="tenant-select"
              >
                <el-option label="默认商户" value="1" />
                <!-- 多租户扩展时动态加载 -->
              </el-select>
            </el-form-item>

            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="ep-user"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="ep-lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 记住我 -->
            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="login-btn"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>

            <!-- 系统提示 -->
            <div class="system-tips">
              <p>初始账号：admin / 123456</p>
              <p class="tip-note">提示：系统管理员账号在数据库初始化时创建</p>
            </div>
          </el-form>

          <!-- 底部信息 -->
          <div class="form-footer">
            <div class="tenant-tip" v-if="isSingleTenant">
              <i class="ep-info-filled"></i>
              <span>单商户系统模式</span>
            </div>
            <div class="version">v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 路由实例
const router = useRouter()

// Pinia Store
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  tenantId: '1', // 默认租户ID（单商户模式）
  username: 'admin',
  password: '123456',
  rememberMe: false
})

// 加载状态
const loading = ref(false)

// 是否显示租户选择
const showTenantSelect = computed(() => {
  return false
})

// 判断是否单商户模式
const isSingleTenant = computed(() => {
  return !showTenantSelect.value
})

// 验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 验证表单
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true
  
  try {
    // 调用Pinia Store的登录方法
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 登录成功提示
    ElMessage.success('登录成功')
    console.log('222222222222222222')
    // 跳转到首页
    router.push('/')
  } catch (error: any) {
  } finally {
    loading.value = false
  }
}

// 页面加载时检查是否有记住的账号
onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  if (savedUsername) {
    loginForm.username = savedUsername
    loginForm.rememberMe = true
  }
})

// 监听记住我变化
const handleRememberChange = (value: boolean) => {
  if (value) {
    localStorage.setItem('remembered_username', loginForm.username)
  } else {
    localStorage.removeItem('remembered_username')
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  background: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧区域 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--ecommerce-primary) 0%, var(--ecommerce-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.3;
    animation: float 20s linear infinite;
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.brand-wrapper {
  text-align: center;
  z-index: 1;
  max-width: 480px;
  padding: 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.brand-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  font-weight: 300;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 3rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  span {
    font-size: 0.95rem;
    opacity: 0.9;
  }
}

/* 右侧区域 */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.login-form {
  background: var(--header-bg);
  padding: 2.5rem;
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-heavy);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--ecommerce-primary), var(--ecommerce-accent));
  }
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
}

:deep(.tenant-select) {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  :deep(.el-checkbox) {
    color: var(--text-regular);
  }

  :deep(.el-link) {
    font-size: 0.9rem;
  }
}

.login-btn {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 500;
  height: 48px;
  background: linear-gradient(135deg, var(--ecommerce-primary), #FF8B5A);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #FF5722, var(--ecommerce-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.system-tips {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: var(--radius-medium);
  font-size: 0.9rem;
  color: var(--text-regular);
  text-align: center;

  p {
    margin: 0.25rem 0;
  }

  .tip-note {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-style: italic;
  }
}

.form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.tenant-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ecommerce-primary);
  font-weight: 500;

  i {
    font-size: 1.1rem;
  }
}

.version {
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    flex: none;
    height: 30vh;
    padding: 1rem;
  }

  .brand-name {
    font-size: 2rem;
  }

  .features {
    display: none;
  }

  .login-right {
    padding: 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: #1a1a1a;
  }

  .login-form {
    background: #2d2d2d;
    
    .form-header h2 {
      color: #ffffff;
    }
  }

  .system-tips {
    background: #3d3d3d;
  }
}
</style>