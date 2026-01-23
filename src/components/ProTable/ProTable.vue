<template>
    <view class="table-section">
        <el-card shadow="never">
            <slot name="table-header"></slot>
            <el-table 
                v-loading="loading"
                :data="data" 
                style="width: 100%"
                :border="border"
                :stripe="stripe"
                :row-key="rowId"
                :default-expand-all="defaultExpandAll"
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
                    :formatter="column.columnFormatter"
                    >
                    <template #default="scope" v-if="column.tags && column.tagFormatter">
                        <el-tag 
                        :type="column.tagFormatter(scope.row,'style')" 
                        size="small"
                        effect="light"
                        class="status-tag"
                    >
                        {{column.tagFormatter(scope.row,'text') }}
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
                    :min-width="actionMinWidth"
                    :fixed="actionFixed">
                    <template #default="scope">
                        <slot name="action" v-bind="scope" />
                    </template>
                </el-table-column>
            </el-table>
           <div class="pagination-section" v-if="showPagination">
                <el-pagination
                  v-model:current-page="current"
                  v-model:page-size="size"
                  :page-sizes="pageSizes"
                  :layout="layout"
                  :total="total"
                  :background="background"
                  @change="paginationChange"
                />
              </div>
        </el-card>
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
        tagFormatter?: (row: any, type: 'text'| 'style') => any,
        columnFormatter?:(row: any, column: any, cellValue: any, index: number) => any,
        className?: string,
        labelClassName?: string,
        tags?: boolean
    }
    const props = withDefaults(defineProps<{
        rowId?: string,
        defaultExpandAll?: boolean,
        data: Array<Record<string, any>>,  //表格数据
        columns: TableColumn[],  //表格字段
        border?: boolean,
        stripe?: boolean,
        showSelection?: boolean,
        showIndex?: boolean,
        showAction?: boolean,  //是否显示操作栏
        actionWidth?: string | number,  //操作栏的宽度
        actionFixed?: boolean | 'left' | 'right',  //操作栏的固定位置
        actionMinWidth?: string | number,
        showPagination?: boolean, //是否显示分页
        currentPage?: number,   //当前页
        pageSize?: number, //每页显示条目个数
        pageSizes?: number[],  //每页显示个数选择器的选项设置
        total?: number, //分页总条目数
        layout?: string, //分页组件布局，子组件名用逗号分隔
        background?: boolean,
        loading?: boolean
    }>(),{
        columns: () => [],
        border:false,
        stripe: false,
        showSelection: false,
        showIndex: false,
        showAction: false,
        actionWidth: 200,
        actionMinWidth: 120,
        actionFixed: 'right',
        showPagination: true,
        pageSizes: () => [10,20,30,40,50,100],
        layout: "total, sizes, prev, pager, next, jumper",
        background: true,
        defaultExpandAll: false,
        loading: false
    }) 

const emit = defineEmits<{
    'handleSelectionChange': [newSelection: any[]],
    'update:currentPage': [current: number],
    'update:pageSize': [size: number],
    'paginationChange': []
}>()

// 当前页
const current = computed({
    get: () => props.currentPage,
    set: (current: number) => emit('update:currentPage',current)
})

// 每页显示条目数
const size = computed({
    get: () => props.pageSize,
    set: (size: number) => emit('update:pageSize',size)
})

// 选择项变化
const handleSelectionChange = (newSelection: any[]) => {
    emit('handleSelectionChange',newSelection)
}

// 当前页或每页显示条目数变化时触发
const paginationChange = () => {
   emit('paginationChange')
}


</script>
<style scoped lang="scss">
    /* 表格区域 */
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  
  :deep(.el-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-large);
    background: white;
    
    .el-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
    }
  }
  
  /* 分页 */
  .pagination-section {
    margin-top: 20px;
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

</style>