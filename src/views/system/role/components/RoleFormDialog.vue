<template>
    <div>
        <ProFormDialog 
            ref="dialogFormRef"
            v-model="dialogVisible" 
            :title="dialogTitle" 
            :modelForm="modelForm" 
            :formItemList="formItemList"
            :rules="rules"
            @submit="submit"
            @cancel="cancel"
            >
        </ProFormDialog>
    </div>
</template>
<script setup lang="ts">
    import {type FormRules,ElMessage} from 'element-plus'
    import type {formItem} from '@/components/ProForm/ProForm.vue'
    import {addRoleApi,updateRoleApi} from '@/api/role'
   
    const dialogFormRef = ref()
    interface RuleForm {
        id?: number | null,
        name: string,
        code: string,
        description?: string,
        status?: number,
    }
    const props = defineProps<{
        modelValue: boolean,
        type: 'create' | 'edit',
        title?: string,
        data?: Record<string,any>
    }>()

    // 对话框标题
    const dialogTitle = computed(() => {
        const typeMap = {
            'create': '新增角色',
            'edit': '编辑角色'
        };
        return props.title || typeMap[props.type] || '新增角色';
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
        id: null,
        name: "",
        code: "",
        description:"",
        // status: 1
    })
    const formItemList = reactive<formItem[]>([
        {
            label: "角色名称",
            prop: "name",
            type: "input",
            clearable:true,
            maxlength: 12,
            inputParse: (value: string) => {
                return value.replace(/\s+/g, '')
            }
        },
        {
            label: "角色编码",
            prop: "code",
            type: "input",
            clearable:true,
            maxlength: 20,
            inputParse: (value: string) => {
                return value.replace(/\s+/g, '')
            }
        },
        {
            label: "描述",
            prop: "description",
            type: "input",
            placeholder: "请输入角色描述，最长100个字符",
            clearable:true,
            maxlength: 100
        }
    ])

    const rules = reactive<FormRules<RuleForm>>({
        name:[
            { required: true,  message: '请输入角色名称' }
        ],
        code:[
            {  required: true, message: '请输入角色编码'},
            { 
                pattern: /^[a-zA-Z][a-zA-Z_]*$/, 
                message: '角色编码必须以字母开头，只能包含字母和下划线' 
            },
            {
             validator: (rule: any, value: string, callback: any) => {
                if (value && /__/.test(value)) {
                    callback(new Error('角色编码不能包含连续两个下划线'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
        ]
    })

         // 根据类型初始化表单
    const initFormByType = () => {
        // 重置表单
        resetForm();
        if(props.type == 'edit'){
            if (props.data) {
                console.log(`${props.type}模式：填充数据`, props.data);
                fillFormWithData(props.data);
            }  
        }
    }

    // 填充表单数据
    const fillFormWithData = (data: Record<string, any>) => {
            modelForm.id = data.id;
            modelForm.name = data.name;
            modelForm.code = data.code;
            modelForm.description = data.description;
            // modelForm.status = data.status;
    }

    
    // 重置表单
    const resetForm = () => {
        modelForm.id = null;
        modelForm.name = "";
        modelForm.code = ""
        modelForm.description = ""
        // modelForm.status = 1
        dialogFormRef.value?.clearValidate?.();
    }

    const submit = async () => {
       try {
            // 验证表单
            await dialogFormRef.value?.validate?.();
            const submitData = { ...modelForm };
            if (props.type === 'create') {
                const res = await addRoleApi(submitData);
                dialogVisible.value = false;
                dialogFormRef.value?.resetFields?.();
                ElMessage({
                    message: res.message || '新增用户成功',
                    type: 'success',
                    duration: 3000
                });
                emit('success');
            } else if (props.type === 'edit') {
                const res = await updateRoleApi(submitData);
                ElMessage({
                    message: res.message || '修改成功',
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
