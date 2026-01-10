<template>
    <view>
        <el-form 
            :model="modelForm" 
            :rules="rules" 
            ref="proFormRef" 
            :inline="inline"
            :label-position="labelPosition"
            :label-width="labelWidth"
            >
            <view v-for="item in formItemList"  :style="getItemStyle(item.itemColStyle)">
                <el-form-item :label="item.label" :prop="item.prop">
                    <el-input
                        v-if="getInputType(item.type)" 
                        :type="item.type"
                        v-model="modelForm[item.prop]" 
                        :placeholder="item.placeholder|| `请输入${item.label}`"
                        :clearable="item.clearable"
                        :show-password="item.type == 'password'"
                    >
                       <template v-if="item.append" #append>
                            {{ item.append }}
                       </template> 
                    </el-input>
                    <el-select
                        v-if="item.type == 'select'"
                        v-model="modelForm[item.prop]"
                        :props="getSelectProps(item.selectProps)"
                        :options="item.options"
                        :placeholder="item.placeholder||`请选择${item.label}`"
                        :clearable="item.clearable"
                        :style="item.style"
                        />
                    <el-switch v-if="item.type == 'switch'" v-model="modelForm[item.prop]" />
                    <el-date-picker
                        v-if="item.type == 'dateRange'"
                        v-model="modelForm[item.prop]"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="YYYY-MM-DD"
                        :style="item.style"
                    />
                </el-form-item>
            </view>
            <view v-if="slots.footer">
                 <el-form-item>
                    <slot name="footer"></slot>
                 </el-form-item>
            </view>
        </el-form>
    </view>
</template>
<script setup lang="ts">
    import type { FormRules, FormInstance } from 'element-plus'
    import type { CSSProperties } from 'vue'
    const slots = useSlots()

    const proFormRef = ref<FormInstance>()
    interface selectProps {
        value?: string,
        label?: string,
        disabled?: string
    }
    export interface formItem {
        label: string,
        prop: string,
        type: string,
        placeholder?: string,
        append?: string,
        slotContent?: string,
        options?: any[],
        selectProps?: selectProps,
        clearable?: boolean,
        style?: string | object,
        multiple?: boolean,
        itemColStyle?: string | CSSProperties
    }
    const props = defineProps<{
        labelPosition?: 'left' | 'right' | 'top',
        labelWidth?: string | number,
        modelForm: Record<string,any>,
        rules?: FormRules,
        formItemList: formItem[],
        inline?: boolean,
        showAction?: boolean
    }>()

    const getItemStyle= (itemColStyle?:string | CSSProperties) => {
        if (!itemColStyle) {
            return {} as CSSProperties
        }
        return itemColStyle
    }

    const getSelectProps = (props?: selectProps) => {
        const defaultProps = {
            value: 'id',
            label: 'label',
            disabled: 'disabled'
        }
        return {
            ...defaultProps,
            ...props
        }
    }
    const getInputType = (type: string) => {
        return type == 'input' || type == 'password' || type =='tel' || type== 'password'
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
    defineExpose({
        validate,
        resetFields,
        clearValidate
    })
</script>
<style scoped lang="scss"></style>