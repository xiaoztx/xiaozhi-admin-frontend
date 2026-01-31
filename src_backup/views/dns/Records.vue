<template>
  <div class="dns-record-management">
    <!-- 顶部导航和统计 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>返回域名列表
        </el-button>
        <el-divider direction="vertical" />
        <h2 class="domain-title">{{ currentDomain }}</h2>
        <el-tag size="small" effect="plain" class="provider-tag">Tencent</el-tag>
      </div>
      <div class="header-right">
        <div class="stat-item">
          <span class="label">记录上限</span>
          <span class="value">3000</span>
        </div>
        <div class="stat-item">
          <span class="label">已用记录</span>
          <span class="value">{{ recordList.length }}</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <el-card class="main-card" shadow="never">
      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchQuery"
            placeholder="搜索主机记录/记录值"
            class="search-input"
            clearable
            @clear="handleSearch"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="typeFilter" placeholder="记录类型" clearable class="filter-select" @change="handleSearch">
            <el-option label="A" value="A" />
            <el-option label="CNAME" value="CNAME" />
            <el-option label="MX" value="MX" />
            <el-option label="TXT" value="TXT" />
            <el-option label="AAAA" value="AAAA" />
            <el-option label="NS" value="NS" />
            <el-option label="SRV" value="SRV" />
          </el-select>
        </div>
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>添加记录
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon class="mr-1"><RefreshRight /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="paginatedData"
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ background: 'var(--bg-tertiary)' }"
      >
        <el-table-column prop="sub_domain" label="主机记录" min-width="120">
          <template #default="{ row }">
             <span class="host-record">{{ row.sub_domain }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="record_type" label="记录类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeTag(row.record_type)" size="small" effect="light">{{ row.record_type }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="record_line" label="线路类型" width="100">
          <template #default="{ row }">
             {{ row.record_line }}
          </template>
        </el-table-column>

        <el-table-column prop="value" label="记录值" min-width="180" show-overflow-tooltip />

        <el-table-column prop="weight" label="权重" width="80" align="center">
          <template #default="{ row }">
             {{ row.weight || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="mx" label="MX优先级" width="100" align="center">
          <template #default="{ row }">
             {{ row.mx || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="ttl" label="TTL" width="80" align="center" />

        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="ENABLE"
              inactive-value="DISABLE"
              inline-prompt
              active-text="启用"
              inactive-text="暂停"
              :loading="row.statusLoading"
              :before-change="() => handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              <el-icon class="mr-1"><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon class="mr-1"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
        
        <template #empty>
          <el-empty description="暂无解析记录" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 500]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑解析记录' : '添加解析记录'"
      width="600px"
      destroy-on-close
      align-center
      class="dns-record-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="record-form"
        status-icon
      >
        <el-form-item label="主机记录" prop="sub_domain">
          <el-input v-model="form.sub_domain" placeholder="例如：www, @, mail">
             <template #append>.{{ currentDomain }}</template>
          </el-input>
          <div class="form-tip">
            <span v-if="form.sub_domain === '@'">直接解析主域名</span>
            <span v-else-if="form.sub_domain === '*'">泛解析，匹配所有子域名</span>
            <span v-else>解析子域名，如：www</span>
          </div>
        </el-form-item>

        <el-form-item label="记录类型" prop="record_type">
          <el-select v-model="form.record_type" placeholder="请选择记录类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="A - 将域名指向一个IPV4地址" value="A" />
            <el-option label="CNAME - 将域名指向另一个域名" value="CNAME" />
            <el-option label="MX - 将域名指向邮件服务器地址" value="MX" />
            <el-option label="TXT - 文本长度限制512，通常做SPF记录（反垃圾邮件）" value="TXT" />
            <el-option label="AAAA - 将域名指向一个IPV6地址" value="AAAA" />
            <el-option label="NS - 域名服务器记录" value="NS" />
            <el-option label="SRV - 记录提供特定服务的服务器" value="SRV" />
          </el-select>
        </el-form-item>

        <el-form-item label="线路类型" prop="record_line">
          <el-select v-model="form.record_line" placeholder="默认" style="width: 100%">
            <el-option label="默认" value="默认" />
            <el-option label="电信" value="电信" />
            <el-option label="联通" value="联通" />
            <el-option label="移动" value="移动" />
            <el-option label="境外" value="境外" />
          </el-select>
        </el-form-item>

        <el-form-item label="记录值" prop="value">
          <el-input v-model="form.value" :placeholder="getValuePlaceholder(form.record_type)" />
        </el-form-item>

        <el-form-item label="MX优先级" prop="mx" v-if="form.record_type === 'MX'">
          <el-input-number v-model="form.mx" :min="1" :max="50" controls-position="right" />
        </el-form-item>

        <el-form-item label="权重" prop="weight" v-if="['A', 'AAAA', 'CNAME'].includes(form.record_type)">
           <el-input-number v-model="form.weight" :min="0" :max="100" controls-position="right" />
           <span class="ml-2 text-secondary text-sm">（0-100，可选）</span>
        </el-form-item>

        <el-form-item label="TTL" prop="ttl">
          <el-input-number v-model="form.ttl" :min="1" :step="600" controls-position="right" />
          <span class="ml-2 text-secondary text-sm">秒</span>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="可选备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Search, Plus, RefreshRight, Edit, Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getRecords, createRecord, updateRecord, deleteRecord, setRecordStatus } from '@/api/dns-record'

const route = useRoute()
const router = useRouter()

// 状态变量
const currentDomain = ref((route.query.domainName as string) || '加载中...') // 优先从 Query 获取
const domainId = ref(route.params.domain as string)
const loading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 类型定义
interface DnsRecord {
  id: number
  record_id: string
  sub_domain: string
  record_type: string
  record_line: string
  value: string
  weight?: number
  mx?: number
  ttl: number
  remark?: string
  status: 'ENABLE' | 'DISABLE'
  statusLoading?: boolean // 前端状态loading
}

// 数据
const recordList = ref<DnsRecord[]>([])

// 表单数据
const form = reactive({
  id: 0,
  record_id: '0',
  sub_domain: '',
  record_type: 'A',
  record_line: '默认',
  value: '',
  weight: undefined as number | undefined,
  mx: undefined as number | undefined,
  ttl: 600,
  remark: ''
})

// 验证规则
const rules = reactive<FormRules>({
  sub_domain: [{ required: true, message: '请输入主机记录', trigger: 'blur' }],
  record_type: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  record_line: [{ required: true, message: '请选择线路类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入记录值', trigger: 'blur' }],
  ttl: [{ required: true, message: '请输入TTL', trigger: 'blur' }],
  mx: [{ required: true, message: '请输入MX优先级', trigger: 'blur' }]
})

// 计算属性
const filteredData = computed(() => {
  return recordList.value.filter(item => {
    const matchesSearch = 
      item.sub_domain.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = typeFilter.value ? item.record_type === typeFilter.value : true
    return matchesSearch && matchesType
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const goBack = () => {
  router.push({ name: 'dns' })
}

const getRecordTypeTag = (type: string) => {
  const map: Record<string, string> = {
    A: '',
    CNAME: 'warning',
    MX: 'danger',
    TXT: 'info',
    AAAA: '',
    NS: 'success',
    SRV: 'info'
  }
  return map[type] || 'info'
}

const getValuePlaceholder = (type: string) => {
  switch (type) {
    case 'A': return '请输入IPV4地址，如：1.2.3.4'
    case 'CNAME': return '请输入域名，如：example.com'
    case 'MX': return '请输入邮件服务器地址'
    case 'AAAA': return '请输入IPV6地址'
    case 'TXT': return '请输入文本内容'
    case 'NS': return '请输入DNS服务器地址'
    default: return '请输入记录值'
  }
}

const handleTypeChange = () => {
  if (form.record_type !== 'MX') form.mx = undefined
  if (!['A', 'AAAA', 'CNAME'].includes(form.record_type)) form.weight = undefined
}

const handleSearch = () => {
  currentPage.value = 1
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getRecords(domainId.value, {
      keyword: searchQuery.value
    })
    recordList.value = res.list
    if (res.domain) {
      currentDomain.value = res.domain.domain_name
    }
    
    // 尝试从第一条记录获取域名信息（如果后端有返回）或者需要额外接口
    // 这里简单处理，如果列表有数据，取 domain.domain_name (如果后端做了 preload)
    // 或者我们直接在 url query 里传 domainName 会更方便，目前暂不处理 currentDomain
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleStatusChange = (row: DnsRecord) => {
  return new Promise<boolean>((resolve) => {
    const action = row.status === 'ENABLE' ? '暂停' : '启用'
    const newStatus = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    
    ElMessageBox.confirm(
      `确定要${action}该记录吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {
      row.statusLoading = true
      try {
        await setRecordStatus(domainId.value, row.record_id, newStatus)
        ElMessage.success(`${action}成功`)
        resolve(true)
      } catch (error) {
        console.error(error)
        resolve(false)
      } finally {
        row.statusLoading = false
      }
    }).catch(() => {
      resolve(false)
    })
  })
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    record_id: '0',
    sub_domain: '',
    record_type: 'A',
    record_line: '默认',
    value: '',
    weight: undefined,
    mx: undefined,
    ttl: 600,
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: DnsRecord) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: DnsRecord) => {
  ElMessageBox.confirm(
    `确定要删除记录 "${row.sub_domain} ${row.record_type}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await deleteRecord(domainId.value, row.record_id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          ...form,
          domain_id: parseInt(domainId.value)
        }
        
        if (isEdit.value) {
          await updateRecord(domainId.value, form.record_id, data)
          ElMessage.success('更新成功')
        } else {
          await createRecord(domainId.value, data)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.dns-record-management {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: var(--bg-primary);
    padding: 20px 24px;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .domain-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .header-right {
      display: flex;
      gap: 32px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: monospace;
        }
      }
    }
  }

  .main-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      .search-area {
        display: flex;
        gap: 12px;
        flex: 1;
        max-width: 500px;

        .search-input {
          width: 300px;
        }
        
        .filter-select {
          width: 140px;
        }
      }
    }

    .data-table {
      margin-bottom: 24px;

      .host-record {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--text-tertiary);
    line-height: 1.4;
    margin-top: 4px;
  }
  
  .text-secondary {
    color: var(--text-secondary);
  }
  
  .text-sm {
    font-size: 12px;
  }
  
  .ml-2 {
    margin-left: 8px;
  }
}
</style>
