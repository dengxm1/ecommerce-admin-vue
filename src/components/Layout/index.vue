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
    /* .main-container {
        padding: 20px;
        background-color: #f5f7fa;
        position: relative;
    
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, 
                var(--ecommerce-primary) 0%, 
                var(--ecommerce-secondary) 50%, 
                var(--ecommerce-accent) 100%);
            z-index: 1;
        }
    } */

    /* .main-content {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
        padding: 24px;
        min-height: calc(100vh - 104px); 
        position: relative;
        z-index: 0;
    } */
</style>