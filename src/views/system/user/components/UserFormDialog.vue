<template>
    <div>
        <ProDialog 
            ref="dialogFormRef"
            v-model="dialogVisible" 
            :title="dialogTitle" 
            :modelForm="modelForm" 
            :formItemList="currentFormItemList"
            :rules="currentRules"
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
    import {type FormRules,ElMessage, ElStep} from 'element-plus'
    import type {formItem} from '@/components/ProForm/ProForm.vue'
    import {addUserApi} from '@/api/user'
    const dialogFormRef = ref()
    interface RuleForm {
        username: string,
        password?: string,
        confirmPassword?: string,
        nickname?: string,
        email?: string,
        phone?: string,
        avatar?: string,
        enabled?: boolean
    }
    const props = defineProps<{
        modelValue: boolean,
        type: 'create' | 'edit' | 'view',
        title?: string,
        data?: Record<string,any>
    }>()

    // 对话框标题
    const dialogTitle = computed(() => {
        const typeMap = {
            'create': '新增用户',
            'edit': '编辑用户',
            'view': '查看用户'
        };
        return props.title || typeMap[props.type] || '用户信息';
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean],
        "success": []
    }>()

    const dialogVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value) 
    })
    const modelForm = reactive<RuleForm>({
        username: "",
        password: "",
        confirmPassword:"",
        nickname: "",
        email: "",
        phone: "",
        avatar: "",
        enabled: false
    })
    const baseFormItemList = reactive<formItem[]>([
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
            label: "确认密码",
            prop: "confirmPassword",
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

    const baseRules = reactive<FormRules<RuleForm>>({
        username:[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 8, message: '用户名长度必须在3-8个字符以内'}
        ],
        password:[
            {  required: true,message: '请输入密码'},
            { min: 3, max: 8, message: '密码长度必须在6-16个字符以内'}
        ],
        confirmPassword:[
            {required: true,message: '请输入确认密码'},
            { 
                validator(rule, value, callback) {
                  if(value != modelForm.password){
                    callback(new Error('两次输入的密码不一致'))
                  }else{
                    callback()
                  }
                },
            },
        ],
        email: [
            { type: 'email', message: '请输入正确的邮箱地址'}
        ],
        phone: [
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码'}
        ]
    })

     // 根据类型动态返回表单字段
    const currentFormItemList = computed(() => {
        if (props.type === 'create') {
            // 创建模式：显示所有字段
            return baseFormItemList;
        } else if (props.type === 'edit' || props.type === 'view') {
            // 编辑和查看模式：过滤掉密码字段
            return baseFormItemList.filter(item => 
                item.prop !== 'password' && item.prop !== 'confirmPassword'
            ).map(item => {
                // 如果是查看模式，所有字段设置为只读
                if (props.type === 'view') {
                    return {
                        ...item,
                        disabled: true
                    }
                }
                return item;
            });
        }
        return baseFormItemList;
    })

     // 根据类型动态返回表单规则
    const currentRules = computed(() => {
        // 如果是查看模式，不需要任何验证
        if (props.type === 'view') {
            return {} as FormRules<RuleForm>;
        }
        const rules = JSON.parse(JSON.stringify(baseRules)) as Record<string, any>;
        // 编辑模式：删除密码相关的验证规则
        if (props.type === 'edit') {
            delete rules.password;
            delete rules.confirmPassword;
        }
        return rules as FormRules<RuleForm>;
    })

     // 根据类型初始化表单
    const initFormByType = () => {
        // 重置表单
        resetForm();
        switch (props.type) {
            case 'create':
                modelForm.password = "";
                modelForm.confirmPassword = "";
                setTimeout(() => {
                    dialogFormRef.value?.clearValidate?.();
                }, 50);
                break;
                
            case 'edit':
            case 'view':
                // 编辑和查看模式：填充数据
                if (props.data) {
                    console.log(`${props.type}模式：填充数据`, props.data);
                    fillFormWithData(props.data);
                    
                    // 对于编辑模式，密码字段不需要显示数据
                    // if (props.type === 'edit') {
                    //     modelForm.password = '';
                    //     modelForm.confirmPassword = '';
                    // }
                }
                break;
            // case 'view':
            //     if (props.data) {
            //         fillFormWithData(props.data);
            //         delete modelForm.password;
            //         delete modelForm.confirmPassword;
            //     }
            //     break;
        }
    }

    // 填充表单数据
    const fillFormWithData = (data: Record<string, any>) => {
        Object.keys(modelForm).forEach(key => {
            const typedKey = key as keyof RuleForm;  
            if (typedKey in data && data[typedKey] !== undefined) {
                if (typedKey === 'enabled') {
                    modelForm[typedKey] = Boolean(data[typedKey]);
                } else {
                    modelForm[typedKey] = data[typedKey];
                }
            }
        });
    }

    
    // 重置表单
    const resetForm = () => {
            modelForm.username = "";
            modelForm.password = ""
            modelForm.confirmPassword = ""
            modelForm.nickname = ""
            modelForm.email = ""
            modelForm.phone = ""
            modelForm.avatar = ""
            modelForm.enabled = false
    //    dialogFormRef.value?.resetFields?.();
    }

    const submit = async () => {
    //    try{
    //      delete modelForm['confirmPassword'];
    //      const res = await addUserApi(modelForm);
    //      dialogVisible.value = false;
    //      dialogFormRef.value?.resetFields()
    //       ElMessage({
    //         message: res.message || '新增用户成功',
    //         type: 'success',
    //         duration: 3000
    //     })
    //    }catch(err){
    //     console.log('err====',err)
    //    }
       try {
            // 验证表单
            await dialogFormRef.value?.validate?.();
            const submitData = { ...modelForm };
            if (props.type !== 'create') {
                delete submitData.password;
                delete submitData.confirmPassword;
            } else {
                // 创建模式：确认密码字段不需要提交
                delete submitData.confirmPassword;
            }
            // 根据类型调用不同的 API
            if (props.type === 'create') {
                const res = await addUserApi(submitData);
                dialogVisible.value = false;
                dialogFormRef.value?.resetFields?.();
                ElMessage({
                    message: res.message || '新增用户成功',
                    type: 'success',
                    duration: 3000
                });
                emit('success');
            } else if (props.type === 'edit') {
                // const res = await editUserApi(submitData);
                console.log('编辑用户:', submitData);
                ElMessage({
                    message: '编辑用户成功',
                    type: 'success',
                    duration: 3000
                });
                dialogVisible.value = false;
                dialogFormRef.value?.resetFields?.();
                emit('success');
            } else if (props.type === 'view') {
                dialogVisible.value = false;
            }
        } catch(err) {
            console.log('表单提交错误:', err);
        }
    }

    const cancel = () => {
        console.log('取消取消取消==',modelForm)
    }

    watch(() => props.modelValue,(newVal) => {
         if (newVal) {
            initFormByType();
        }else{
            resetForm()
        }
    },{
        immediate: true
    })

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
