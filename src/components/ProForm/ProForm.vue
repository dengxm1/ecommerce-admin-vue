<template>
    <view>
        <el-form :model="modelForm" :rules="rules" :ref="ref" :inline="inline">
            <view v-for="item in formItemList"  :style="getItemStyle(item.itemColStyle)">
                <el-form-item :label="item.label" :prop="item.prop">
                    <el-input
                        v-if="item.type == 'input'" 
                        v-model="modelForm[item.prop]" 
                        :placeholder="item.placeholder"
                        :clearable="item.clearable"
                    />
                    <el-select
                        v-if="item.type == 'select'"
                        v-model="modelForm[item.prop]"
                        :props="getSelectProps(item.selectProps)"
                        :options="item.options"
                        :placeholder="item.placeholder"
                        :clearable="item.clearable"
                        :style="item.style"
                        />
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
    import type { FormRules } from 'element-plus'
    import type { CSSProperties } from 'vue'
    const slots = useSlots()
    interface selectProps {
        value?: string,
        label?: string,
        disabled?: string
    }
    export interface formItem {
        label: string,
        prop: string,
        type: string,
        span?: number,
        placeholder?: string,
        options?: any[],
        selectProps?: selectProps,
        clearable?: boolean,
        style?: string | object,
        multiple?: boolean,
        itemColStyle?: string | CSSProperties
    }
    const props = defineProps<{
        ref: string,
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
</script>
<style scoped lang="scss"></style>