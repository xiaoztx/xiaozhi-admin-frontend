<template>
  <div class="server-list">
    <el-empty v-if="serverList.length === 0" description="暂无服务器数据" />
    <el-row :gutter="20" v-else>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="server in serverList" :key="server.id">
        <el-card class="server-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="server-name" :title="server.instance_name" @click="emit('detail', server)">
                <span class="status-dot" :class="server.status.toLowerCase()"></span>
                {{ server.instance_name }}
              </div>
              <el-tag size="small" :type="getStatusType(server.status)">{{ getStatusLabel(server.status) }}</el-tag>
            </div>
          </template>
          
          <div class="card-body">
            <div class="info-item">
              <span class="label">公网 IP:</span>
              <span class="value copyable" @click="copyText(server.public_ip)">
                {{ server.public_ip }}
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </span>
            </div>
            <div class="info-item">
              <span class="label">配置:</span>
              <span class="value">{{ server.cpu }}vCPU / {{ (server.memory / 1024).toFixed(1) }}GB</span>
            </div>
            <div class="info-item">
              <span class="label">地域:</span>
              <span class="value">
                {{ getRegionLabel(server.region) }} 
                <span style="color: var(--el-text-color-placeholder)">|</span> 
                {{ getZoneLabel(server.zone) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">到期:</span>
              <span class="value" :class="{ 'text-danger': isExpiringSoon(server.expired_at) }">
                {{ formatDate(server.expired_at) }}
              </span>
            </div>
          </div>

          <div class="card-footer">
             <el-button-group style="width: 100%; display: flex;">
               <el-tooltip content="开机" placement="top" :show-after="500">
                 <el-button size="small" :icon="VideoPlay" :disabled="server.status === 'Running'" @click="emit('action', server, 'start')" style="flex: 1" />
               </el-tooltip>
               <el-tooltip content="关机" placement="top" :show-after="500">
                 <el-button size="small" :icon="SwitchButton" :disabled="server.status === 'Stopped'" @click="emit('action', server, 'stop')" style="flex: 1" />
               </el-tooltip>
               <el-tooltip content="终端" placement="top" :show-after="500">
                 <el-button size="small" :icon="Monitor" @click="emit('terminal', server)" style="flex: 1" />
               </el-tooltip>
               <el-tooltip content="详情" placement="top" :show-after="500">
                 <el-button size="small" :icon="More" @click="emit('detail', server)" style="flex: 1" />
               </el-tooltip>
             </el-button-group>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { 
  VideoPlay, SwitchButton, Monitor, More, CopyDocument 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import type { CloudServer } from '@/api/cloud-server'
import { SERVER_STATUS_MAP } from '@/constants/cloud'
import { getRegionLabel, getZoneLabel } from '@/constants/region'
import dayjs from 'dayjs'

defineProps<{
  serverList: CloudServer[]
}>()

const emit = defineEmits<{
  (e: 'detail', row: CloudServer): void
  (e: 'terminal', row: CloudServer): void
  (e: 'action', row: CloudServer, action: string): void
}>()

const { toClipboard } = useClipboard()

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
.server-card {
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
    
    .server-name {
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1; /* Allow taking available space */
      min-width: 0; /* Enable flex item shrinking */
      margin-right: 8px; /* Add spacing between name and tag */
      cursor: pointer;
      color: var(--text-primary);
      transition: color 0.2s;
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  
  .card-body {
    padding: 20px;
    font-size: 14px;
    color: var(--text-secondary);
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label { 
        color: var(--text-tertiary); 
        font-weight: 500;
      }
      
      .value { 
        font-family: 'JetBrains Mono', monospace; 
        color: var(--text-primary);
        font-weight: 500;
        
        &.copyable { 
          cursor: pointer; 
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          
          &:hover { color: var(--color-primary); } 
        }
        &.text-danger { color: var(--color-danger); }
      }
    }
  }
  
  .card-footer {
    border-top: 1px solid var(--border-light);
    background-color: var(--bg-secondary);
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    padding: 0;
    
    .el-button-group {
      width: 100%;
      display: flex;
      
      .el-button {
        flex: 1;
        border: none;
        border-right: 1px solid var(--border-light);
        border-radius: 0;
        margin: 0;
        height: 44px;
        background: transparent;
        color: var(--text-secondary);
        transition: all 0.2s;
        
        &:last-child {
          border-right: none;
        }
        
        &:hover {
          background-color: var(--bg-tertiary);
          color: var(--color-primary);
        }
        
        &.is-disabled {
          color: var(--text-disabled);
          background-color: transparent;
          cursor: not-allowed;
        }
      }
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  
  &.running { background-color: var(--color-success); box-shadow: 0 0 4px var(--color-success); }
  &.stopped { background-color: var(--text-secondary); }
  &.starting, &.stopping { background-color: var(--color-warning); animation: breathe 1.5s infinite; }
}

@keyframes breathe {
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.9); }
}
</style>