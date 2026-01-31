<template>
  <div class="ecs-detail-wrapper">
    <!-- 1. 顶部导航与状态 -->
    <el-page-header @back="router.back()" class="page-header" v-loading="loading">
      <template #content>
        <div class="header-content">
          <span class="instance-name">{{ server?.instance_name }}</span>
          <el-tag :type="getStatusType(server?.status || '')" effect="dark" round class="status-tag">
            {{ getStatusLabel(server?.status || '') }}
          </el-tag>
          <el-tag effect="plain" round class="provider-tag">
            {{ getProviderLabel(server?.cloud_config?.provider) }}
          </el-tag>
        </div>
      </template>
      <template #extra>
        <div class="header-actions">
          <el-space :size="12">
            <el-tooltip content="启动服务器" placement="bottom">
              <el-button type="primary" :icon="VideoPlay" :disabled="server?.status === 'Running'" @click="handleServerAction(server!, 'start')">
                开机
              </el-button>
            </el-tooltip>
            <el-tooltip content="重启服务器" placement="bottom">
              <el-button type="warning" :icon="RefreshRight" :disabled="server?.status !== 'Running'" @click="handleServerAction(server!, 'restart')">
                重启
              </el-button>
            </el-tooltip>
            <el-tooltip content="停止服务器" placement="bottom">
              <el-button type="danger" :icon="SwitchButton" :disabled="server?.status === 'Stopped'" @click="handleServerAction(server!, 'stop')">
                关机
              </el-button>
            </el-tooltip>
            <el-tooltip content="刷新状态" placement="bottom">
              <el-button :icon="Refresh" circle @click="() => loadData(true)" class="refresh-btn" />
            </el-tooltip>
          </el-space>
        </div>
      </template>
    </el-page-header>

    <div class="main-content" v-loading="loading">
      <!-- 2. 关键指标概览 (去除了外层卡片背景，直接展示四列) -->
      <div class="overview-section">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon cpu">
                    <el-icon><Cpu /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">vCPU</div>
                    <div class="stat-value">{{ server?.cpu || 0 }} <span class="unit">核</span></div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon memory">
                    <el-icon><Connection /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">内存</div>
                    <div class="stat-value">{{ ((server?.memory || 0) / 1024).toFixed(1) }} <span class="unit">GB</span></div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon bandwidth">
                    <el-icon><Monitor /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">公网带宽</div>
                    <div class="stat-value">{{ server?.bandwidth || 0 }} <span class="unit">Mbps</span></div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-item">
                  <div class="stat-icon disk">
                    <el-icon><Files /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">系统盘容量</div>
                    <div class="stat-value">{{ server?.system_disk_size || 0 }} <span class="unit">GB</span></div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
      </div>

      <!-- 3. 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-title">基本属性</span>
        </div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="实例 ID">
            <span class="mono-text">{{ server?.instance_id }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="公网 IP">
            <div class="ip-box">
              <span class="mono-text">{{ server?.public_ip }}</span>
              <el-icon class="copy-btn" @click="copyText(server?.public_ip)"><CopyDocument /></el-icon>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="内网 IP">
            <span class="mono-text">{{ server?.private_ip }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="所在地域">
            {{ getRegionLabel(server?.region || '') }} 
            <span style="color: var(--text-tertiary); margin: 0 4px;">|</span> 
            {{ getZoneLabel(server?.zone || '') }}
          </el-descriptions-item>
          <el-descriptions-item label="操作系统">
            <div class="os-info">
              <el-icon><Platform /></el-icon>
              {{ server?.os_name }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="计费方式">按量付费</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(server?.start_time || server?.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="到期时间">
            <span class="danger-text">{{ formatDate(server?.expired_at) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 4. 功能 Tabs -->
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="资源监控" name="monitor" lazy>
            <div class="tab-pane-content">
               <ServerMonitor :server-id="serverId" :system-disk-size="server?.system_disk_size" />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="云盘管理" name="disk" lazy>
            <div class="tab-pane-content">
               <ServerDisk :server-id="serverId" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="安全组规则" name="security" lazy>
            <div class="tab-pane-content">
               <ServerSecurity :server-id="serverId" />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="远程终端" name="terminal" lazy>
             <div class="tab-pane-content terminal-wrapper">
                <ServerTerminal ref="terminalRef" :server-id="serverId" />
             </div>
          </el-tab-pane>

          <el-tab-pane label="操作记录" name="logs" lazy>
            <div class="tab-pane-content">
              <!-- 使用新的操作记录组件 (Tencent Cloud OperationRecord Compatible) -->
              <OperationRecords 
                v-if="server?.instance_id"
                :resource-id="server?.instance_id"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  VideoPlay, SwitchButton, RefreshRight, 
  CopyDocument, Refresh, Platform,
  Cpu, Connection, Monitor, Files
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import { getServerDetail as getDetail, syncServers, type CloudServer } from '../../api/cloud-server'
import { useServerAction } from '@/hooks/useServerAction'
import { SERVER_STATUS_MAP } from '@/constants/cloud'
import { getRegionLabel, getZoneLabel } from '@/constants/region'

// 异步加载组件，优化首屏
const ServerMonitor = defineAsyncComponent(() => import('./components/ServerMonitor.vue'))
const ServerDisk = defineAsyncComponent(() => import('./components/ServerDisk.vue'))
const ServerSecurity = defineAsyncComponent(() => import('./components/ServerSecurity.vue'))
const ServerTerminal = defineAsyncComponent(() => import('./components/ServerTerminal.vue'))
const OperationRecords = defineAsyncComponent(() => import('./components/OperationLog.vue'))

// 路由和工具
const route = useRoute()
const router = useRouter()
const { toClipboard } = useClipboard()

const serverId = Number(route.params.id)
const server = ref<CloudServer>()
const loading = ref(false)
const activeTab = ref('monitor')
const terminalRef = ref()

// 复用 Hook
const { handleServerAction } = useServerAction(() => loadData())

// 监听 Tab 切换，自动填充 IP
import { watch } from 'vue'
watch(activeTab, (val) => {
  if (val === 'terminal' && server.value?.public_ip) {
    // 稍微延迟一下，确保组件已挂载
    setTimeout(() => {
      terminalRef.value?.setServerInfo(server.value?.public_ip)
    }, 100)
  }
})

const loadData = async (sync = false) => {
  loading.value = true
  try {
    // 如果请求同步且存在配置ID，先执行同步
    if (sync && server.value?.cloud_config_id) {
      try {
        await syncServers({ cloud_config_id: server.value.cloud_config_id })
        ElMessage.success('同步指令已下发')
      } catch (error) {
        console.error('同步失败', error)
      }
    }

    const res = await getDetail(serverId)
    server.value = res as unknown as CloudServer // 类型转换
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const copyText = async (text?: string) => {
  if (!text) return
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

const getProviderLabel = (provider?: string) => {
  if (!provider) return '未知'
  const map: Record<string, string> = {
    'aliyun': '阿里云',
    'tencent': '腾讯云',
    'cloudflare': 'Cloudflare'
  }
  // 忽略大小写进行匹配
  const key = provider.toLowerCase()
  return map[key] || provider
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page-header {
  margin: 0 24px 20px;
  background: var(--bg-surface);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .instance-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .provider-tag {
      margin-left: 8px;
      font-weight: 500;
      background-color: var(--bg-secondary);
      border-color: var(--border-light);
      color: var(--text-secondary);
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .refresh-btn {
      margin-left: 8px;
    }
  }
}

.overview-section {
  margin-bottom: 24px;
  
  .stat-card {
    border: 1px solid var(--border-primary);
    box-shadow: var(--shadow-sm);
    background: var(--bg-surface);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      
      &.cpu { background: var(--el-color-primary-light-9); color: var(--color-primary); }
      &.memory { background: var(--el-color-success-light-9); color: var(--color-success); }
      &.bandwidth { background: var(--el-color-warning-light-9); color: var(--color-warning); }
      &.disk { background: var(--el-color-info-light-9); color: var(--color-info); }
    }

    .stat-info {
      flex: 1;
      min-width: 0;
      
      .stat-label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: baseline;
        gap: 4px;
        
        .unit {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: normal;
        }
      }
    }
  }
}

.main-content {
  padding: 0 24px 40px;
}

.info-card {
    background: var(--bg-surface);
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-primary);

    :deep(.el-descriptions) {
      /* 移除 Element Plus 默认的 Descriptions 边框 */
      --el-descriptions-table-border: 1px solid var(--border-light);
      --el-descriptions-item-bordered-label-background: var(--bg-secondary);
    }

    :deep(.el-descriptions__body) {
      background: transparent;
    }
    
    :deep(.el-descriptions__label) {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-weight: 500;
      width: 120px; /* 固定 Label 宽度 */
    }
    
    :deep(.el-descriptions__content) {
      color: var(--text-primary);
      font-family: 'JetBrains Mono', sans-serif; /* 统一字体 */
    }

    /* 优化表格圆角 */
    :deep(.el-descriptions__table) {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-light); /* 外边框 */
      
      /* 移除内部重叠边框 */
      tbody tr:last-child th,
      tbody tr:last-child td {
        border-bottom: none;
      }
    }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .mono-text {
    font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
    color: var(--text-primary);
  }
  
  .ip-box {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .copy-btn {
      cursor: pointer;
      color: var(--color-primary);
      &:hover {
        opacity: 0.8;
      }
    }
  }
  
  .os-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .danger-text {
    color: var(--color-danger);
  }
}

.tabs-container {
  background: var(--bg-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-primary);
  
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-light);
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    height: 56px;
    line-height: 56px;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
    
    &.is-active {
      color: var(--color-primary);
    }
  }
  
  :deep(.el-tabs__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.detail-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-pane-content {
  padding: 24px;
  height: 100%;
  
  &.terminal-wrapper {
    padding: 0;
    background: #1e1e1e;
    min-height: 500px;
  }
}

.log-content {
    h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: var(--text-primary);
    }
    p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
    }
  }
  
  :global(.dark) {
    .stat-item .stat-icon {
      &.cpu { background: rgba(64, 158, 255, 0.15); }
      &.memory { background: rgba(103, 194, 58, 0.15); }
      &.bandwidth { background: rgba(230, 162, 60, 0.15); }
      &.disk { background: rgba(144, 147, 153, 0.15); }
    }
  }
</style>
