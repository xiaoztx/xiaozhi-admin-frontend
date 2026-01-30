<template>
  <div class="operation-records">
    <div class="filter-bar">
      <!-- 客户端过滤暂不支持搜索，或者后续支持 -->
      <!-- <el-input
        v-model="queryParams.event_name"
        placeholder="搜索操作名称"
        style="width: 200px"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
      </el-select> -->

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 320px"
        :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
      />

      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="records" style="width: 100%" v-loading="loading">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="record-detail">
             <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="Request ID">{{ row.RequestID }}</el-descriptions-item>
                <el-descriptions-item label="Event ID">{{ row.EventID }}</el-descriptions-item>
                <el-descriptions-item label="Event Source">{{ row.EventSource }}</el-descriptions-item>
                <el-descriptions-item label="Error Code" v-if="row.ErrorCode">
                  <span class="danger-text">{{ row.ErrorCode }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Error Message" v-if="row.ErrorMessage" :span="2">
                  <span class="danger-text">{{ row.ErrorMessage }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Parameters" :span="2">
                  <pre class="json-content">{{ JSON.stringify(row.RequestParameters, null, 2) }}</pre>
                </el-descriptions-item>
             </el-descriptions>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="EventName" label="操作名称" min-width="150" />
      <el-table-column prop="EventTime" label="操作时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.EventTime * 1000).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="UserIdentity.UserName" label="操作者" width="120" />
      <el-table-column prop="ResourceName" label="资源名称" width="150" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="!row.ErrorCode ? 'success' : 'danger'">
            {{ !row.ErrorCode ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="sizes, prev, pager, next"
        :total="total"
        @size-change="handleSearch"
        @current-change="handlePageChange"
      />
      <!-- Note: CloudAudit API usually uses token-based pagination, this is a simplified client-side or limit-based approach -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { getCloudRecords, type CloudOperationRecord, type CloudLogQueryParams } from '@/api/cloud-log'

const props = defineProps<{
  resourceId?: string
}>()

const records = ref<CloudOperationRecord[]>([])
const loading = ref(false)
const total = ref(0)
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)

// API Query Params
const queryParams = reactive<CloudLogQueryParams>({
  max_results: 50,
  resource_id: props.resourceId || '',
})

watch(() => props.resourceId, (newVal) => {
  if (newVal) {
    queryParams.resource_id = newVal
    handleSearch()
  }
})

const handleSearch = async () => {
  loading.value = true
  try {
    const params: CloudLogQueryParams = {
      resource_id: queryParams.resource_id,
      max_results: pageSize.value
    }
    
    if (dateRange.value) {
      params.start_time = dateRange.value[0].toISOString()
      params.end_time = dateRange.value[1].toISOString()
    }
    
    const res = await getCloudRecords(params)
    const data = res as unknown as { list: CloudOperationRecord[] }
    
    if (data && data.list) {
      records.value = data.list
      total.value = data.list.length // CloudAudit usually returns a list, total count might not be accurate without token
    } else {
      records.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch operation records:', error)
    records.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
    // Current implementation fetches latest N records. 
    // True pagination requires NextToken support in backend.
    // For now, re-fetch.
    handleSearch()
}

const handleReset = () => {
  dateRange.value = null
  pageSize.value = 20
  handleSearch()
}

onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.operation-records {
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
  
  .record-detail {
    padding: 10px 20px;
    background-color: var(--bg-tertiary);
  }
  
  .danger-text {
    color: var(--el-color-danger);
  }

  .json-content {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
