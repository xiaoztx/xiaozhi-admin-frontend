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
        :data="paginatedData"
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
          :total="filteredData.length"
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
              :label="`${item.accountName} (${item.provider})`"
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

const router = useRouter()

// 类型定义
interface DnsDomain {
  id: number
  domain: string
  credentialId: number
  providerName: string // 用于展示，实际业务可能通过关联查询
  status: 'active' | 'inactive' | 'locked'
  recordCount: number
  package: string
  lastOperationTime: string
}

interface CredentialOption {
  id: number
  accountName: string
  provider: string
}

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟凭证数据（实际应从 API 获取或 Store 获取）
const credentialOptions = ref<CredentialOption[]>([
  { id: 1, accountName: '腾讯云-生产环境', provider: 'Tencent' },
  { id: 2, accountName: '阿里云-测试环境', provider: 'Aliyun' },
  { id: 3, accountName: 'AWS-海外业务', provider: 'AWS' }
])

// 模拟域名数据
const domainList = ref<DnsDomain[]>([
  {
    id: 1,
    domain: 'xiaozhi.ai',
    credentialId: 1,
    providerName: 'Tencent',
    status: 'active',
    recordCount: 15,
    package: '企业版',
    lastOperationTime: '2024-01-20 14:30:00'
  },
  {
    id: 2,
    domain: 'example.com',
    credentialId: 2,
    providerName: 'Aliyun',
    status: 'active',
    recordCount: 8,
    package: '免费版',
    lastOperationTime: '2024-01-18 09:15:00'
  },
  {
    id: 3,
    domain: 'test-project.org',
    credentialId: 1,
    providerName: 'Tencent',
    status: 'inactive',
    recordCount: 0,
    package: '免费版',
    lastOperationTime: '2023-12-30 11:20:00'
  }
])

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
  
  // 简单的正则验证：字母数字连字符 + 点 + 字母
  // 排除 www. 开头
  if (value.startsWith('www.')) {
    return callback(new Error('请输入主域名，不要包含 www'))
  }
  
  // 检查点的数量，简单的二级域名判断 (example.com 是1个点, a.b.com 是2个点)
  // 这里做一个宽松的检查，主要为了提示用户
  const parts = value.split('.')
  if (parts.length < 2) {
    return callback(new Error('域名格式不正确'))
  }
  if (parts.length > 3) { // 允许 a.co.uk 这种3段的，更多段可能是子域名
     return callback(new Error('疑似子域名，请输入主域名'))
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
const activeCount = computed(() => domainList.value.filter(d => d.status === 'active').length)
const totalRecords = computed(() => domainList.value.reduce((sum, d) => sum + d.recordCount, 0))

const filteredData = computed(() => {
  return domainList.value.filter(item => {
    const matchesSearch = item.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value ? item.status === statusFilter.value : true
    return matchesSearch && matchesStatus
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: '正常',
    inactive: '暂停',
    locked: '锁定'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    locked: 'danger'
  }
  return map[status] as any || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 1000)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleAdd = () => {
  form.credentialId = undefined
  form.domain = ''
  form.remark = ''
  dialogVisible.value = true
}

const handleManage = (row: DnsDomain) => {
  router.push({ 
    name: 'dns-records', 
    params: { domain: row.domain } 
  })
}

const handleDelete = (row: DnsDomain) => {
  ElMessageBox.confirm(
    `确定要删除域名 "${row.domain}" 及其所有解析记录吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const index = domainList.value.findIndex(d => d.id === row.id)
    if (index !== -1) {
      domainList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        // 模拟添加
        const credential = credentialOptions.value.find(c => c.id === form.credentialId)
        domainList.value.unshift({
          id: Date.now(),
          domain: form.domain,
          credentialId: form.credentialId!,
          providerName: credential?.provider || 'Unknown',
          status: 'active',
          recordCount: 0,
          package: '免费版',
          lastOperationTime: new Date().toLocaleString().replace(/\//g, '-')
        })
        
        ElMessage.success('添加域名成功')
        dialogVisible.value = false
        submitting.value = false
      }, 800)
    }
  })
}

onMounted(() => {
  // 可以在这里加载真实数据
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