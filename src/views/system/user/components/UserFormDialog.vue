<template>
    <div>
        <ProDialog v-model="dialogVisible" :title="title">
        </ProDialog>
    </div>
</template>
<script setup lang="ts">
    const props = defineProps<{
        modelValue: boolean,
        title?: string
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
    }>()

    const dialogVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value) 
    })
</script>
<style scoped lang="scss"></style>
