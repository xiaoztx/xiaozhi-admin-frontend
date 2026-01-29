<template>
  <div class="server-table">
    <el-table 
      :data="serverList" 
      style="width: 100%" 
      @selection-change="handleSelectionChange"
      border
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="实例名称/ID" min-width="200">
        <template #default="{ row }">
          <div class="table-name-cell">
            <span class="link-text" @click="emit('detail', row)">{{ row.instance_name }}</span>
            <span class="sub-text">{{ row.instance_id }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
           <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="IP 地址" width="220">
        <template #default="{ row }">
          <div class="ip-cell">
            <div>
              <span class="label">公:</span> {{ row.public_ip }} 
              <el-icon class="copy-icon" @click="copyText(row.public_ip)"><CopyDocument /></el-icon>
            </div>
            <div class="sub-text">
              <span class="label">内:</span> {{ row.private_ip }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="配置" width="150">
        <template #default="{ row }">
          {{ row.cpu }}核 / {{ (row.memory / 1024).toFixed(1) }}GB
        </template>
      </el-table-column>
      <el-table-column label="操作系统" width="150" show-overflow-tooltip prop="os_name" />
      <el-table-column label="地域 / 可用区" width="220">
        <template #default="{ row }">
          <div>{{ getRegionLabel(row.region) }}</div>
          <div class="sub-text" style="color: var(--el-text-color-secondary); font-size: 12px;">
             {{ getZoneLabel(row.zone) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="到期时间" width="180">
        <template #default="{ row }">
          <span :class="{ 'text-danger': isExpiringSoon(row.expired_at) }">
             {{ formatDate(row.expired_at) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-space :size="8">
            <el-button link type="primary" size="small" @click="emit('detail', row)">详情</el-button>
            <el-button link type="primary" size="small" @click="emit('terminal', row)">终端</el-button>
            <el-dropdown trigger="click" @command="(cmd: any) => emit('action', row, cmd)">
              <el-button link type="primary" size="small">
                更多 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="start" :disabled="row.status === 'Running'">
                    <el-icon><VideoPlay /></el-icon> 开机
                  </el-dropdown-item>
                  <el-dropdown-item command="restart" :disabled="row.status !== 'Running'">
                    <el-icon><Refresh /></el-icon> 重启
                  </el-dropdown-item>
                  <el-dropdown-item command="stop" :disabled="row.status === 'Stopped'">
                    <el-icon><SwitchButton /></el-icon> 关机
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided style="color: var(--el-color-danger)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { 
  CopyDocument, ArrowDown, VideoPlay, Refresh, SwitchButton, Delete 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import type { CloudServer } from '@/api/cloud-server'
import { SERVER_STATUS_MAP } from '@/constants/cloud'
import { getRegionLabel, getZoneLabel } from '@/constants/region'
import dayjs from 'dayjs'

const props = defineProps<{
  serverList: CloudServer[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'selection-change', val: CloudServer[]): void
  (e: 'detail', row: CloudServer): void
  (e: 'terminal', row: CloudServer): void
  (e: 'action', row: CloudServer, action: string): void
}>()

const { toClipboard } = useClipboard()

const handleSelectionChange = (val: CloudServer[]) => {
  emit('selection-change', val)
}

const copyText = async (text: string) => {
  try {
    await toClipboard(text)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const getStatusType = (status: string) => {
  return SERVER_STATUS_MAP[status]?.type || 'info'
}

const getStatusLabel = (status: string) => {
  return SERVER_STATUS_MAP[status]?.label || status
}

const isExpiringSoon = (dateStr?: string) => {
  if (!dateStr) return false
  const expireDate = dayjs(dateStr)
  const diffDays = expireDate.diff(dayjs(), 'day')
  return diffDays <= 7 && diffDays >= 0
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY/MM/DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.server-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  
  .table-name-cell {
    display: flex;
    flex-direction: column;
    
    .link-text {
      color: var(--el-color-primary);
      cursor: pointer;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }
    .sub-text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-family: monospace;
    }
  }
  
  .ip-cell {
    font-family: monospace;
    font-size: 13px;
    
    .label {
      color: var(--el-text-color-placeholder);
      margin-right: 4px;
    }
    
    .sub-text {
      color: var(--el-text-color-secondary);
      margin-top: 2px;
    }
    
    .copy-icon {
      cursor: pointer;
      color: var(--el-color-primary);
      margin-left: 4px;
      vertical-align: middle;
      &:hover { opacity: 0.8; }
    }
  }

  .text-danger {
    color: var(--el-color-danger);
    font-weight: 500;
  }
}
</style>