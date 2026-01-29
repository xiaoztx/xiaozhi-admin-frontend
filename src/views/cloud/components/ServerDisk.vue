<template>
  <div class="tab-content">
    <div class="table-actions">
      <el-button type="primary" size="small">挂载云盘</el-button>
      <el-button size="small">扩容</el-button>
    </div>
    <el-table :data="mockDisks" style="width: 100%" stripe>
      <el-table-column prop="id" label="磁盘 ID" width="180">
        <template #default="{ row }">
          <span class="link-text">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
           <el-tag size="small" effect="plain">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="容量" width="120">
        <template #default="{ row }">
          <b>{{ row.size }} GB</b>
        </template>
      </el-table-column>
      <el-table-column prop="mount" label="挂载点">
        <template #default="{ row }">
          <code class="code-bg">{{ row.mount }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <div class="status-indicator">
            <span class="dot success"></span>
            {{ row.status }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
// 模拟数据
const mockDisks = [
  { id: 'd-bp12345678', type: '系统盘', size: 50, mount: '/dev/vda1', status: '使用中' },
  { id: 'd-bp87654321', type: '数据盘', size: 100, mount: '/dev/vdb1', status: '使用中' },
]
</script>

<style scoped lang="scss">
.table-actions {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.code-bg {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.link-text {
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    
    &.success { background-color: var(--color-success); }
    &.warning { background-color: var(--color-warning); }
  }
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--bg-tertiary);
  --el-table-row-hover-bg-color: var(--bg-tertiary);
  --el-table-border-color: var(--border-light);
  background-color: transparent;
  
  th.el-table__cell {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }
  
  tr {
    background-color: transparent;
  }
}
</style>
