<template>
  <el-dialog
    v-model="dialogVisible"
    :title="form.type === 'SYSTEM' ? '发送系统公告' : '发送个人通知'"
    width="500px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <!-- 通知类型选择 -->
      <el-form-item label="通知类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="SYSTEM">系统公告</el-radio>
          <el-radio value="PERSONAL">个人通知</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 用户选择（只有个人通知时显示） -->
      <el-form-item 
        v-if="form.type === 'PERSONAL'" 
        label="接收用户" 
        prop="receiverId"
      >
        <el-select 
          v-model="form.receiverId" 
          filterable
          remote
          reserve-keyword
          placeholder="请输入用户名搜索"
          :remote-method="searchUsers"
          :loading="searchLoading"
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="`${user.username}${user.nickname ? ' (' + user.nickname + ')' : ''}`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="公告标题" prop="title">
        <el-input 
          v-model="form.title" 
          placeholder="请输入公告标题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="公告内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入公告内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="提示信息">
        <div class="form-tip">
          {{ form.type === 'SYSTEM' ? '系统公告将推送给所有在线用户' : '个人通知将推送给指定用户' }}
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          发送{{ form.type === 'SYSTEM' ? '公告' : '通知' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { sendAnnouncementApi, sendPersonalNotificationApi } from '@/api/notification'
import {getUserListApi} from '@/api/user'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// 对话框显示
const dialogVisible = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 表单
const formRef = ref()
const submitting = ref(false)
const form = ref({
  type: 'SYSTEM',  // 默认系统公告
  receiverId: null as number | null,
  title: '',
  content: '',
  sendToAll: true
})

// 用户搜索
const searchLoading = ref(false)
const userList = ref<any[]>([])

// 搜索用户
const searchUsers = async (query: string) => {
  console.log('搜索用户:', query)
  if (!query) {
    userList.value = []
    return
  }
  
  searchLoading.value = true
  try {
    const res = await getUserListApi({ username: query, pageNum: 1, pageSize: 20 })
    userList.value = res.data?.list || []
  } catch (error) {
    console.error('搜索用户失败', error)
  } finally {
    searchLoading.value = false
  }
}

// 表单规则
const rules = {
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  receiverId: [
    { 
      required: true, 
      message: '请选择接收用户', 
      trigger: 'change',
      validator: (rule: any, value: any) => {
        if (form.value.type === 'PERSONAL' && !value) {
          return false
        }
        return true
      }
    }
  ],
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  submitting.value = true
  try {
    if (form.value.type === 'SYSTEM') {
      // 发送系统公告
      await sendAnnouncementApi({
        title: form.value.title,
        content: form.value.content
      })
      ElMessage.success('公告发送成功')
    } else {
      // 发送个人通知
      if (!form.value.receiverId) {
        ElMessage.warning('请选择接收用户')
        return
      }
      await sendPersonalNotificationApi({
        receiverId: form.value.receiverId,
        title: form.value.title,
        content: form.value.content
      })
      ElMessage.success('通知发送成功')
    }
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('发送失败', error)
  } finally {
    submitting.value = false
  }
}

// 关闭后重置
const handleClosed = () => {
  form.value = {
    type: 'SYSTEM',
    receiverId: null,
    title: '',
    content: '',
    sendToAll: true
  }
  userList.value = []
  formRef.value?.clearValidate()
}

// 监听类型变化，重置校验
watch(() => form.value.type, () => {
  if (form.value.type === 'SYSTEM') {
    form.value.receiverId = null
  }
  formRef.value?.clearValidate('receiverId')
})
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>