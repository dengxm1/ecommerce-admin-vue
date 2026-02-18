<template>
  <el-dialog
    v-model="dialogVisible"
    title="发送系统公告"
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
      
      <el-form-item label="发送选项">
        <el-checkbox v-model="form.sendToAll" disabled>
          发送给所有用户
        </el-checkbox>
        <div class="form-tip">
          * 系统公告将发送给所有在线用户
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
          发送公告
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { sendAnnouncementApi } from '@/api/notification'

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
  title: '',
  content: '',
  sendToAll: true
})

// 表单规则
const rules = {
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
    await sendAnnouncementApi({
      title: form.value.title,
      content: form.value.content
    })
    ElMessage.success('公告发送成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('发送公告失败', error)
  } finally {
    submitting.value = false
  }
}

// 关闭后重置
const handleClosed = () => {
  form.value = {
    title: '',
    content: '',
    sendToAll: true
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>