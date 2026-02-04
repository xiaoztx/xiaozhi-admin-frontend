<template>
  <div class="operation-log-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="left-panel">
        <el-radio-group v-model="dateRange" size="default" @change="handleDateRangeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">近7天</el-radio-button>
          <el-radio-button value="month">近30天</el-radio-button>
        </el-radio-group>
        
        <el-date-picker
          v-model="customDateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="default"
          style="margin-left: 12px; width: 360px"
          @change="handleCustomDateChange"
          :shortcuts="shortcuts"
        />
      </div>

      <div class="right-panel">
        <div class="filter-box" style="margin-right: 12px; display: flex; align-items: center">
          <el-tooltip placement="top" content="关键操作包括：开机、关机、重启、重置密码、修改安全组/防火墙、续费">
            <el-icon style="margin-right: 8px; color: #909399; cursor: help"><InfoFilled /></el-icon>
          </el-tooltip>
          <el-select v-model="actionType" placeholder="操作类型" style="width: 140px" @change="handleActionTypeChange">
            <el-option label="全部操作" value="critical" />
            <el-option label="开机" value="start" />
            <el-option label="关机" value="stop" />
            <el-option label="重启" value="reboot" />
            <el-option label="重置密码" value="password" />
            <el-option label="重置系统" value="reset" />
            <el-option label="安全组/防火墙" value="security" />
            <el-option label="续费" value="renew" />
          </el-select>
        </div>
        
        <!-- 搜索与操作区 -->
        <div class="search-operation-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索实例ID/操作人/类型/IP"
            style="width: 240px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-tooltip content="手动同步最近60天的云端日志" placement="top">
            <el-button 
              type="primary" 
              plain 
              :icon="Refresh" 
              :loading="syncLoading" 
              @click="handleSync"
              style="margin-left: 12px"
            >
              同步
            </el-button>
          </el-tooltip>

          <el-button :icon="Download" @click="handleExport" style="margin-left: 12px">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%; margin-top: 16px"
      border
      stripe
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-detail">
            <el-descriptions title="详细信息" :column="2" border size="small">
              <el-descriptions-item label="事件名称">{{ props.row.event_name }}</el-descriptions-item>
              <el-descriptions-item label="事件源">{{ props.row.event_source }}</el-descriptions-item>
              
              <el-descriptions-item label="请求 ID">{{ props.row.request_id }}</el-descriptions-item>
              <el-descriptions-item label="源 IP 地址">
                {{ props.row.source_ip }} 
                <!-- IP归属地需后端支持 -->
              </el-descriptions-item>

              <el-descriptions-item label="操作者">
                {{ props.row.account_id }} ({{ props.row.user_name || '-' }})
              </el-descriptions-item>
              <el-descriptions-item label="资源地域">{{ props.row.region }}</el-descriptions-item>
              
              <el-descriptions-item label="CAM 错误码">{{ props.row.error_code || '-' }}</el-descriptions-item>
              <el-descriptions-item label="User Agent">{{ props.row.user_agent }}</el-descriptions-item>

              <el-descriptions-item label="错误信息" :span="2" v-if="props.row.error_message">
                {{ props.row.error_message }}
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="params-box" v-if="props.row.request_parameters && props.row.request_parameters !== '{}' && props.row.request_parameters !== 'null'">
              <div class="params-title">请求参数:</div>
              <pre class="params-code">{{ formatJson(props.row.request_parameters) }}</pre>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="event_time" label="操作时间" width="180" sortable>
        <template #default="scope">
          {{ formatTime(scope.row.event_time) }}
        </template>
      </el-table-column>

      <el-table-column prop="event_name" label="操作类型" width="200" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="getOperationTagType(scope.row.event_name)" effect="light">
            {{ getOperationLabel(scope.row.event_name) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作者" width="180">
        <template #default="scope">
          <span>{{ scope.row.account_id }} ({{ scope.row.user_name || '-' }})</span>
        </template>
      </el-table-column>

      <el-table-column label="资源信息" min-width="220">
        <template #default="scope">
          <div>{{ scope.row.resource_name || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="source_ip" label="来源IP" width="140">
        <template #default="scope">
          <span class="mono-font">{{ scope.row.source_ip }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="result" label="结果" width="100" fixed="right">
        <template #default="scope">
          <el-tag v-if="scope.row.result === 'Success' || scope.row.result === '成功'" type="success" size="small">成功</el-tag>
          <el-tooltip v-else :content="scope.row.error_message || scope.row.error_code" placement="left">
            <el-tag type="danger" size="small" style="cursor: help">失败</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Download, InfoFilled, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getOperationLogs, syncOperationLogs, type OperationLog } from '@/api/operation-log'

// 状态定义
const loading = ref(false)
const syncLoading = ref(false)
const tableData = ref<OperationLog[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选条件
const dateRange = ref('week') // 默认近7天
const customDateRange = ref<[Date, Date] | null>(null)
const searchKeyword = ref('')
const actionType = ref('critical') // 默认选中关键操作
// const progressVisible = ref(false)
// const progressPercent = ref(0)
// const progressMessage = ref('准备开始同步...')
// const progressStatus = ref<'' | 'success' | 'warning' | 'exception'>('') // 修复类型定义

// 操作类型映射 (用于 Tag 展示)
const getOperationTagType = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('start') || n.includes('启动') || n.includes('开机')) return 'success'
  if (n.includes('stop') || n.includes('停止') || n.includes('关机')) return 'danger'
  if (n.includes('reboot') || n.includes('restart') || n.includes('重启')) return 'warning'
  if (n.includes('security') || n.includes('firewall') || n.includes('安全组') || n.includes('防火墙')) return 'warning'
  if (n.includes('password') || n.includes('密码')) return 'danger'
  if (n.includes('resetinstance')) return 'danger' // 新增：重置系统为高危操作
  if (n.includes('renew') || n.includes('续费')) return 'info'
  return 'info'
}

const getOperationLabel = (name: string) => {
  // 简单的映射，让展示更友好
  const n = name.toLowerCase()
  if (n.includes('start') || n.includes('启动') || n.includes('开机')) return '开机'
  if (n.includes('stop') || n.includes('停止') || n.includes('关机')) return '关机'
  if (n.includes('reboot') || n.includes('restart') || n.includes('重启')) return '重启'
  if (n.includes('security') || n.includes('firewall') || n.includes('安全组') || n.includes('防火墙')) {
    if (n.includes('create') || n.includes('add')) return '添加防火墙规则'
    if (n.includes('delete') || n.includes('remove')) return '删除防火墙规则'
    if (n.includes('modify') || n.includes('update')) return '修改防火墙规则'
    return '修改安全组/防火墙'
  }
  if (n.includes('resetinstance') && !n.includes('password')) return '重置应用/系统'
  if (n.includes('password') || n.includes('密码')) return '重置密码'
  if (n.includes('renew') || n.includes('续费')) return '续费'
  if (n.includes('dns')) return '修改域名解析'
  return name // 兜底
}

// 日期快捷选项
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 初始化
onMounted(() => {
  initDateRange()
  fetchData()
})

// 初始化日期范围
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  
  if (dateRange.value === 'today') {
    start.setHours(0, 0, 0, 0)
  } else if (dateRange.value === 'week') {
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
  } else if (dateRange.value === 'month') {
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
  }
  
  customDateRange.value = [start, end]
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchKeyword.value,
      type: actionType.value,
      start_time: customDateRange.value ? Math.floor(customDateRange.value[0].getTime() / 1000) : undefined,
      end_time: customDateRange.value ? Math.floor(customDateRange.value[1].getTime() / 1000) : undefined,
    }
    
    const res = await getOperationLogs(params)
    // console.log('Operation Logs Data:', res)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleDateRangeChange = () => {
  initDateRange()
  currentPage.value = 1
  fetchData()
}

const handleCustomDateChange = () => {
  dateRange.value = '' // 清除快捷选中状态
  currentPage.value = 1
  fetchData()
}

const handleActionTypeChange = () => {
  currentPage.value = 1
  fetchData()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 移除未使用的 handleSearchInput 和 handleRefresh
// const handleSearchInput = () => { ... }
// const handleRefresh = () => { ... }

// 手动同步逻辑
const handleSync = async () => {
  if (syncLoading.value) return
  syncLoading.value = true
  try {
    // 默认同步最近 60 天的增量日志
    await syncOperationLogs(60)
    ElMessage.success('同步任务已触发，请稍后刷新列表查看')
    // 延迟 2 秒后自动刷新列表，给后端一点处理时间
    setTimeout(() => {
      fetchData()
    }, 2000)
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步请求失败')
  } finally {
    syncLoading.value = false
  }
}

// 移除手动同步逻辑
// const handleSyncClick = () => { ... }
// const handleSyncCommand = (days: string) => { ... }
// const handleSync = async (days: number = 7) => { ... }

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 工具函数
const formatTime = (timestamp: number) => {
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const formatJson = (jsonStr: string) => {
  try {
    const obj = JSON.parse(jsonStr)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}
</script>

<style scoped lang="scss">
.operation-log-container {
  padding: 20px;
  background-color: var(--bg-primary); // 使用全局变量
  border-radius: 4px;
  min-height: 600px;
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .left-panel {
      display: flex;
      align-items: center;
    }
    
    .right-panel {
      display: flex;
      align-items: center;
      
      .search-operation-box {
        display: flex;
        align-items: center;
      }
    }
  }
  
  .expand-detail {
    padding: 20px;
    background-color: var(--bg-tertiary); // 使用全局变量
    border-radius: 4px;
    
    .params-box {
      margin-top: 16px;
      
      .params-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--text-secondary); // 使用全局变量
      }
      
      .params-code {
        background-color: #282c34; // 代码块保持深色背景
        color: #abb2bf;
        padding: 12px;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        border: 1px solid var(--border-light); // 添加边框适配
      }
    }
  }
  
  .mono-font {
    font-family: 'Consolas', 'Monaco', monospace;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
