
<template>
  <el-dialog
    v-model="visible"
    :title="hasOldPhone ? '更换手机号' : '绑定手机号'"
    width="400px"
    :close-on-click-modal="false"
  >
    <!-- 更换手机号 -->
    <div v-if="hasOldPhone" class="phone-change-container">
      <!-- 第一步：验证旧手机号 -->
      <div v-if="step === 1" class="step-content">
        <div class="old-phone-info">
          <p class="phone-label">原手机号</p>
          <div class="phone-display">
            <span class="masked-phone">{{ maskedOldPhone }}</span>
            <el-button
              type="primary"
              link
              :disabled="oldCountdown > 0"
              @click="sendOldCode"
            >
              {{ oldButtonText }}
            </el-button>
          </div>
        </div>
        <pro-form 
            ref="oldFormRef" 
            :modelForm="oldForm"  
            :rules="codeRules" 
            :formItemList="oldFormList"
          >
        </pro-form>
        <div class="form-actions">
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="verifying"
            @click="verifyOldPhone"
          >
            下一步
          </el-button>
        </div>
      </div>

      <!-- 第二步：输入新手机号 -->
      <div v-else class="step-content">
        <pro-form 
          ref="newFormRef"
          :modelForm="newForm"  
          :rules="newFormRules" 
          :formItemList="newFormList"
        >
        <template #phoneCode>
            <PhoneCode 
              v-model="newForm.code"
              :buttonText="newButtonText"
              :disabled="newCountdown > 0 || !newForm.phone"
              @send="sendNewCode"
            />
        </template>
      </pro-form>
        <div class="form-actions">
          <el-button @click="step = 1">上一步</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitChange"
          >
            确认更换
          </el-button>
        </div>
      </div>
    </div>

    <!-- 绑定手机号 -->
    <div v-else class="phone-bind-container">
      <pro-form
          ref="bindFormRef"
          :modelForm="bindForm"  
          :rules="bindFormRules" 
          :formItemList="bindFormList"
      >
        <template #phoneCode>
          <div class="code-input-group">
                <PhoneCode 
                v-model="bindForm.code"
                :buttonText="bindButtonText"
                :disabled="bindCountdown > 0 || !bindForm.phone"
                @send="sendBindCode"
            />
            </div>
        </template>
      </pro-form>
      <div class="form-actions">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="binding"
          @click="submitBind"
        >
          确认绑定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {bindPersonalPhoneApi,checkedPhoneUniqueApi} from '@/api/auth'
import ProForm from '@/components/ProForm/ProForm.vue'
 import type {formItem} from '@/components/ProForm/ProForm.vue'
 import PhoneCode from './PhoneCode.vue'

interface Props {
  modelValue: boolean
  currentPhone?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const userStore = useUserStore()

// 表单引用
const oldFormRef = ref<FormInstance>()
const newFormRef = ref<FormInstance>()
const bindFormRef = ref<FormInstance>()

// 状态
const step = ref(1) // 1: 验证旧手机, 2: 输入新手机
const verifying = ref(false)
const submitting = ref(false)
const binding = ref(false)

// 倒计时
const oldCountdown = ref(0)
const newCountdown = ref(0)
const bindCountdown = ref(0)

// 修改手机号第一步表单数据
const oldForm = reactive({
  code: ''
})

const oldFormList = reactive<formItem[]>([
  {
    type: 'input',
    label: "验证码",
    prop: "code",
    maxlength: 6
  }
])

// 修改手机号第二步表单数据
const newForm = reactive({
  phone: '',
  code: ''
})

const newFormList = reactive<formItem[]>([
  {
    prop: "phone",
    type: "tel",
    label: "手机号",
  },
  {
    type: 'input',
    label: "验证码",
    slot:'phoneCode',
    prop:'code',
    maxlength:6
  }
])
// 绑定手机号表单数据
const bindForm = reactive({
  phone: '',
  code: ''
})

const bindFormList = reactive<formItem[]>([
  {
    prop: "phone",
    type: "tel",
    label: "手机号",
  },
  {
    type: 'input',
    label: "验证码",
    slot:'phoneCode',
    prop:'code',
    maxlength:6
  }
])
// 计算属性
const hasOldPhone = computed(() => !!props.currentPhone && props.currentPhone.trim() !== '')

const maskedOldPhone = computed(() => {
  if (!props.currentPhone) return ''
  const phone = props.currentPhone
  if (phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

// 按钮文本
const oldButtonText = computed(() => oldCountdown.value > 0 ? `${oldCountdown.value}s后重发` : '发送验证码')
const newButtonText = computed(() => newCountdown.value > 0 ? `${newCountdown.value}s后重发` : '发送验证码')
const bindButtonText = computed(() => bindCountdown.value > 0 ? `${bindCountdown.value}s后重发` : '发送验证码')

// 验证规则
const codeRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码'},
    { pattern: /^\d{6}$/, message: '验证码为6位数字'}
  ]
}

const newFormRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: codeRules.code
}

const bindFormRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: codeRules.code
}

