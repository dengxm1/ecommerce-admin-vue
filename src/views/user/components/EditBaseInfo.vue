<template>
        <ProFormDialog 
            ref="dialogFormRef"
            v-model="dialogVisible" 
            title="编辑个人资料" 
            :modelForm="modelForm" 
            :formItemList="formItemList"
            :rules="rules"
            @submit="submit"
            >
        </ProFormDialog>
</template>

<script setup lang="ts">
    import {type FormRules,ElMessage} from 'element-plus'
    import type {formItem} from '@/components/ProForm/ProForm.vue'
    import {updatePersonalInfoApi} from '@/api/auth'
    import {useUserStore} from '@/stores/user'
    
    const userStore = useUserStore();

    const dialogFormRef = ref()

    const props = defineProps<{
        modelValue: boolean,
        data: Record<string, any>
    }>()

    interface RuleForm {
            username: string,
            nickname?: string,
            email?: string,
            avatar?: string
    }

    const modelForm = reactive<RuleForm>({
        username: "",
        nickname: "",
        email: "",
        avatar: ""
    })

    const formItemList = reactive<formItem[]>([
        // {
        //     label: "头像",
        //     prop: "avatar",
        //     type: "upload",
        // },
        {
            label: "用户名",
            prop: "username",
            type: "input",
            disabled: true
        },
        {
            label: "昵称",
            prop: "nickname",
            type: "input",
            clearable:true   
        },
         {
            label: "邮箱",
            prop: "email",
            type: "input",
            clearable:true
        }
    ])


    const rules = reactive<FormRules<RuleForm>>({
        email: [
            { type: 'email', message: '请输入正确的邮箱地址'}
        ]
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean],
        "success": []
    }>()

    const dialogVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value) 
    })

    // 确认
    const submit =  async () => {
        try{
            const res = await updatePersonalInfoApi({
                email: modelForm.email,
                nickname: modelForm.nickname
            })
            dialogVisible.value = false;
            dialogFormRef.value?.resetFields?.();
            userStore.fetchUserInfo();
            ElMessage({
                message: res.message || '新增用户成功',
                type: 'success',
                duration: 3000
            });
        }catch(error){
            console.log('表单提交错误:', error);
        }
    }

    watch(() => props.modelValue,(newVal) => {
        if(newVal){
            modelForm.username = props.data.username;
            modelForm.nickname = props.data.nickname;
            modelForm.email = props.data.email;
        }else{
           dialogFormRef.value?.clearValidate?.();
        }
    })

</script>

<style lang="scss" scoped>
</style>