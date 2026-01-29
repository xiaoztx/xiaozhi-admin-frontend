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
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .server-name {
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 180px;
      cursor: pointer;
      color: var(--el-text-color-primary);
    }
  }
  
  .card-body {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-bottom: 16px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .label { color: var(--el-text-color-secondary); }
      .value { 
        font-family: monospace; 
        &.copyable { cursor: pointer; &:hover { color: var(--el-color-primary); } }
        &.text-danger { color: var(--el-color-danger); font-weight: bold; }
      }
    }
  }
  
  .card-footer {
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 12px;
    
    .el-button-group {
      width: 100%;
      display: flex;
      
      .el-button {
        flex: 1;
        border: none;
        border-right: 1px solid var(--el-border-color-lighter);
        border-radius: 0;
        margin: 0;
        
        &:last-child {
          border-right: none;
        }
        
        &:not(:first-child):not(:last-child) {
          border-radius: 0;
        }
        
        &:first-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 4px;
        }
        
        &:last-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 4px;
        }
        
        &:hover {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-text-color-secondary);
  
  &.running { background-color: var(--el-color-success); box-shadow: 0 0 4px var(--el-color-success); }
  &.stopped { background-color: var(--el-text-color-secondary); }
  &.starting, &.stopping { background-color: var(--el-color-warning); animation: breathe 1.5s infinite; }
}

@keyframes breathe {
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.9); }
}
</style>