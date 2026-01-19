import { ref } from 'vue'
import { defineStore } from 'pinia'
import {getAllRolesApi} from '@/api/role'

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  menuPermissionCount?: number
  buttonPermissionCount?: number
  userCount?: number
  isSystem?: boolean
  createdAt?: string
}


export const useRoleStore = defineStore('role',()=>{

    // 角色列表(全部)
    const roleList = ref<Role[]>([])

    // 获取所有角色列表
    const fetchAllRoles = async () => {
       try{
            const res = await getAllRolesApi();
            roleList.value = res.data || []
            return res
       }
         catch(error){
            throw error
       }
    }

    return {
        roleList,
        fetchAllRoles
    }
})