<template>
    <ProFormDialog
        ref="dialogFormRef"
        v-model="dialogVisible" 
        :title="dialogTitle" 
        :modelForm="modelForm" 
        :formItemList="formItemList"
        :rules="rules"
        @submit="submit"
    >
    </ProFormDialog>
</template>
<script setup lang="ts">
    import {type FormRules, ElMessage} from 'element-plus'
    import type {formItem} from '@/components/ProForm/ProForm.vue'
    import {resetUserPasswordApi} from '@/api/user'

     const dialogFormRef = ref()

       interface RuleForm {
        id?: number | string,
        password?: string,
        confirmPassword?: string
    }

    const props = defineProps<{
        modelValue: boolean,
        userData: Record<string, any>
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean],
        'success': []
    }>()

    const dialogTitle = computed(() => {
        return props.userData?.nickname ? `重置【${props.userData.nickname}】的密码` : '重置用户密码'
    })

    const modelForm = reactive<RuleForm>({
        id:"",
        password: "",
        confirmPassword:"",
    })

    const formItemList = reactive<formItem[]>([
        {
            label: "密码",
            prop: "password",
            type: "password"
        },
        {
            label: "确认密码",
            prop: "confirmPassword",
            type: "password"
        }
    ])

    const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
    if (value !== modelForm.password) {
        return  callback(new Error('两次输入的密码不一致'));
    }
    callback();
};

    const rules = reactive<FormRules<RuleForm>>({
        password:[
            {  required: true,message: '请输入密码'},
            { min: 6, max: 16, message: '密码长度必须在6-16个字符以内'}
        ],
        confirmPassword:[
            { required: true, message: '请输入确认密码', trigger: 'blur' },
            { validator: validateConfirmPassword}
           
        ]
    })


    // 弹窗显示状态
    const dialogVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
    })

    // 确认按钮点击
    const submit = async () => {
        try {
          const res = await resetUserPasswordApi({
                id: props.userData.id,
                password: modelForm.password!
            })
            emit('success')
            dialogVisible.value = false
              ElMessage({
                    message: res.message || '密码重置成功',
                    type: 'success',
                    duration: 3000
                });
        } catch (error) {
            console.error('重置密码失败:', error)
        }
    }

    watch(() => props.modelValue, (newVal) => {
        if (newVal) {
            // 每次打开对话框时，重置表单
            if(dialogFormRef.value){
                dialogFormRef.value.resetFields();
            }
        }
    })


</script>

<style scoped lang="scss"></style>