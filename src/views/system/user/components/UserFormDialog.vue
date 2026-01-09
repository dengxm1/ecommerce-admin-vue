<template>
    <div>
        <ProDialog 
            v-model="dialogVisible" 
            :title="title" 
            :modelForm="modelForm" 
            :formItemList="formItemList"
            :rules="rules"
            @submit="submit"
            @cancel="cancel"
            >
            <template #append>
                <div class="simple-tip">
                     <p>温馨提示：用户创建后默认没有角色，无法访问系统。请在用户列表中使用"分配角色"功能为用户分配权限。建议设置简单初始密码，让用户首次登录时自行修改。</p>
                </div>
            </template>
        </ProDialog>
    </div>
</template>
<script setup lang="ts">
    import {type FormRules} from 'element-plus'
    import type {formItem} from '@/components/ProForm/ProForm.vue'

    interface RuleForm {
        username: string,
        password: string,
        nickname: string,
        email: string,
        phone: string,
        avatar: string,
        enabled: boolean
    }
    const props = defineProps<{
        modelValue: boolean,
        title?: string
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
    }>()

    const dialogVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value) 
    })
    const modelForm = reactive<RuleForm>({
        username: "",
        password: "",
        nickname: "",
        email: "",
        phone: "",
        avatar: "",
        enabled: false
    })
    const formItemList = reactive<formItem[]>([
        {
            label: "用户名",
            prop: "username",
            type: "input",
            clearable:true
        },
        {
            label: "密码",
            prop: "password",
            type: "password"
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
            clearable:true,
            append: ".com",
            slotContent: ".com"  
        },
        {
            label: "手机号",
            prop: "phone",
            type: "tel",
            clearable:true
        },
        // {
        //     label: "头像",
        //     prop: "avatar",
        //     type: "upload",
        // },
         {
            label: "是否禁用",
            prop: "enabled",
            type: "switch",
        },
    ])

    const rules = reactive<FormRules<RuleForm>>({
        username:[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 8, message: '用户名长度必须在3-8个字符以内'}
        ],
        password:[
            {  required: true,message: '请输入密码'},
            { min: 3, max: 8, message: '密码长度必须在6-16个字符以内'}
        ],

    })

    const submit = () =>{
        console.log('提交提交==',modelForm)
    }

    const cancel = () => {
        console.log('取消取消取消==',modelForm)
    }
</script>
<style scoped lang="scss">
  .simple-tip {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 20px;
  border-left: 4px solid #909399;
  
  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: #606266;
  }
}
</style>
