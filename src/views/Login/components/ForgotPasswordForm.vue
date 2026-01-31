<template>
  <el-form
    ref="forgotPasswordFormRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    size="large"
  >
    <div class="form-steps">
      <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">验证身份</div>
      </div>
      <div class="step-line" :class="{ active: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">设置新密码</div>
      </div>
      <div class="step-line" :class="{ active: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep === 3 }">
        <div class="step-number">3</div>
        <div class="step-label">完成重置</div>
      </div>
    </div>

    <!-- 步骤1：验证身份 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form-item label="验证方式">
        <el-radio-group v-model="verifyMethod" @change="handleMethodChange">
          <el-radio label="phone">手机验证</el-radio>
          <el-radio label="email">邮箱验证</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item 
        :label="verifyMethod === 'phone' ? '手机号' : '邮箱'"
        prop="account"
      >
        <el-input
          v-model="formData.account"
          :placeholder="verifyMethod === 'phone' ? '请输入注册手机号' : '请输入注册邮箱'"
          :prefix-icon="verifyMethod === 'phone' ? 'ep-iphone' : 'ep-message'"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="verifyMethod === 'phone'" label="验证码" prop="captcha">
        <div class="captcha-input">
          <el-input
            v-model="formData.captcha"
            placeholder="请输入验证码"
            :maxlength="6"
          />
          <el-button
            type="primary"
            :disabled="captchaCountdown > 0"
            @click="sendVerifyCaptcha"
            class="captcha-btn"
          >
            {{ captchaCountdown > 0 ? `${captchaCountdown}秒后重试` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="verifyMethod === 'email'" label="邮箱验证码" prop="emailCode">
        <div class="captcha-input">
          <el-input
            v-model="formData.emailCode"
            placeholder="请输入邮箱验证码"
            :maxlength="6"
          />
          <el-button
            type="primary"
            :disabled="emailCountdown > 0"
            @click="sendEmailCode"
            class="captcha-btn"
          >
            {{ emailCountdown > 0 ? `${emailCountdown}秒后重试` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <div class="step-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleNextStep" :loading="verifying">
          下一步
        </el-button>
      </div>
    </div>

    <!-- 步骤2：设置新密码 -->
    <div v-else-if="currentStep === 2" class="step-content">
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
          prefix-icon="ep-lock"
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          prefix-icon="ep-lock"
        />
      </el-form-item>

      <div class="step-actions">
        <el-button @click="currentStep = 1">上一步</el-button>
        <el-button type="primary" @click="handleResetPassword" :loading="resetting">
          重置密码
        </el-button>
      </div>
    </div>

    <!-- 步骤3：完成重置 -->
    <div v-else class="step-content">
      <div class="success-container">
        <div class="success-icon">
          <i class="ep-circle-check" style="color: var(--success-color); font-size: 64px;"></i>
        </div>
        <h3>密码重置成功！</h3>
        <p class="success-message">您的新密码已经设置成功，请使用新密码登录系统。</p>
        <div class="reset-info" v-if="resetInfo">
          <p>重置账号：{{ resetInfo.account }}</p>
          <p>重置时间：{{ resetInfo.time }}</p>
          <p>新密码：{{ resetInfo.maskedPassword }}</p>
        </div>
        <div class="security-tips">
          <h4><i class="ep-warning"></i> 安全提示：</h4>
          <ul>
            <li>请妥善保管您的密码，不要告诉他人</li>
            <li>建议定期更换密码，提高账户安全性</li>
            <li>如发现异常登录，请及时联系客服</li>
          </ul>
        </div>
        <div class="step-actions">
          <el-button type="primary" @click="handleComplete">完成</el-button>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 表单引用
const forgotPasswordFormRef = ref<FormInstance>()

// 当前步骤
const currentStep = ref(1)

// 验证方式
const verifyMethod = ref<'phone' | 'email'>('phone')

// 倒计时
const captchaCountdown = ref(0)
const emailCountdown = ref(0)

// 加载状态
const verifying = ref(false)
const resetting = ref(false)

// 重置信息
const resetInfo = ref<{
  account: string
  time: string
  maskedPassword: string
} | null>(null)

// 表单数据
const formData = reactive({
  account: '',
  captcha: '',
  emailCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = formData.newPassword
  if (!password) return ''
  
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++
  
  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 'weak': return '弱'
    case 'medium': return '中'
    case 'strong': return '强'
    default: return ''
  }
})

// 验证规则
const formRules: FormRules = {
  account: [
    { required: true, message: '请输入账号信息', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (verifyMethod.value === 'phone') {
          if (!/^1[3-9]\d{9}$/.test(value)) {
            callback(new Error('请输入正确的手机号'))
          } else {
            callback()
          }
        } else {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            callback(new Error('请输入正确的邮箱地址'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
          callback(new Error('密码必须包含大小写字母、数字和特殊字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理验证方式变更
const handleMethodChange = () => {
  formData.account = ''
  formData.captcha = ''
  formData.emailCode = ''
}

// 发送手机验证码
const sendVerifyCaptcha = async () => {
  if (!formData.account) {
    ElMessage.warning('请输入手机号')
    return
  }

  // 模拟发送验证码
  ElMessage.success(`验证码已发送至 ${formData.account}，验证码：123456`)
  
  // 开始倒计时
  captchaCountdown.value = 60
  const timer = setInterval(() => {
    captchaCountdown.value--
    if (captchaCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!formData.account) {
    ElMessage.warning('请输入邮箱地址')
    return
  }

  // 模拟发送验证码
  ElMessage.success(`验证码已发送至 ${formData.account}，验证码：123456`)
  
  // 开始倒计时
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
}

// 下一步 - 验证身份
const handleNextStep = async () => {
  if (!forgotPasswordFormRef.value) return

  try {
    // 验证表单
    if (verifyMethod.value === 'phone') {
      await forgotPasswordFormRef.value.validateField(['account', 'captcha'])
      // 模拟验证码验证
      if (formData.captcha !== '123456') {
        throw new Error('验证码错误')
      }
    } else {
      await forgotPasswordFormRef.value.validateField(['account', 'emailCode'])
      // 模拟验证码验证
      if (formData.emailCode !== '123456') {
        throw new Error('验证码错误')
      }
    }

    verifying.value = true
    // 模拟验证过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    currentStep.value = 2
    ElMessage.success('身份验证成功')
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  } finally {
    verifying.value = false
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return

  try {
    // 验证表单
    await forgotPasswordFormRef.value.validateField(['newPassword', 'confirmPassword'])

    resetting.value = true
    // 模拟重置过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 记录重置信息
    resetInfo.value = {
      account: formData.account,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      maskedPassword: formData.newPassword.replace(/./g, '*')
    }

    currentStep.value = 3
    ElMessage.success('密码重置成功')
  } catch (error: any) {
    ElMessage.error(error.message || '重置失败')
  } finally {
    resetting.value = false
  }
}

// 完成
const handleComplete = () => {
  emit('success')
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
.form-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--border-color);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.step.active {
  .step-number {
    background: var(--ecommerce-primary);
    color: white;
  }
  
  .step-label {
    color: var(--ecommerce-primary);
    font-weight: 500;
  }
}

.step.completed {
  .step-number {
    background: var(--success-color);
    color: white;
  }
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 16px;
  max-width: 80px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: var(--ecommerce-primary);
}

.step-content {
  // min-height: 300px;
}

.captcha-input {
  display: flex;
  gap: 12px;
  align-items: center;
  
  .el-input {
    flex: 1;
  }
  
  .captcha-btn {
    flex-shrink: 0;
    min-width: 120px;
  }
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  &.weak::after {
    width: 33%;
    background: var(--danger-color);
  }
  
  &.medium::after {
    width: 66%;
    background: var(--warning-color);
  }
  
  &.strong::after {
    width: 100%;
    background: var(--success-color);
  }
}

.strength-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 24px;
}

.password-rules {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: var(--radius-small);
  
  p {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    font-size: 12px;
    color: var(--text-placeholder);
    margin-bottom: 4px;
    position: relative;
    padding-left: 18px;
    
    &::before {
      content: '○';
      position: absolute;
      left: 0;
      top: 0;
    }
    
    &.met {
      color: var(--success-color);
      
      &::before {
        content: '✓';
        color: var(--success-color);
      }
    }
  }
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.success-container {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 24px;
}

.success-container h3 {
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 18px;
}

.success-message {
  color: var(--text-regular);
  margin-bottom: 24px;
  line-height: 1.6;
}

.reset-info {
  background: var(--bg-color);
  padding: 16px;
  border-radius: var(--radius-small);
  margin-bottom: 24px;
  text-align: left;
  
  p {
    margin: 8px 0;
    color: var(--text-regular);
    font-size: 14px;
    
    &:last-child {
      color: var(--danger-color);
      font-weight: 500;
    }
  }
}

.security-tips {
  background: rgba(230, 162, 60, 0.1);
  padding: 16px;
  border-radius: var(--radius-small);
  text-align: left;
  margin-bottom: 24px;
  
  h4 {
    color: var(--warning-color);
    margin: 0 0 12px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    color: var(--text-regular);
    font-size: 13px;
    margin-bottom: 6px;
    line-height: 1.5;
  }
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-primary);
}

:deep(.el-radio) {
  margin-right: 20px;
}

:deep(.el-button--primary) {
  background: var(--ecommerce-primary);
  border-color: var(--ecommerce-primary);
  
  &:hover {
    background: #FF5722;
    border-color: #FF5722;
  }
  
  &:disabled {
    opacity: 0.6;
    background: var(--ecommerce-primary);
    border-color: var(--ecommerce-primary);
  }
}
</style>