<template>
  <el-dialog
    v-model="dialogVisible"
    width="600"
  >
  <template #title>
    <div class="title-container">{{ title }}</div>
  </template>
    <ProForm 
      ref="proFormRef"
      :modelForm="modelForm" 
      :formItemList="formItemList" 
      :rules="rules"
      />
    <slot name="append"></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
 import type { FormRules, FormInstance } from 'element-plus'
import type{formItem} from '@/components/ProForm/ProForm.vue'
import ProForm from '@/components/ProForm/ProForm.vue'

// 获取组件的实例类型
type ProFormInstance = InstanceType<typeof ProForm>

const proFormRef = ref<ProFormInstance>()

const props = defineProps<{
    modelValue: boolean,
    title?: string,
    modelForm: Record<string,any>,
    formItemList: formItem[]
    rules?: FormRules
}>()

const emit = defineEmits<{
    'update:modelValue':[value: boolean],
    'submit':[],
    'cancel':[]
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue',value)
})

const submit = async () => {
  if(!proFormRef.value) return
   try{
    await proFormRef.value.validate();
    emit('submit')
   }catch(error){
      console.log('error submit!', error)
   }
}

const cancel = async () =>{
    if(!proFormRef.value) return
   try{
    await proFormRef.value.resetFields();
    dialogVisible.value = false;
    emit('cancel')
   }catch(error){
      console.log('error submit!', error)
   }
}

</script>
<style scoped lang="scss">
    .title-container{
        width: 100%;
        text-align: center;
    }
</style>