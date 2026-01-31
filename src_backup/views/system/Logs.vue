<template>
  <div class="logs-page">
    <div class="page-header" v-if="!embedded">
      <h2 class="page-title">操作日志</h2>
      <p class="page-description">查看系统操作日志和审计记录</p>
    </div>

    <el-card class="logs-card" :shadow="embedded ? 'never' : 'always'" :class="{ 'embedded-card': embedded }">
      <div class="filter-bar">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索操作内容或动作"
          style="width: 240px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="queryParams.module" placeholder="模块" clearable style="width: 140px">
          <el-option label="用户模块" value="user" />
          <el-option label="系统模块" value="system" />
          <el-option label="云资源" value="oss" />
          <el-option label="DNS" value="dns" />
          <el-option label="GitHub" value="github" />
          <el-option label="云服务器" value="cloud_server" />
        </el-select>

        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="成功" value="success" />
          <el-option label="失败" value="fail" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
          value-format="YYYY-MM-DD"
        />

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="log-detail">
              <p><strong>请求内容:</strong></p>
              <pre class="code-block">{{ formatContent(row.content) }}</pre>
              <p><strong>User Agent:</strong> {{ row.user_agent }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="created_at" label="操作时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.user?.avatar" v-if="row.user?.avatar" />
              <el-avatar :size="24" v-else>{{ (row.user?.username || '未知').charAt(0).toUpperCase() }}</el-avatar>
              <span>{{ row.user?.username || '未知' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag>{{ getModuleLabel(row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="动作" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 200 ? 'success' : 'danger'">
              {{ row.status === 200 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="100">
          <template #default="{ row }">
            {{ row.duration }}ms
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getOperationLogs, type OperationLog, type LogQueryParams } from '@/api/log'

const props = defineProps<{
  module?: string
  keyword?: string
  embedded?: boolean // 是否嵌入模式 (隐藏Header等)
}>()

const logs = ref<OperationLog[]>([])
const loading = ref(false)
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const queryParams = reactive<LogQueryParams>({
  page: 1,
  page_size: 10,
  keyword: props.keyword || '',
  module: props.module || '',
  status: '',
})

// 监听 Props 变化
watch(() => props.keyword, (newVal) => {
  if (newVal) {
    queryParams.keyword = newVal
    handleSearch()
  }
})

const getModuleLabel = (module: string) => {
  const map: Record<string, string> = {
    'user': '用户模块',
    'system': '系统模块',
    'oss': '云资源',
    'dns': 'DNS',
    'github': 'GitHub',
    'cloud_server': '云服务器'
  }
  return map[module] || module
}

const formatContent = (content: string) => {
  if (!content) return '-'
  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch (e) {
    return content
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }
    if (dateRange.value) {
      params.start_time = new Date(dateRange.value[0]).toISOString()
      params.end_time = new Date(dateRange.value[1] + ' 23:59:59').toISOString()
    }
    const res = await getOperationLogs(params)
    // 适配后端返回结构
    const data = res as unknown as { list: OperationLog[], total: number }
    logs.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.module = ''
  queryParams.status = ''
  queryParams.page = 1
  dateRange.value = null
  handleSearch()
}

onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.logs-page {
  .page-header {
    margin-bottom: 24px;
    .page-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .page-description {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .embedded-card {
    border: none !important;
    :deep(.el-card__body) {
      padding: 0 !important;
    }
  }

  .log-detail {
    padding: 10px 20px;
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    
    p {
      margin: 8px 0;
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
  }
}
</style>