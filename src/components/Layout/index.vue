<template>
    <el-container class="layout-container">
        <Sidebar/>
        <el-container direction="vertical">
            <Header/>
            <el-main>
                <RouterView/>
            </el-main>
        </el-container>
    </el-container>
</template>
<script setup lang="ts"> 

</script>
<style scoped>
    .layout-container{
        height: 100vh;
        overflow: hidden;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    }
</style>