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
          <el-select v-model="actionType" placeholder="操作类型" style="width: 120px" @change="handleActionTypeChange">
            <el-option label="全部操作" value="" />
            <el-option label="关键操作" value="critical" />
            <el-option label="开机/启动" value="start" />
            <el-option label="关机/停止" value="stop" />
            <el-option label="重启" value="reboot" />
          </el-select>
        </div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索实例ID/操作人/类型/IP"
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearchInput"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" :icon="Refresh" circle @click="handleRefresh" style="margin-left: 12px" />
        <el-tooltip content="手动同步云端日志" placement="top">
          <el-button type="warning" :icon="Download" circle @click="handleSync" :loading="syncLoading" />
        </el-tooltip>
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
              <el-descriptions-item label="Request ID">{{ props.row.request_id }}</el-descriptions-item>
              <el-descriptions-item label="Event Source">{{ props.row.event_source }}</el-descriptions-item>
              <el-descriptions-item label="Region">{{ props.row.region }}</el-descriptions-item>
              <el-descriptions-item label="Resource Name">{{ props.row.resource_name }}</el-descriptions-item>
              <el-descriptions-item label="Error Code" v-if="props.row.error_code">
                <el-tag type="danger">{{ props.row.error_code }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Error Message" v-if="props.row.error_message">
                {{ props.row.error_message }}
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="params-box" v-if="props.row.request_parameters">
              <div class="params-title">Request Parameters:</div>
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

      <el-table-column prop="user_name" label="操作人" width="150">
        <template #default="scope">
          <span>{{ scope.row.user_name || scope.row.account_id }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="event_name" label="操作类型" width="200" show-overflow-tooltip />

      <el-table-column prop="resource_id" label="实例ID" min-width="180">
        <template #default="scope">
          <span class="mono-font">{{ scope.row.resource_id }}</span>
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
import { Search, Refresh, Download, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getOperationLogs, syncOperationLogs, type OperationLog } from '@/api/operation-log'
import { debounce } from 'lodash-es'

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

// 防抖搜索
const handleSearchInput = debounce(() => {
  currentPage.value = 1
  fetchData()
}, 300)

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const handleSync = async () => {
  syncLoading.value = true
  try {
    const res: any = await syncOperationLogs()
    
    // 详细结果打印到控制台，供用户排查
    console.log('=== Cloud Audit Sync Result ===')
    console.log('Time:', new Date().toLocaleString())
    if (Array.isArray(res)) {
      res.forEach((item: any) => {
        console.log(`Config: ${item.config_name}`)
        console.log(`- Total Found: ${item.total_found}`)
        console.log(`- Total Saved: ${item.total_saved}`)
        console.log(`- Region Stats:`, item.region_stats)
        if (item.errors && item.errors.length > 0) {
          console.error(`- Errors:`, item.errors)
        }
      })
      
      const totalFound = res.reduce((sum: number, item: any) => sum + item.total_found, 0)
      const totalSaved = res.reduce((sum: number, item: any) => sum + item.total_saved, 0)
      
      if (totalFound === 0) {
        ElMessage.warning('同步完成，但未发现新的操作记录。请检查控制台详情。')
      } else {
        ElMessage.success(`同步完成，发现 ${totalFound} 条记录，入库 ${totalSaved} 条`)
      }
    } else {
      console.log('Result:', res)
      ElMessage.success('同步完成')
    }
    console.log('===============================')
    
    // 刷新列表
    fetchData()
  } catch (error) {
    console.error('Sync failed:', error)
    // error handled by interceptor
  } finally {
    syncLoading.value = false
  }
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
  background-color: #fff;
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
    }
  }
  
  .expand-detail {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    .params-box {
      margin-top: 16px;
      
      .params-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #606266;
      }
      
      .params-code {
        background-color: #282c34;
        color: #abb2bf;
        padding: 12px;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
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
