<template>
  <div class="login-container">
    <!-- 左侧电商品牌展示区 -->
    <div class="login-left">
      <div class="brand-wrapper">
        <h1 class="brand-name">电商管理后台</h1>
        <p class="brand-description">专业电商解决方案 · 多租户架构支持</p>
        
        <div class="features">
          <div class="feature-item">
            <span>商品管理</span>
          </div>
          <div class="feature-item">
            <span>订单管理</span>
          </div>
          <div class="feature-item">
            <span>会员管理</span>
          </div>
          <div class="feature-item">
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
            <h2>欢迎登录</h2>
            <p>电商管理后台系统</p>
          </div>
          <el-tabs v-model="activeTab" class="login-tabs">
            <!-- 账号密码登录 -->
            <el-tab-pane label="账号密码登录" name="account">
              <el-form
                ref="accountFormRef"
                :model="accountForm"
                :rules="accountRules"
                size="large"
                @submit.prevent="handleAccountLogin"
                class="tab-form"
              >
                <el-form-item prop="tenantId" v-if="showTenantSelect">
                  <el-select
                    v-model="accountForm.tenantId"
                    placeholder="请选择租户"
                    clearable
                    class="tenant-select"
                  >
                    <el-option label="默认商户" value="1" />
                  </el-select>
                </el-form-item>

                <el-form-item prop="username">
                  <el-input
                    v-model="accountForm.username"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                    @keyup.enter="handleAccountLogin"
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="accountForm.password"
                    type="password"
                    placeholder="请输入密码"
                    :prefix-icon="Lock"
                    show-password
                    @keyup.enter="handleAccountLogin"
                  />
                </el-form-item>

                <div class="form-options">
                  <el-checkbox v-model="accountForm.rememberMe">记住我</el-checkbox>
                  <el-link 
                    type="primary" 
                    :underline="false"
                    @click="showForgotPassword = true"
                  >
                    忘记密码？
                  </el-link>
                </div>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    :loading="accountLoading"
                    @click="showCaptcha"
                    class="login-btn"
                  >
                    {{ accountLoading ? '登录中...' : '登录' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 手机号登录 -->
            <el-tab-pane label="手机号登录" name="phone">
              <el-form
                ref="phoneFormRef"
                :model="phoneForm"
                :rules="phoneRules"
                size="large"
                @submit.prevent="handlePhoneLogin"
                class="tab-form"
              >
                <!-- 手机号 -->
                <el-form-item prop="phone">
                  <el-input
                    v-model="phoneForm.phone"
                    placeholder="请输入手机号"
                    :prefix-icon="Iphone"
                    maxlength="11"
                  >
                    <template #prepend>
                      +86
                    </template>
                  </el-input>
                </el-form-item>

                <!-- 验证码 -->
                <el-form-item prop="captcha">
                  <phone-code 
                      ref="phoneCodeRef"
                      v-model="phoneForm.captcha"
                      buttonText="获取验证码"
                      :disabled="countdown > 0"
                      @send="sliderCaptchaVisible2=true"
                  />
                </el-form-item>

                <!-- 协议 -->
               <div class="form-options">
                <div class="agreement-wrapper">
                  <el-checkbox v-model="phoneForm.agreement"></el-checkbox>
                  <div class="agreement-content">
                    <div class="agreement-label">
                      <span>我已阅读并同意</span>
                      <span class="link">用户协议</span>
                      <span>和</span>
                      <span class="link">隐私政策</span>
                    </div>
                  </div>
                </div>
              </div>

                <!-- 登录按钮 -->
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    :loading="phoneLoading"
                    @click="handlePhoneLogin"
                    class="login-btn"
                  >
                    {{ phoneLoading ? '登录中...' : '登录' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <!-- 系统提示 -->
          <div class="system-tips">
            <p v-if="activeTab === 'account'">初始账号：admin / 123456</p>
            <p v-else>测试手机号：13800138000 / 验证码：123456</p>
            <p class="tip-note">提示：系统管理员账号在数据库初始化时创建</p>
          </div>

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

    <!-- 忘记密码弹窗 -->
    <el-dialog
      v-model="showForgotPassword"
      title="找回密码"
      width="450px"
      :close-on-click-modal="false"
    >
      <forgot-password-form @success="handlePasswordResetSuccess"/>
    </el-dialog>
    <slider-captcha v-model:visible="sliderCaptchaVisible" @success="handleAccountLogin"/>
    <slider-captcha v-model:visible="sliderCaptchaVisible2" @success="sendCaptcha"/>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import ForgotPasswordForm from './components/ForgotPasswordForm.vue'
import { User, Lock, Iphone, Phone } from '@element-plus/icons-vue'
import SliderCaptcha from '@/components/SliderCaptcha/SliderCaptcha.vue'

// 路由实例
const router = useRouter()
const route = useRoute()

// 手机验证码组件
const phoneCodeRef = ref()

// 拼图验证码
const sliderCaptchaVisible = ref(false);
const sliderCaptchaVisible2 = ref(false)

const redirect = route.query.redirect as string
const otherQuery = Object.keys(route.query)
  .filter(key => key !== 'redirect')
  .reduce((obj, key) => {
    obj[key] = route.query[key]
    return obj
  }, {} as Record<string, any>)

const userStore = useUserStore()

// 表单引用
const accountFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()

// 当前激活的标签页
const activeTab = ref('account')

// 忘记密码弹窗显示状态
const showForgotPassword = ref(false)

// 账号登录表单数据
const accountForm = reactive({
  tenantId: '',
  username: '',
  password: '',
  rememberMe: false
})

// 手机号登录表单数据
const phoneForm = reactive({
  phone: '13800138000',
  captcha: '',
  agreement: true
})

// 加载状态
const accountLoading = ref(false)
const phoneLoading = ref(false)

// 验证码倒计时
const countdown = ref(0)
let countdownTimer: number | null = null

// 是否显示租户选择
const showTenantSelect = computed(() => {
  return false
})

// 判断是否单商户模式
const isSingleTenant = computed(() => {
  return !showTenantSelect.value
})

// 验证规则
const accountRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 20, message: '长度在20 个字符以内', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { 
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 发送验证码
const sendCaptcha = async () => {
  if (!phoneFormRef.value) return
  
  // 验证手机号
  try {
    await phoneFormRef.value.validateField('phone');
    // 模拟发送验证码
    ElMessage.success(`验证码已发送至 ${phoneForm.phone}`)
    phoneCodeRef.value.startCountdown()
  } catch {
    return
  }
}

const showCaptcha = async () => {
  if (!accountFormRef.value) return
  const valid = await accountFormRef.value.validate()
  if (!valid) return
  sliderCaptchaVisible.value = true
}
// 账号密码登录处理
const handleAccountLogin = async () => {
  if (!accountFormRef.value) return
  
  const valid = await accountFormRef.value.validate()
  if (!valid) return

  accountLoading.value = true
  
  try {
    await userStore.login({
      username: accountForm.username,
      password: accountForm.password
    })

    // 处理记住我
    if (accountForm.rememberMe) {
      localStorage.setItem('remembered_username', accountForm.username)
    } else {
      localStorage.removeItem('remembered_username')
    }

    // 登录成功提示
    ElMessage.success('登录成功')
    // 如果有 redirect 参数，跳转到指定页面
    if (redirect) {
       router.push({
        path: redirect,
        query: otherQuery
      })
    } else {
      // 否则跳转到首页
      router.push('/')
    }
  } catch (error: any) {
  } finally {
    accountLoading.value = false
  }
}

// 手机号登录处理
const handlePhoneLogin = async () => {

  if (!phoneFormRef.value) return
  
  const valid = await phoneFormRef.value.validate()
  if (!valid) return

  if (!phoneForm.agreement) {
    ElMessage.warning('请同意用户协议和隐私政策')
    return
  }

  phoneLoading.value = true
  
  try {
    // 模拟验证码验证
    if (phoneForm.captcha !== '123456') {
      throw new Error('验证码错误')
    }

    // 模拟手机号登录
    await userStore.loginByPhone({
      phone: phoneForm.phone,
      code: phoneForm.captcha
    })
    ElMessage.success('登录成功')
    if (redirect) {
       router.push({
        path: redirect,
        query: otherQuery
      })
    } else {
      router.push('/')
    }
  } catch (error: any) {
  } finally {
    phoneLoading.value = false
  }
}

// 密码重置成功处理
const handlePasswordResetSuccess = () => {
  showForgotPassword.value = false
  ElMessage.success('密码重置成功，请使用新密码登录')
  // 切换到账号登录标签页
  activeTab.value = 'account'
}

// 页面加载时检查是否有记住的账号
onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  if (savedUsername) {
    accountForm.username = savedUsername
    accountForm.rememberMe = true
  }

  // 清理定时器
  return () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
  }
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  background: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧区域 - 保持原有样式不变 */
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
  margin-bottom: 1.5rem;

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

/* Element UI Tabs 样式 - 保持原有设计风格 */
:deep(.login-tabs) {
  .el-tabs__header {
    margin-bottom: 1.5rem;
  }

  .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: var(--border-color);
  }

  .el-tabs__active-bar {
    background-color: var(--ecommerce-primary);
    height: 3px;
  }

  .el-tabs__item {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-regular);
    padding: 0 16px;
    
    &:hover {
      color: var(--ecommerce-primary);
    }

    &.is-active {
      color: var(--ecommerce-primary);
    }
  }
}

.tab-form {
  margin-top: 1rem;
}

:deep(.tenant-select) {
  width: 100%;
}

/* 验证码输入样式 */
.captcha-input {
  display: flex;
  gap: 0.75rem;
  align-items: center;

  :deep(.el-input) {
    flex: 1;
  }

  .captcha-btn {
    flex-shrink: 0;
    min-width: 110px;
    height: 40px;
  }
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
    margin: 0 2px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

  .captcha-input {
    flex-direction: column;
    align-items: stretch;
    
    .captcha-btn {
      width: 100%;
      margin-top: 0.5rem;
    }
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

.agreement-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.agreement-content {
  flex: 1;
  height: 40px;
  line-height: 40px;
}

.link {
  color: var(--ecommerce-primary);
  cursor: pointer;
  text-decoration: none;
  margin: 0 4px;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>