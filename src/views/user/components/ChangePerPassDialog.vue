<template>
    <ProFormDialog
        ref="dialogFormRef"
        v-model="dialogVisible" 
        title="修改个人密码" 
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
    import {updatePersonalPasswordApi} from '@/api/auth'

     const dialogFormRef = ref()

       interface RuleForm {
        oldPassword: string,
        password: string,
        confirmPassword: string
    }

    const props = defineProps<{
        modelValue: boolean
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean],
        'success': []
    }>()

    const modelForm = reactive<RuleForm>({
        oldPassword:"",
        password: "",
        confirmPassword:"",
    })

    const formItemList = reactive<formItem[]>([
        {
            label: "原密码",
            prop: "oldPassword",
            type: "password"
        },
        {
            label: "新密码",
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
        oldPassword:[
            {  required: true,message: '请输入原密码'},
            { min: 6, max: 16, message: '密码长度必须在6-16个字符以内'}
        ],
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
          const res = await updatePersonalPasswordApi({
                oldPassword: modelForm.oldPassword,
                password: modelForm.password
            })
            emit('success')
            dialogVisible.value = false
              ElMessage({
                    message: res.message || '密码修改成功',
                    type: 'success',
                    duration: 3000
                });
        } catch (error) {
            console.error('修改密码失败:', error)
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