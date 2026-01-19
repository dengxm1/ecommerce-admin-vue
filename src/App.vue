<template>
  <RouterView />
</template>

<script setup lang="ts">
  import { useRoleStore } from "./stores/role.ts";
  const roleStore = useRoleStore();
  // 获取所有角色列表
  onMounted(() => {
    roleStore.fetchAllRoles();
  });
</script>

<style scoped lang="scss">
</style>
