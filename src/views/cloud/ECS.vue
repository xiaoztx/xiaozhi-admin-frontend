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
    <ServerStats :server-list="serverList" :total="total" />

    <!-- 筛选工具栏 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="实例名称/IP/ID" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
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
    <ServerTable 
      v-else-if="viewMode === 'table'" 
      :server-list="serverList" 
      :loading="loading"
      @selection-change="handleSelectionChange"
      @detail="handleDetail"
      @terminal="openTerminal"
      @action="handleAction"
    />

    <!-- 卡片视图 -->
    <ServerCard 
      v-else 
      :server-list="serverList" 
      @detail="handleDetail"
      @terminal="openTerminal"
      @action="handleAction"
    />

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
    <el-dialog v-model="syncDialogVisible" title="同步云服务器" width="450px" destroy-on-close>
      <el-form :model="syncForm" label-width="100px" ref="syncFormRef">
        <el-form-item label="选择云配置" required>
          <el-select 
            v-model="syncForm.cloud_config_id" 
            placeholder="请选择云账号" 
            style="width: 100%"
            :loading="configLoading"
            @change="handleConfigChange"
          >
            <el-option 
              v-for="item in configList" 
              :key="item.id" 
              :label="`${item.name} (${item.provider})`" 
              :value="item.id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">{{ item.provider }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-alert
          v-if="permissionWarning"
          :title="permissionWarning"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 10px"
        />
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="syncDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSync" :loading="syncLoading" :disabled="!!permissionWarning || !syncForm.cloud_config_id">
            开始同步
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, Refresh, RefreshLeft, Grid, Menu
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getServers, syncServers, type CloudServer, type ServerListResponse } from '@/api/cloud-server'
import { getCloudConfigs } from '@/api/cloud-config'
import { useServerAction } from '@/hooks/useServerAction'
import { SERVER_STATUS_MAP } from '@/constants/cloud'

// Components
import ServerStats from './components/ServerStats.vue'
import ServerTable from './components/ServerTable.vue'
import ServerCard from './components/ServerCard.vue'

interface CloudConfig {
  id: number
  name: string
  provider: string
  status: string
}

const router = useRouter()

// 视图模式
const viewMode = ref<'card' | 'table'>('card')

// 数据状态
const loading = ref(false)
const syncLoading = ref(false)
const serverList = ref<CloudServer[]>([])
const total = ref(0)
const syncDialogVisible = ref(false)
const selectedServers = ref<CloudServer[]>([])
const configList = ref<CloudConfig[]>([])
const configLoading = ref(false)
const permissionWarning = ref('')
let pollTimer: any = null

const queryParams = reactive({
  page: 1,
  pageSize: 12,
  keyword: '',
  status: ''
})

const syncForm = reactive({
  cloud_config_id: undefined as number | undefined
})

// 复用 Hook
const { handleServerAction: execServerAction } = useServerAction(() => {
  loadData()
  startPolling()
})

// 方法
const loadData = async (isPoll = false) => {
  if (!isPoll) loading.value = true
  try {
    const res = await getServers(queryParams) as unknown as ServerListResponse
    serverList.value = res.list || []
    total.value = res.total || 0
    
    // Check if we need polling (if any server is in intermediate state)
    const hasIntermediateState = serverList.value.some(s => 
      ['Pending', 'Starting', 'Stopping', 'Rebooting'].includes(s.status)
    )
    
    if (hasIntermediateState && !pollTimer) {
      startPolling()
    } else if (!hasIntermediateState && pollTimer) {
      stopPolling()
    }
  } catch (error) {
    console.error(error)
  } finally {
    if (!isPoll) loading.value = false
  }
}

const startPolling = () => {
  if (pollTimer) return
  pollTimer = setInterval(() => {
    loadData(true)
  }, 5000) // Poll every 5 seconds
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
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

const handleSync = async () => {
  syncDialogVisible.value = true
  syncForm.cloud_config_id = undefined
  permissionWarning.value = ''
  configLoading.value = true
  try {
    const res: any = await getCloudConfigs({ page: 1, pageSize: 100 })
    configList.value = res.list || []
  } catch (e) {
    console.error(e)
    ElMessage.error('获取云凭证列表失败')
  } finally {
    configLoading.value = false
  }
}

const handleConfigChange = (id: number) => {
  const config = configList.value.find(c => c.id === id)
  if (!config) return
  
  // 权限判断逻辑
  if (config.provider === 'cloudflare') {
    permissionWarning.value = 'Cloudflare 凭证通常仅用于 DNS/CDN 管理，暂不支持同步云服务器。'
  } else {
    permissionWarning.value = ''
  }
}

const confirmSync = async () => {
  if (!syncForm.cloud_config_id) return
  
  syncLoading.value = true
  try {
    await syncServers({ cloud_config_id: syncForm.cloud_config_id })
    ElMessage.success('同步指令已下发')
    syncDialogVisible.value = false
    // 立即刷新一次，并开启轮询
    setTimeout(() => {
      loadData()
      startPolling()
    }, 1000)
  } catch (error) {
    console.error(error)
  } finally {
    syncLoading.value = false
  }
}

const handleSelectionChange = (val: CloudServer[]) => {
  selectedServers.value = val
}

const handleDetail = (row: CloudServer) => {
  router.push(`/cloud/ecs/${row.id}`)
}

const handleAction = (row: CloudServer, action: string) => {
  execServerAction(row, action as "start" | "stop" | "restart" | "delete")
}

const handleBatchAction = (action: string) => {
  ElMessage.warning(`批量操作(${action})功能开发中...`)
}

const openTerminal = (server: CloudServer) => {
  // 简单的终端连接模拟或跳转
  // 这里我们假设后端有一个 web 终端接口，或者直接跳转到详情页的终端 tab
  ElMessage.info(`正在连接到 ${server.instance_name} (${server.public_ip})...`)
  setTimeout(() => {
    router.push(`/cloud/ecs/${server.id}?tab=terminal`)
  }, 500)
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  stopPolling()
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
    color: var(--text-primary);
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filter-card {
  margin-bottom: 20px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  
  :deep(.el-card__body) {
    padding: 24px;
  }
  
  .filter-form {
    margin-bottom: 0;
  }
  
  .batch-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    gap: 16px;
    
    .selection-info {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>