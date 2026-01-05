<template>
    <div>
        <ProTable :data="tableData" :columns="columns" showAction>
            <template #action="scope">
                <view>删除</view>
            </template>
        </ProTable>
    </div>
</template>
<script setup lang="ts">
    import {type TableColumn} from '@/components/ProTable/ProTable.vue'
    const tableData = ref([
        {
          name: '超级管理员',
          code: 'super_admin',
          createdAt: '2025-01-05',
          updatedAt: '2025-01-05'
        },
         {
          name: '商品管理员',
          code: 'product_admin',
          createdAt: '2025-01-05',
          updatedAt: '2025-01-05'
        },
         {
          name: '仓库管理员',
          code: 'cangku_admin',
          createdAt: '2025-01-05',
          updatedAt: '2025-01-05'
        },
    ])
    const columns = ref<TableColumn[]>([
        {
            prop: 'name',
            label:'名称',
            headerAlign:'center'
        },
        {
            prop: 'code',
            label:'角色编码',
        },
        {
            prop: 'createdAt',
            label:'创建时间'
        },
        {
            prop: 'updatedAt',
            label:'更新时间'
        }
    ])
</script>
<style scoped lang="scss"></style>