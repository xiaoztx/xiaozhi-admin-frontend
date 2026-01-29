<template>
  <div class="tab-content">
     <div class="table-actions">
      <el-button type="primary" size="small">添加规则</el-button>
      <el-button size="small">配置规则</el-button>
    </div>
    <el-table :data="mockRules" style="width: 100%">
      <el-table-column prop="protocol" label="协议" width="100" />
      <el-table-column prop="port" label="端口范围" width="150">
        <template #default="{ row }">
          <code class="code-bg">{{ row.port }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="来源 IP" width="180" />
      <el-table-column prop="policy" label="策略">
        <template #default="{ row }">
          <el-tag :type="row.policy === 'accept' ? 'success' : 'danger'" size="small" effect="dark">
            {{ row.policy === 'accept' ? '允许' : '拒绝' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="描述" />
    </el-table>
   </div>
</template>

<script setup lang="ts">
const mockRules = [
  { protocol: 'TCP', port: '22', source: '0.0.0.0/0', policy: 'accept', desc: 'SSH 远程连接' },
  { protocol: 'TCP', port: '80', source: '0.0.0.0/0', policy: 'accept', desc: 'HTTP Web 服务' },
  { protocol: 'TCP', port: '443', source: '0.0.0.0/0', policy: 'accept', desc: 'HTTPS Web 服务' },
  { protocol: 'ICMP', port: '-1/-1', source: '0.0.0.0/0', policy: 'accept', desc: '允许 Ping' },
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--bg-tertiary);
  --el-table-row-hover-bg-color: var(--bg-tertiary);
  --el-table-border-color: var(--border-light);
  background-color: transparent;
  
  th.el-table__cell {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  tr {
    background-color: transparent;
  }
  
  td.el-table__cell {
    border-bottom: 1px solid var(--border-light);
  }
}
</style>
