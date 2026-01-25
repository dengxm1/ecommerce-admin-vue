<template>
    <el-dialog
        v-model="dialogVisible"
        title="关联用户"
    >
    <ProTable
        :data="tableData"
        :columns="columns"
        stripe
        :loading="loading"
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        @paginationChange="paginationChange"
    >
    <template #table-header>
        <ProForm ref="searchFormRef" :modelForm="searchForm" :formItemList="searchFormList" inline>
            <template #footer>
                <el-button 
                    type="primary" 
                    :icon="Search" 
                    @click="handleSearch"
                >
                    搜索
                </el-button>
                <el-button 
                    :icon="Refresh" 
                    @click="handleReset"
                >
                    重置
                </el-button>
            </template>
      </ProForm>
    </template>
    </ProTable>
     <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
    </el-dialog>
</template>
<script setup lang="ts">
import ProTable from '@/components/ProTable/ProTable.vue';
import type { TableColumn } from '@/components/ProTable/ProTable.vue';
import { getUserListApi } from '@/api/user';
import dayjs from 'dayjs'
// 图标
import {Search,Refresh} from '@element-plus/icons-vue'

const props = defineProps<{
    modelValue: boolean,
    roleId: number | null
}>()

const emit = defineEmits<{
    'update:modelValue':[value: boolean]
}>()
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue',value)
})

const searchForm = reactive({
  keyword: '',
  isEnabled: '',
})

const searchFormList = computed(() => [
  {
    type:'input',
    label:'关键词',
    prop:'keyword',
    placeholder:'用户名/昵称/邮箱/手机号',
    clearable: true,
    style:'width: 200px',
    keyEnter: () => {
      fetchUserList()
    },
    clear: () => {
      fetchUserList()
    }
  },
  {
    type:'select',
    label:'状态',
    prop:'isEnabled',
    placeholder:'全部状态',
    clearable: true,
    style:'width: 120px',
    options:[
      {
        id: 1,
        label:'启用'
      },
       {
        id: 0,
        label:'禁用'
      }
    ],
    clear: () => {
      fetchUserList()
    }
  },
])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const loading = ref(false);

const searchFormRef = ref()

const tableData = ref<Array<Record<string,any>>>([]);

const columns = ref<TableColumn[]>([
    {
        prop: 'username',
        label: '用户名',
    },
     {
        prop: 'nickname',
        label: '昵称',
        columnFormatter: (row, column, cellValue) => {
          return cellValue || '--';
        }
    },
    {
        prop: 'email',
        label: '邮箱',
        columnFormatter: (row, column, cellValue) => {
          return cellValue || '--';
        }
    },
    {
        prop: 'phone',
        label: '手机号',
        columnFormatter: (row, column, cellValue) => {
          return cellValue || '--';
        }
    },
    {
        prop: 'status',
        label: '状态',
        width: 80,
        tags: true,
        tagFormatter:(row,type) => {
          if(type == 'text'){
            return row.isEnabled == 1 ? '启用' : '禁用';
          }else{
            return row.isEnabled == 1 ? 'success' : 'danger'
          }
          
        }
    },
    {
        prop: 'createdAt',
        label: '创建时间',
        columnFormatter: (row, column, cellValue) => {
          return formatTime(cellValue);
        }
    }
])

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.current = 1;
  pagination.size = 10;
  pagination.total = 0;
  fetchUserList()
}

watch(() => props.roleId, (newRoleId) => {
    if(newRoleId !== null){
      fetchUserList();
    }
})


const fetchUserList = async () => {
    try{
        if(props.roleId === null) return;
        loading.value = true;
        let params = Object.assign({},{
            roleId: props.roleId,
            pageNum: pagination.current,
            pageSize: pagination.size
        }, searchForm);
        const res = await getUserListApi(params);
        if(res.data){
            tableData.value = res.data.list;
            pagination.total = res.data.total;
        }
    }
    catch(error){
        console.error('Failed to fetch users:', error);
         ElMessage.error('获取用户列表失败')
    }
    finally{
         setTimeout(() => {
      loading.value = false
    }, 200)
    }
}

const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

const cancel = () => {
    dialogVisible.value = false;
}

// 当前页或每页显示条目数变化时触发
const paginationChange = () => {
    console.log('paginationChange',pagination.size)
  fetchUserList()
}
</script>
<style lang="css" scoped></style>