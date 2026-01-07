<template>
  <el-dialog
    v-model="dialogVisible"
    width="600"
  >
  <template #title>
    <div class="title-container">{{ title }}</div>
  </template>
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
    modelValue: boolean,
    title?: string
}>()

const emit = defineEmits<{
    'update:modelValue':[value: boolean]
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue',value)
})

</script>
<style scoped lang="scss">
    .title-container{
        width: 100%;
        text-align: center;
    }
</style>