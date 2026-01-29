<template>
  <div class="ecs-container">
    <div class="page-header">
      <h2>云服务器管理</h2>
      <div class="header-actions">
        <el-button-group class="view-switch">
          <el-button :type="viewMode === 'card' ? 'primary' : 'default'" :icon="Grid" @click="viewMode = 'card'" />
          <el-button :type="viewMode === 'table' ? 'primary' : 'default'" :icon="Menu" @click="viewMode = 'table'" />
        </el-button-group>
        <el-button type="primary" :icon="Refresh" @click="handleSync" :loading="syncLoading">
          同步服务器
        </el-button>
      </div>
    </div>

    <!-- 统计看板 -->
    <el-row :gutter="20" class="dashboard-stats">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon running">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">运行中 / 总数</div>
              <div class="stat-value">
                <span class="highlight">{{ serverList.filter(s => s.status === 'Running').length }}</span>
                <span class="divider">/</span>
                <span>{{ total }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon cpu">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总 vCPU 核数</div>
              <div class="stat-value">{{ serverList.reduce((acc, cur) => acc + cur.cpu, 0) }}</div>
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
              <div class="stat-label">总内存 (GB)</div>
              <div class="stat-value">{{ (serverList.reduce((acc, cur) => acc + cur.memory, 0) / 1024).toFixed(1) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon expire">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">即将到期</div>
              <div class="stat-value danger">0</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选工具栏 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="实例名称/IP/ID" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
             <el-option v-for="(cfg, key) in SERVER_STATUS_MAP" :key="key" :label="cfg.label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="batch-actions" v-if="selectedServers.length > 0">
        <span class="selection-info">已选 {{ selectedServers.length }} 台</span>
        <el-button-group>
          <el-button size="small" type="success" plain @click="handleBatchAction('start')">批量开机</el-button>
          <el-button size="small" type="warning" plain @click="handleBatchAction('restart')">批量重启</el-button>
          <el-button size="small" type="danger" plain @click="handleBatchAction('stop')">批量关机</el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 骨架屏加载 -->
    <el-skeleton :loading="loading" animated :count="3" v-if="loading && serverList.length === 0">
      <template #template>
        <el-card style="margin-bottom: 20px">
          <div style="display: flex; gap: 20px">
             <el-skeleton-item variant="image" style="width: 100px; height: 100px" />
             <div style="flex: 1">
               <el-skeleton-item variant="h3" style="width: 30%" />
               <el-skeleton-item variant="text" style="margin-top: 10px" />
               <el-skeleton-item variant="text" style="width: 60%" />
             </div>
          </div>
        </el-card>
      </template>
    </el-skeleton>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'table'" class="server-table">
       <el-table 
        :data="serverList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="实例名称/ID" min-width="200">
          <template #default="{ row }">
            <div class="table-name-cell">
              <span class="link-text" @click="router.push(`/cloud/ecs/${row.id}`)">{{ row.instance_name }}</span>
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
              <div>公: {{ row.public_ip }} <el-icon class="copy-icon" @click="copyText(row.public_ip)"><CopyDocument /></el-icon></div>
              <div class="sub-text">内: {{ row.private_ip }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="配置" width="150">
          <template #default="{ row }">
            {{ row.cpu }}核 / {{ (row.memory / 1024).toFixed(1) }}GB
          </template>
        </el-table-column>
        <el-table-column label="地域" prop="region" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-space :size="8">
              <el-button link type="primary" size="small" @click="router.push(`/cloud/ecs/${row.id}`)">详情</el-button>
              <el-button link type="primary" size="small" @click="openTerminal(row)">终端</el-button>
              <el-dropdown trigger="click" @command="(cmd: any) => handleServerAction(row, cmd)">
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
                    <el-dropdown-item command="delete" divided style="color: #f56c6c">
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

    <!-- 卡片视图 -->
    <div v-else class="server-list">
      <el-empty v-if="serverList.length === 0" description="暂无服务器数据" />
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="server in serverList" :key="server.id">
          <el-card class="server-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="server-name" :title="server.instance_name" @click="router.push(`/cloud/ecs/${server.id}`)">
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
                <span class="label">磁盘:</span>
                <span class="value">40GB (系统) + 100GB (数据)</span>
              </div>
              <div class="info-item">
                <span class="label">地域:</span>
                <span class="value">{{ server.region }}</span>
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
                   <el-button size="small" :icon="VideoPlay" :disabled="server.status === 'Running'" @click="handleServerAction(server, 'start')" style="flex: 1" />
                 </el-tooltip>
                 <el-tooltip content="关机" placement="top" :show-after="500">
                   <el-button size="small" :icon="SwitchButton" :disabled="server.status === 'Stopped'" @click="handleServerAction(server, 'stop')" style="flex: 1" />
                 </el-tooltip>
                 <el-tooltip content="终端" placement="top" :show-after="500">
                   <el-button size="small" :icon="Monitor" @click="openTerminal(server)" style="flex: 1" />
                 </el-tooltip>
                 <el-tooltip content="详情" placement="top" :show-after="500">
                   <el-button size="small" :icon="More" @click="router.push(`/cloud/ecs/${server.id}`)" style="flex: 1" />
                 </el-tooltip>
               </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>

    <!-- 同步对话框 -->
    <el-dialog v-model="syncDialogVisible" title="同步云服务器" width="400px">
      <el-form :model="syncForm" label-width="100px">
        <el-form-item label="选择云配置">
          <el-select v-model="syncForm.cloud_config_id" placeholder="请选择云账号">
            <el-option label="默认配置 (模拟)" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="syncDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSync" :loading="syncLoading">
            开始同步
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, Refresh, VideoPlay, SwitchButton, RefreshLeft, 
  ArrowDown, Monitor, CopyDocument, Grid, Menu, More,
  Cpu, Connection, Timer, Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getServers, syncServers, type CloudServer, type ServerListResponse } from '@/api/cloud-server'
import useClipboard from 'vue-clipboard3'
import { useServerAction } from '@/hooks/useServerAction'
import { SERVER_STATUS_MAP } from '@/constants/cloud'

const router = useRouter()
const { toClipboard } = useClipboard()

// 视图模式
const viewMode = ref<'card' | 'table'>('card') // 默认卡片视图更直观

// 数据状态
const loading = ref(false)
const syncLoading = ref(false)
const serverList = ref<CloudServer[]>([])
const total = ref(0)
const syncDialogVisible = ref(false)
const selectedServers = ref<CloudServer[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 12,
  keyword: '',
  status: ''
})

const syncForm = reactive({
  cloud_config_id: 1
})

// 复用 Hook
const { handleServerAction } = useServerAction(() => loadData())

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const res = await getServers(queryParams) as unknown as ServerListResponse
    serverList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.status = ''
  handleSearch()
}

const handleSync = () => {
  syncDialogVisible.value = true
}

const confirmSync = async () => {
  syncLoading.value = true
  try {
    await syncServers(syncForm)
    ElMessage.success('同步指令已下发')
    syncDialogVisible.value = false
    setTimeout(() => {
      loadData()
    }, 1500)
  } catch (error) {
    console.error(error)
  } finally {
    syncLoading.value = false
  }
}

const handleSelectionChange = (val: CloudServer[]) => {
  selectedServers.value = val
}

const handleBatchAction = (action: string) => {
  ElMessage.warning(`批量操作(${action})功能后端对接中...`)
}

const openTerminal = (_server: CloudServer) => {
  ElMessage.info('请在详情页使用终端功能')
}

const copyText = async (text: string) => {
  try {
    await toClipboard(text)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// 辅助函数
const getStatusType = (status: string) => {
  return SERVER_STATUS_MAP[status]?.type || 'info'
}

const getStatusLabel = (status: string) => {
  return SERVER_STATUS_MAP[status]?.label || status
}

const isExpiringSoon = (dateStr?: string) => {
  if (!dateStr) return false
  const expireDate = new Date(dateStr).getTime()
  const now = Date.now()
  const diffDays = (expireDate - now) / (1000 * 60 * 60 * 24)
  return diffDays <= 7 // 7天内到期标红
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ecs-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.dashboard-stats {
  margin-bottom: 20px;
  
  .stat-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      
      &.running { background: #f0f9eb; color: #67C23A; }
      &.cpu { background: #ecf5ff; color: #409EFF; }
      &.memory { background: #fdf6ec; color: #E6A23C; }
      &.expire { background: #fef0f0; color: #F56C6C; }
    }
    
    .stat-info {
      flex: 1;
      text-align: left;
      
      .stat-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
        
        &.danger { color: #F56C6C; }
        
        .highlight {
          color: #67C23A;
        }
        
        .divider {
          margin: 0 4px;
          font-size: 14px;
          color: #C0C4CC;
        }
      }
    }
  }
}

.filter-card {
  margin-bottom: 20px;
  
  .filter-form {
    margin-bottom: -18px; /* 抵消 form-item 的 margin */
  }
  
  .batch-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    gap: 16px;
    
    .selection-info {
      font-size: 13px;
      color: #909399;
    }
  }
}

.server-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  
  .table-name-cell {
    display: flex;
    flex-direction: column;
    
    .link-text {
      color: #409EFF;
      cursor: pointer;
      font-weight: 500;
    }
    .sub-text {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .ip-cell {
    font-family: monospace;
    font-size: 13px;
    .sub-text {
      color: #909399;
    }
    .copy-icon {
      cursor: pointer;
      color: #409EFF;
      margin-left: 4px;
    }
  }
}

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
    }
  }
  
  .card-body {
    font-size: 13px;
    color: #606266;
    margin-bottom: 16px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .label { color: #909399; }
      .value { 
        font-family: monospace; 
        &.copyable { cursor: pointer; &:hover { color: #409EFF; } }
        &.text-danger { color: #F56C6C; font-weight: bold; }
      }
    }
  }
  
  .card-footer {
    border-top: 1px solid #EBEEF5;
    padding-top: 12px;
    
    .el-button-group {
      width: 100%;
      display: flex;
      
      .el-button {
        flex: 1;
        border: none;
        border-right: 1px solid #EBEEF5;
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
          background-color: #ecf5ff;
          color: #409EFF;
        }
      }
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
  
  &.running { background-color: #67C23A; box-shadow: 0 0 4px #67C23A; }
  &.stopped { background-color: #909399; }
  &.starting, &.stopping { background-color: #E6A23C; animation: breathe 1.5s infinite; }
}

@keyframes breathe {
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.9); }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
