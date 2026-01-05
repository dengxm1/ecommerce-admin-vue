<template>
    <view>
        <el-table 
            :data="data" 
            style="width: 100%"
            :border="border"
            :stripe="stripe"
            @selection-change="handleSelectionChange"
            >
             <!-- 选择列 -->
            <el-table-column v-if="showSelection" type="selection" width="55"></el-table-column>
             <!-- 序号列 -->
            <el-table-column v-if="showIndex" type="index"  width="80"></el-table-column>
            <!-- 动态列 -->
            <el-table-column 
                v-for="column in columns"
                :prop="column.prop" 
                :label="column.label" 
                :width="column.width"
                :minWidth="column.minWidth"
                :fixed="column.fixed"
                :sortable="column.sortable"
                :align="column.align"
                :headerAlign="column.headerAlign"
                :sortOrders="column.sortOrders"
                :class-name="column.className"
                :label-class-name="column.labelClassName"
                >
                 <template #default="scope" v-if="column.tags && column.formatter">
                    <el-tag 
                    :type="column.formatter(scope.row,'style')" 
                    size="small"
                    effect="light"
                    class="status-tag"
                >
                    {{column.formatter(scope.row,'text') }}
                </el-tag>
                </template>
                <template #default="scope" v-else-if="column.slot">
                    <slot :name="column.slot" v-bind="scope"></slot>
                </template>
            </el-table-column>
            <!--  操作列 -->
            <el-table-column 
                v-if="showAction" 
                label="操作" 
                :width="actionWidth" 
                :fixed="actionFixed">
                <template #default="scope">
                    <slot name="action" v-bind="scope" />
                </template>
            </el-table-column>
        </el-table>
    </view>
</template>
<script setup lang="ts">
    export  interface TableColumn{
        type?: 'default' | 'selection' | 'index' | 'expand',
        prop?: string,
        label?: string,
        width?: string | number,
        minWidth?: string | number,
        fixed?: boolean | 'left' | 'right',
        align?: 'left' | 'center' | 'right',
        headerAlign?: 'left' | 'center' | 'right',
        sortable?: boolean | 'custom',
        sortOrders?: Array<'ascending' | 'descending' | null>,
        slot?: string,  // 自定义内容插槽名
        headerSlot?: string,  // 自定义表头插槽名
        formatter?: (row: any, type: 'text'| 'style') => any,
        className?: string,
        labelClassName?: string,
        tags?: boolean
    }
    const props = withDefaults(defineProps<{
        data: Array<Record<string, any>>,
        columns: TableColumn[],
        border?: boolean,
        stripe?: boolean,
        showSelection?: boolean,
        showIndex?: boolean,
        showAction?: boolean,
        actionWidth?: string | number,
        actionFixed?: boolean | 'left' | 'right'
    }>(),{
        columns: () => [],
        border:false,
        stripe: false,
        showSelection: false,
        showIndex: false,
        showAction: false,
        actionWidth: 150,
        actionFixed: 'right'
    }) 

    const handleSelectionChange = (newSelection: any[]) => {
        console.log('newSelection==',newSelection)
    }
</script>
<style scoped lang="scss"></style>