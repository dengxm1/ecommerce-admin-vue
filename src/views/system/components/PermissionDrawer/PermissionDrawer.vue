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
                :props="defaultProps"
                :default-checked-keys="defaultCheckedKeys"
                :default-expand-all="defaultExpandAll"
            />
        </el-scrollbar>
    </template> 
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" v-if="allowConfirm" @click="confirmClick">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
    import {type DrawerProps, type TreeOptionProps} from 'element-plus'
    import {usePermissionStore} from '@/stores/permission'
    import { type BackendMenuItem} from '@/utils/routeUtils'
    import {assignPermission, getRoleMenuIds} from '@/api/role'


    const treeRef = ref();
    const permissionStore = usePermissionStore();

    
    // 递归设置树节点禁用状态
    const setDisable = (data: BackendMenuItem[]) => {
        data.forEach((item: BackendMenuItem) => {
            item.disabled = true;
            if(item.children){
                setDisable(item.children);
            }
        })
        return data;
    }

    // 树节点属性配置
    const defaultProps: TreeOptionProps = {
        label: 'name',
        children: 'children',
        disabled: 'disabled'
    }

    const props = withDefaults(defineProps<{
        roleId?: number | null,
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


    // 抽屉标题
    const drawerTitle = computed(() => {
        const obj = {
            'edit': '分配权限',
            'view': '查看权限树'
        }
        return obj[props.type] || '查看权限树';
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean],
        'confirm': [value?: boolean]
    }>()

    // 抽屉显示与否
    const drawerVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
    })

    // 权限树数据
    const treeData = computed<BackendMenuItem[]>(() => {
        const data = JSON.parse(JSON.stringify(permissionStore.treeRoutes));
        if(props.type =='view' && !props.roleId){
            const viewData = setDisable(data);
            return viewData;
        }
        return data
    })

    // 抽屉取消按钮
    const cancelClick = () => {
        drawerVisible.value = false;
    }

    // 确认按钮点击
    const confirmClick = () => {
        if(props.type ==='view'){
            drawerVisible.value = false;
            return;
        }
        if(props.type ==='edit'){
            drawerVisible.value = false;
            const CheckedKeys = treeRef.value!.getCheckedKeys() as Array<string | number>;
            const HalfCheckedKeys = treeRef.value!.getHalfCheckedKeys() as Array<string | number>;
            const allKeys = Array.from(new Set([...CheckedKeys, ...HalfCheckedKeys]));
              if(props.roleId == null){
                    ElMessage.error('角色ID不能为空')
                    return;
                }
                assignPermission({roleId: props.roleId, menuIds: allKeys})
                    .then(() => {
                        ElMessage.success('权限分配成功')
                        drawerVisible.value = false;
                        emit('confirm', true);
                    })
                    .catch((error) => {
                     ElMessage.error('权限分配失败')
                    })
        }

    }

    // 递归设置树节点选中状态
    const setTreeCheckedKeys = (treeList: BackendMenuItem[], menuIds: Array<string | number>) => {
        treeList.forEach(tree => {
            if(!tree.children || tree.children.length ===0){
                if(menuIds.includes(tree.id)){
                    treeRef.value?.setChecked(tree.id, true, false);
            }
            }else {
                setTreeCheckedKeys(tree.children, menuIds);
            }
        })
    }

    // 是否显示确认按钮
    const allowConfirm = computed(() => {
        if(props.type ==='view'){
            return false;
        }
        return true;
    })

// 监听抽屉显示与否变化
watch(() => drawerVisible.value, async (newVal, oldVal) => {
    await nextTick()
    if (!treeRef.value) return
    if (newVal) {
        // 抽屉打开：如果有角色ID，则加载数据
        if (props.roleId != null) {
            try {
                const res = await getRoleMenuIds(props.roleId); // 获取角色权限菜单ID
                if (res.data) {
                    const menuIds = res.data as Array<string | number>;
                    if(menuIds.length ===0) return;
                    setTreeCheckedKeys(treeData.value,menuIds);
                }
            } catch (error) {
                console.error('获取角色权限菜单ID失败', error)
            }
        }
    } else if (oldVal && !newVal) {
        // 从打开变为关闭时才清空
        treeRef.value.setCheckedKeys([]);
    }
})

</script>
<style scoped lang="scss">
    
</style>