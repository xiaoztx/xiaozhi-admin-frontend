<template>
  <div class="dns-management">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-blue">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ domainList.length }}</div>
          <div class="stat-label">域名总数</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-green">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ activeCount }}</div>
          <div class="stat-label">解析正常</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-purple">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalRecords }}</div>
          <div class="stat-label">总记录数</div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区 -->
    <el-card class="main-card" shadow="never">
      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchQuery"
            placeholder="搜索域名"
            class="search-input"
            clearable
            @clear="handleSearch"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="statusFilter" placeholder="状态" clearable class="filter-select" @change="handleSearch">
            <el-option label="正常" value="active" />
            <el-option label="暂停" value="inactive" />
            <el-option label="锁定" value="locked" />
          </el-select>
        </div>
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>添加域名
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon class="mr-1"><RefreshRight /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="domainList"
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ background: 'var(--bg-tertiary)' }"
      >
        <el-table-column prop="domain" label="解析域名" min-width="180">
          <template #default="{ row }">
            <div class="domain-cell">
              <span class="domain-text">{{ row.domain }}</span>
              <el-tag size="small" effect="plain" class="provider-tag">{{ row.providerName }}</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="recordCount" label="记录数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" round>{{ row.recordCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="package" label="套餐" width="120">
          <template #default="{ row }">
            <span class="package-text">{{ row.package }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="lastOperationTime" label="最后操作" width="180" sortable />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleManage(row)">
              <el-icon class="mr-1"><Setting /></el-icon>解析
            </el-button>
            <el-divider direction="vertical" />
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon class="mr-1"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="暂无DNS域名数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加域名对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加解析域名"
      width="500px"
      destroy-on-close
      align-center
      class="dns-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <el-icon size="22" class="mr-2" color="#409EFF"><Plus /></el-icon>
          <span class="dialog-title">添加解析域名</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dns-form"
        status-icon
      >
        <el-form-item label="云凭证" prop="credentialId">
          <el-select v-model="form.credentialId" placeholder="请选择云服务商凭证" style="width: 100%">
            <el-option
              v-for="item in credentialOptions"
              :key="item.id"
              :label="`${item.name} (${item.provider})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="域名" prop="domain">
          <el-input 
            v-model="form.domain" 
            placeholder="请输入主域名（例如：example.com）"
          >
            <template #prefix>
              <el-icon><Monitor /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">请输入一级域名，请勿输入 www 等二级域名</div>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            placeholder="可选备注"
            :rows="2"
          />
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
import { useRouter } from 'vue-router'
import { 
  Search, Plus, RefreshRight, Delete, Setting, 
  Monitor, Check, List
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getDomains, addDomain, deleteDomain, getValidCloudConfigs } from '@/api/dns'

const router = useRouter()

// 类型定义
interface DnsDomain {
  id: number
  domain: string
  credentialId: number
  providerName: string
  status: string
  recordCount: number
  package: string
  lastOperationTime: string
  remark?: string
}

interface CredentialOption {
  id: number
  name: string
  provider: string
}

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 列表数据
const domainList = ref<DnsDomain[]>([])
const credentialOptions = ref<CredentialOption[]>([])

// 表单数据
const form = reactive({
  credentialId: undefined as number | undefined,
  domain: '',
  remark: ''
})

// 自定义域名验证
const validateDomain = (_rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入域名'))
  }
  
  if (value.startsWith('www.')) {
    return callback(new Error('请输入主域名，不要包含 www'))
  }
  
  const parts = value.split('.')
  if (parts.length < 2) {
    return callback(new Error('域名格式不正确'))
  }
  
  const domainRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  if (!domainRegex.test(value)) {
    return callback(new Error('域名格式包含非法字符'))
  }
  
  callback()
}

// 表单验证规则
const rules = reactive<FormRules>({
  credentialId: [
    { required: true, message: '请选择云凭证', trigger: 'change' }
  ],
  domain: [
    { required: true, validator: validateDomain, trigger: 'blur' }
  ]
})

// 计算属性
const activeCount = computed(() => domainList.value.filter(d => {
  if (!d.status) return false
  const s = d.status.toUpperCase()
  return s === 'ENABLE' || s === 'ACTIVE'
}).length)
const totalRecords = computed(() => domainList.value.reduce((sum, d) => sum + d.recordCount, 0))

// 加载数据
const loadDomains = async () => {
  loading.value = true
  try {
    const res: any = await getDomains({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value
    })
    
    domainList.value = res.list.map((item: any) => ({
      id: item.id,
      domain: item.domain_name,
      credentialId: item.cloud_config_id,
      providerName: item.cloud_config?.provider || 'Unknown',
      status: item.status || 'Unknown',
      recordCount: item.record_count,
      package: item.remark || '-',
      lastOperationTime: new Date(item.created_at).toLocaleString()
    }))
    total.value = res.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载可用凭证
const loadCredentials = async () => {
  try {
    const res: any = await getValidCloudConfigs()
    credentialOptions.value = res.list
  } catch (error) {
    console.error(error)
  }
}

// 方法
const getStatusLabel = (status: string) => {
  if (!status) return '未知'
  const normalizedStatus = status.toUpperCase()
  const map: Record<string, string> = {
    'ENABLE': '正常',
    'PAUSE': '暂停',
    'SPAM': '封禁',
    'LOCK': '锁定',
    'ACTIVE': '正常', // 兼容旧数据
    'INACTIVE': '暂停',
    'LOCKED': '锁定',
    'UNKNOWN': '未知'
  }
  return map[normalizedStatus] || status
}

const getStatusType = (status: string) => {
  if (!status) return 'info'
  const normalizedStatus = status.toUpperCase()
  const map: Record<string, string> = {
    'ENABLE': 'success',
    'ACTIVE': 'success',
    'PAUSE': 'warning',
    'INACTIVE': 'warning',
    'SPAM': 'danger',
    'LOCK': 'danger',
    'LOCKED': 'danger'
  }
  return map[normalizedStatus] as any || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
  loadDomains()
}

const handleRefresh = () => {
  loadDomains()
  ElMessage.success('刷新成功')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadDomains()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadDomains()
}

const handleAdd = async () => {
  // 先检查是否有可用凭证
  await loadCredentials()
  if (credentialOptions.value.length === 0) {
    ElMessageBox.alert('您还没有有效的云服务商凭证，请先前往"云配置管理"添加并连接验证。', '无法添加域名', {
      confirmButtonText: '去添加凭证',
      callback: (action: any) => {
        if (action === 'confirm') {
          router.push('/cloud-config')
        }
      }
    })
    return
  }

  form.credentialId = credentialOptions.value.length === 1 ? credentialOptions.value[0]?.id : undefined
  form.domain = ''
  form.remark = ''
  dialogVisible.value = true
}

const handleManage = (row: DnsDomain) => {
  router.push({
    name: 'dns-records',
    params: { domain: row.id }, // 路由参数定义为 :domain，这里传 ID
    query: { domainName: row.domain } // 传递域名名称，用于显示标题
  })
}

const handleDelete = (row: DnsDomain) => {
  ElMessageBox.confirm(
    `确定要删除域名 "${row.domain}" 吗？\n注意：此操作仅删除本地数据库记录，不会删除云服务商处的域名解析。`,
    '删除确认',
    {
      confirmButtonText: '仅删除本地记录',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await deleteDomain(row.id)
      ElMessage.success('删除成功')
      if (domainList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      loadDomains()
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
        await addDomain({
          cloud_config_id: form.credentialId,
          domain_name: form.domain,
          remark: form.remark
        })
        ElMessage.success('添加域名成功')
        dialogVisible.value = false
        loadDomains()
      } catch (error: any) {
        // 如果是特定错误，弹出详细提示
        if (error.response && error.response.data && error.response.data.error) {
           const errMsg = error.response.data.error
           if (errMsg.includes("当前域名未添加解析")) {
             ElMessageBox.alert('该域名尚未在您的腾讯云账号下添加解析，无法导入。请先在腾讯云控制台添加该域名。', '添加失败', {
               type: 'error',
               confirmButtonText: '知道了'
             })
             return
           }
        }
        console.error(error)
        // 错误信息已由拦截器显示，这里不再重复，或者是具体的业务错误
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadDomains()
})
</script>

<style lang="scss" scoped>
.dns-management {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 24px;

    .stat-card {
      border: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }

      :deep(.el-card__body) {
        display: flex;
        align-items: center;
        padding: 24px;
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        
        .el-icon {
          font-size: 28px;
          color: white;
        }

        &.bg-blue { background: linear-gradient(135deg, #409EFF, #0073e6); }
        &.bg-green { background: linear-gradient(135deg, #67C23A, #4e9e2b); }
        &.bg-purple { background: linear-gradient(135deg, #722ED1, #531dab); }
      }

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
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
          width: 120px;
        }
      }
    }

    .data-table {
      margin-bottom: 24px;

      .domain-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .domain-text {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary);
        }
        
        .provider-tag {
          width: fit-content;
          font-size: 11px;
          height: 20px;
          padding: 0 6px;
        }
      }
      
      .package-text {
        color: var(--text-secondary);
        font-size: 13px;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }

  :deep(.dns-dialog) {
    .el-dialog__header {
      margin-right: 0;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-light);
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .dialog-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1;
        display: flex;
        align-items: center;
      }
    }
    
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      line-height: 1.4;
      margin-top: 4px;
    }
  }
}
</style>