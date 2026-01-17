<template>
  <el-drawer 
    v-model="drawerVisible"
    :direction="direction"
    :title="drawerTitle"
    >
    <template #default>
        <el-scrollbar>
            <el-tree
                ref="treeRef"
                :data="treeData"
                show-checkbox
                node-key="id"
                :default-checked-keys="defaultCheckedKeys"
                :props="defaultProps"
                :default-expand-all="defaultExpandAll"
            />
        </el-scrollbar>
    </template> 
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
    import {type DrawerProps, type TreeOptionProps} from 'element-plus'
    import {usePermissionStore} from '@/stores/permission'
    import { type BackendMenuItem} from '@/utils/routeUtils'
    import {assignPermission} from '@/api/role'

    const treeRef = ref();
    const permissionStore = usePermissionStore();

    const setDisable = (data: BackendMenuItem[]) => {
        data.forEach((item: BackendMenuItem) => {
            item.disabled = true;
            if(item.children){
                setDisable(item.children);
            }
        })
        return data;
    }

    const defaultProps: TreeOptionProps = {
        label: 'name',
        children: 'children',
        disabled: 'disabled'
    }

    const props = withDefaults(defineProps<{
        modelValue: boolean,
        type: 'edit' | 'view',
        direction?: DrawerProps['direction'],
        defaultExpandAll?: boolean,
        defaultCheckedKeys?: Array<string | number>

    }>(),{
        direction: 'rtl',
        defaultExpandAll: false,
        defaultCheckedKeys: () => [] as (string | number)[]
    })

    const drawerTitle = computed(() => {
        const obj = {
            'edit': '分配权限',
            'view': '查看权限树'
        }
        return obj[props.type] || '查看权限树';
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
    }>()

    const drawerVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
    })

    const treeData = computed<BackendMenuItem[]>(() => {
        const data = JSON.parse(JSON.stringify(permissionStore.treeRoutes));
        if(props.type =='view'){
            const viewData = setDisable(data);
            return viewData;
        }
        return data
    })

    const cancelClick = () => {

    }

    const confirmClick = () => {
        console.log('getCheckedNodes()====',treeRef.value!.getCheckedNodes())
        console.log('getCheckedKeys()====',treeRef.value!.getCheckedKeys())
        console.log('getHalfCheckedKeys()====',treeRef.value!.getHalfCheckedKeys())
        console.log('getHalfCheckedNodes()====',treeRef.value!.getHalfCheckedNodes())
        
    }
</script>
<style scoped lang="scss">
    
</style>