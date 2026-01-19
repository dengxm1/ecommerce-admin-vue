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
      labelWidth="auto"
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
    emit('submit')
}

const cancel = async () =>{
    if(!proFormRef.value) return
   try{
    await resetFields();
    dialogVisible.value = false;
    emit('cancel')
   }catch(error){
      console.log('error submit!', error)
   }
}
    const validate = (callback?:(isValid: boolean,invalidFields?: any) => Promise<void> | void) => {
        if(!proFormRef.value) return
        return proFormRef.value.validate(callback);
    }

    const resetFields = (props?: string | string[]) => {
          if(!proFormRef.value) return
        return proFormRef.value.resetFields(props)
    }

    const clearValidate = (props?: string | string[]) => {
        if (!proFormRef.value) return
        return proFormRef.value.clearValidate(props)
    }

      const validateField = (props?: string | string[]) => {
        if (!proFormRef.value) return;
        return proFormRef.value.validateField(props);
    };

    defineExpose({
      validate,
      resetFields,
      clearValidate,
      validateField
    })
</script>
<style scoped lang="scss">
    .title-container{
        width: 100%;
        text-align: center;
    }
</style>