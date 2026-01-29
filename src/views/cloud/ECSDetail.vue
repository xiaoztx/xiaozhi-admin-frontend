<template>
  <div class="ecs-detail-container" v-loading="loading">
    <!-- 顶部导航与操作栏 -->
    <el-card class="header-card" shadow="never">
      <div class="header-wrapper">
        <el-page-header @back="router.back()" class="page-header">
          <template #content>
            <div class="header-content">
              <span class="instance-name">{{ server?.instance_name }}</span>
              <el-tag :type="getStatusType(server?.status || '')" effect="dark" round class="status-tag">
                {{ getStatusLabel(server?.status || '') }}
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
                  <el-button :icon="Refresh" circle @click="loadData" class="refresh-btn" />
                </el-tooltip>
              </el-space>
            </div>
          </template>
        </el-page-header>
        
        <!-- 关键指标概览 -->
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-icon cpu">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">vCPU</div>
              <div class="stat-value">{{ server?.cpu || 0 }} <span class="unit">核</span></div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-icon memory">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">内存</div>
              <div class="stat-value">{{ ((server?.memory || 0) / 1024).toFixed(1) }} <span class="unit">GB</span></div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
             <div class="stat-icon bandwidth">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">公网带宽</div>
              <div class="stat-value">5 <span class="unit">Mbps</span></div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-icon time">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">运行时长</div>
              <div class="stat-value">{{ runDays }} <span class="unit">天</span></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 内容主体区域 -->
    <div class="main-content">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-title">基本属性</span>
          <el-button link type="primary" size="small">编辑</el-button>
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
            {{ server?.region }} ({{ server?.zone }})
          </el-descriptions-item>
          <el-descriptions-item label="操作系统">
            <div class="os-info">
              <el-icon><Platform /></el-icon>
              {{ server?.os_name }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="计费方式">按量付费</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(server?.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="到期时间">
            <span class="danger-text">{{ formatDate(server?.expired_at) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 功能 Tabs -->
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="资源监控" name="monitor" lazy>
            <div class="tab-pane-content">
               <ServerMonitor :server-id="serverId" />
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
                <ServerTerminal :server-id="serverId" />
             </div>
          </el-tab-pane>

          <el-tab-pane label="操作日志" name="logs" lazy>
            <div class="tab-pane-content">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in mockActivities"
                  :key="index"
                  :timestamp="activity.timestamp"
                  :type="activity.type"
                  :hollow="index === 0"
                  size="large"
                >
                  <div class="log-content">
                    <h4>{{ activity.title }}</h4>
                    <p>{{ activity.content }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  VideoPlay, SwitchButton, RefreshRight, 
  CopyDocument, Refresh, Platform,
  Cpu, Connection, Timer, Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import { getServerDetail as getDetail, type CloudServer } from '../../api/cloud-server'
import { useServerAction } from '@/hooks/useServerAction'
import { SERVER_STATUS_MAP } from '@/constants/cloud'

// 异步加载组件，优化首屏
const ServerMonitor = defineAsyncComponent(() => import('./components/ServerMonitor.vue'))
const ServerDisk = defineAsyncComponent(() => import('./components/ServerDisk.vue'))
const ServerSecurity = defineAsyncComponent(() => import('./components/ServerSecurity.vue'))
const ServerTerminal = defineAsyncComponent(() => import('./components/ServerTerminal.vue'))

// 路由和工具
const route = useRoute()
const router = useRouter()
const { toClipboard } = useClipboard()

const serverId = Number(route.params.id)
const server = ref<CloudServer>()
const loading = ref(false)
const activeTab = ref('monitor')

// 复用 Hook
const { handleServerAction } = useServerAction(() => loadData())

// 计算属性
const runDays = computed(() => {
  if (!server.value?.created_at) return 0
  const start = new Date(server.value.created_at).getTime()
  const now = Date.now()
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
})

const mockActivities = [
  { title: '系统监控', content: 'CPU 使用率处于正常范围 (12%)', timestamp: '2023-10-27 10:00:00', type: 'info' },
  { title: '实例重启', content: '用户 root 执行了重启操作', timestamp: '2023-10-26 15:30:00', type: 'warning' },
  { title: '实例启动', content: '实例成功启动，所有服务运行正常', timestamp: '2023-10-26 15:31:00', type: 'success' },
]

const loadData = async () => {
  loading.value = true
  try {
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ecs-detail-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.header-wrapper {
  padding: 24px;
}

.page-header {
  margin-bottom: 30px;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .instance-name {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
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

.overview-stats {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  
  .stat-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      
      &.cpu { background: #e6f7ff; color: #1890ff; }
      &.memory { background: #f6ffed; color: #52c41a; }
      &.bandwidth { background: #fff7e6; color: #fa8c16; }
      &.time { background: #fff0f6; color: #eb2f96; }
    }
    
    .stat-info {
      .stat-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 2px;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        font-family: "JetBrains Mono", sans-serif;
        
        .unit {
          font-size: 12px;
          color: #909399;
          font-weight: normal;
          margin-left: 2px;
        }
      }
    }
  }
  
  .stat-divider {
    width: 1px;
    height: 40px;
    background-color: #e4e7ed;
  }
}

.main-content {
  padding: 0 24px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .mono-text {
    font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
    color: #606266;
  }
  
  .ip-box {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .copy-btn {
      cursor: pointer;
      color: #409EFF;
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
    color: #F56C6C;
  }
}

.tabs-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    height: 56px;
    line-height: 56px;
    font-size: 15px;
    font-weight: 500;
    color: #606266;
    
    &.is-active {
      color: #409EFF;
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
    color: #303133;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: #909399;
  }
}
</style>
