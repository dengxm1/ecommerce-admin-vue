
<template>
  <el-drawer
    v-model="drawerVisible"
    :title="message?.title || '消息详情'"
    :size="500"
    destroy-on-close
  >
    <div v-if="message" class="message-detail">
      <!-- 消息头部 -->
      <div class="detail-header">
        <el-tag :type="getTypeTag(message.type)" size="large">
          {{ getTypeName(message.type) }}
        </el-tag>
        <span class="detail-time">{{ formatTime(message.createTime) }}</span>
      </div>

      <!-- 消息内容 -->
      <div class="detail-content">
        <p>{{ message.content }}</p>
      </div>

      <!-- 额外数据 -->
      <div v-if="message.data" class="detail-data">
        <h4>附加信息</h4>
        <pre>{{ JSON.stringify(message.data, null, 2) }}</pre>
      </div>

      <!-- 底部按钮 -->
      <div class="detail-footer">
        <el-button 
          v-if="message.status === 0"
          type="primary" 
          @click="handleMarkRead"
        >
          标记为已读
        </el-button>
        <el-button type="danger" @click="handleDelete">
          删除
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
// ... 类似之前的 NotificationDetailDrawer
</script>