<template>
  <div class="tab-content">
    <div class="table-actions">
      <!-- 移除扩容按钮，仅保留挂载云盘（此处可能也需要后续对接真实API，暂时保留） -->
      <el-button type="primary" size="small">挂载云盘</el-button>
    </div>
    <el-table :data="disks" style="width: 100%" stripe v-loading="loading">
      <el-table-column prop="disk_id" label="磁盘 ID" min-width="160">
        <template #default="{ row }">
          <span class="link-text">{{ row.disk_id || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="disk_usage" label="用途" min-width="100">
         <template #default="{ row }">
           <el-tag v-if="row.disk_usage === 'SYSTEM_DISK'" type="success" size="small" effect="plain">系统盘</el-tag>
           <el-tag v-else type="primary" size="small" effect="plain">数据盘</el-tag>
         </template>
      </el-table-column>
      <el-table-column prop="disk_type" label="类型" min-width="120">
        <template #default="{ row }">
           <el-tag size="small" effect="light">{{ row.disk_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="disk_size" label="容量" min-width="100">
        <template #default="{ row }">
          <b>{{ row.disk_size }} GB</b>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
           <div class="status-indicator">
             <span class="dot" :class="getStatusClass(row.status)"></span>
             {{ getStatusLabel(row.status) }}
           </div>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="delete_with_instance" label="随实例销毁" min-width="100">
        <template #default="{ row }">
           <el-tag v-if="row.delete_with_instance" type="danger" size="small" effect="plain">是</el-tag>
           <el-tag v-else type="info" size="small" effect="plain">否</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getServerDisks, type CloudDisk } from '../../../api/cloud-server'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  serverId: number | string
}>()

const disks = ref<CloudDisk[]>([])
const loading = ref(false)

const fetchData = async () => {
  if (!props.serverId) return
  loading.value = true
  try {
    const res = await getServerDisks(Number(props.serverId))
    // 假设 res.data 或 res 是数组，根据 axios 封装
    disks.value = res as unknown as CloudDisk[]
  } catch (error) {
    console.error(error)
    ElMessage.error('获取云盘数据失败')
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  if (!status) return ''
  const s = status.toUpperCase()
  if (s === 'ATTACHED' || s === 'IN_USE') return 'success'
  if (s === 'UNATTACHED' || s === 'AVAILABLE') return 'warning'
  return 'info'
}

const getStatusLabel = (status: string) => {
  if (!status) return '-'
  const s = status.toUpperCase()
  const map: Record<string, string> = {
    'ATTACHED': '已挂载',
    'IN_USE': '使用中',
    'UNATTACHED': '未挂载',
    'AVAILABLE': '待挂载',
    'EXPANDING': '扩容中',
    'ROLLBACKING': '回滚中',
    'DUMPING': '拷贝中'
  }
  return map[s] || status
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

onMounted(() => {
  fetchData()
})
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