// 对话框控制
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 重置表单
const resetForm = () => {
  step.value = 1
  oldForm.code = ''
  newForm.phone = ''
  newForm.code = ''
  bindForm.phone = ''
  bindForm.code = ''
  oldCountdown.value = 0
  newCountdown.value = 0
  bindCountdown.value = 0
  
  // 清除验证
  setTimeout(() => {
    oldFormRef.value?.clearValidate()
    newFormRef.value?.clearValidate()
    bindFormRef.value?.clearValidate()
  }, 100)
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    resetForm()
  }
})

// 开始倒计时
const startCountdown = (type: 'old' | 'new' | 'bind') => {
  let countdownRef: typeof oldCountdown
  
  switch (type) {
    case 'old':
      countdownRef = oldCountdown
      break
    case 'new':
      countdownRef = newCountdown
      break
    case 'bind':
      countdownRef = bindCountdown
      break
  }
  
  countdownRef.value = 60
  const timer = setInterval(() => {
    countdownRef.value--
    if (countdownRef.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 发送旧手机验证码
const sendOldCode = () => {
  // 模拟发送验证码
  ElMessage.success(`验证码已发送到 ${maskedOldPhone.value}`)
  startCountdown('old')
}

// 发送新手机验证码
const sendNewCode = async() => {
  if (!newFormRef.value) return
    try{
      // 验证手机号格式
      await newFormRef.value.validateField('phone');
      await checkedPhoneUniqueApi({phone: newForm.phone}); //验证手机号的唯一性
      ElMessage.success(`验证码已发送到 ${maskPhone(newForm.phone)}`)
     startCountdown('new')
    }catch(error){
      console.log('error',error);
    }
}

// 发送绑定验证码
const sendBindCode = async () => {
  if (!bindFormRef.value) return
    try{
        // 验证手机号格式
        await bindFormRef.value.validateField('phone');
        await checkedPhoneUniqueApi({phone: bindForm.phone}); //验证手机号的唯一性
        ElMessage.success(`验证码已发送到 ${maskPhone(bindForm.phone)}`)
        startCountdown('bind')
    }catch(error){
        console.log('error',error);
    }
}

// 验证旧手机号
const verifyOldPhone = async () => {
  if (!oldFormRef.value) return
  
  try {
    await oldFormRef.value.validate()
    // 模拟验证
    verifying.value = true
    setTimeout(() => {
       ElMessage.success('验证成功')
        step.value = 2
      verifying.value = false
    }, 500)
  } catch {
    // 验证失败
  }
}

// 提交更换手机号
const submitChange = async () => {
  if (!newFormRef.value) return
  
  try {
    await newFormRef.value.validate(); //表单验证
    await checkedPhoneUniqueApi({phone: newForm.phone}); //验证手机号的唯一性
    submitting.value = true
     const res = await bindPersonalPhoneApi({phone: newForm.phone})
      ElMessage.success(res.message || '手机号更换成功')
      userStore.fetchUserInfo(); //重新获取用户信息
      // 关闭对话框并触发成功事件
      visible.value = false
      emit('success')
      submitting.value = false

  } catch {
    // 验证失败
  }
}

// 提交绑定手机号
const submitBind = async () => {
  if (!bindFormRef.value) return
  
  try {
    await bindFormRef.value.validate(); //表单验证
    await checkedPhoneUniqueApi({phone: bindForm.phone}); //验证手机号的唯一性
    binding.value = true
    const res = await bindPersonalPhoneApi({phone: bindForm.phone})
    ElMessage.success(res.message || '手机号绑定成功');
    userStore.fetchUserInfo(); //重新获取用户信息
    visible.value = false
    emit('success')
    binding.value = false
  } catch {
    // 验证失败
  }
}

// 手机号脱敏显示
const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
</script>

<style scoped lang="scss">
.phone-change-container,
.phone-bind-container {
  .old-phone-info {
    margin-bottom: 20px;
    
    .phone-label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }
    
    .phone-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background-color: var(--el-fill-color-light);
      border-radius: var(--el-border-radius-base);
      
      .masked-phone {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }
  
   .code-input-group {
      display: flex;
      gap: 10px;
      
      .code-input {
        flex: 1;
      }
      
      .el-button {
        white-space: nowrap;
        width: 120px;
      }
    }
  
  .form-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color);
  }
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>