<template>
  <div class="cloud-config-manage">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-blue">
          <el-icon><Cloudy /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ configList.length }}</div>
          <div class="stat-label">总配置数</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-green">
          <el-icon><Link /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ connectedCount }}</div>
          <div class="stat-label">连接正常</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon bg-orange">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ configList.length - connectedCount }}</div>
          <div class="stat-label">连接异常</div>
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
            placeholder="搜索账户名称/ID/AccessKey"
            class="search-input"
            clearable
            @clear="handleSearch"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="providerFilter" placeholder="云服务商" clearable class="filter-select" @change="handleSearch">
            <el-option label="腾讯云" value="Tencent" />
            <el-option label="阿里云" value="Aliyun" />
            <el-option label="AWS" value="AWS" />
            <el-option label="华为云" value="Huawei" />
          </el-select>
        </div>
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>新增配置
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
        <el-table-column prop="accountName" label="账户名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="accountId" label="账号ID" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.accountId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="云服务商" width="120">
          <template #default="{ row }">
            <el-tag :type="getProviderTagType(row.provider)" :class="{ 'tencent-tag': row.provider === 'Tencent' }">
              {{ getProviderLabel(row.provider) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accessKeyId" label="AccessKey ID" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatAccessKey(row.accessKeyId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="连接状态" width="120">
          <template #default="{ row }">
            <div class="status-indicator">
              <span class="dot" :class="row.status === 'connected' ? 'bg-success' : 'bg-danger'"></span>
              <span>{{ row.status === 'connected' ? '正常' : '异常' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" width="180" sortable />
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="handleConnect(row)">
              <el-icon class="mr-1"><Connection /></el-icon>连接
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              <el-icon class="mr-1"><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon class="mr-1"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="暂无云配置数据" />
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑云配置' : '新增云配置'"
      width="600px"
      destroy-on-close
      align-center
      class="cloud-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <el-icon size="22" class="mr-2" :color="isEdit ? '#409EFF' : '#67C23A'">
            <Edit v-if="isEdit" />
            <Plus v-else />
          </el-icon>
          <span class="dialog-title">{{ isEdit ? '编辑云配置' : '新增云配置' }}</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="cloud-form"
        status-icon
      >
        <el-form-item label="账户名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账户名称（如：公司生产环境）">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="云服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择云服务商" style="width: 100%">
            <template #prefix>
              <el-icon><Cloudy /></el-icon>
            </template>
            <el-option label="腾讯云 (Tencent Cloud)" value="Tencent" />
            <el-option label="阿里云 (Aliyun)" value="Aliyun" />
            <el-option label="亚马逊云 (AWS)" value="AWS" />
            <el-option label="华为云 (Huawei Cloud)" value="Huawei" />
          </el-select>
        </el-form-item>

        <el-form-item label="账号ID" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入账号ID（可选）">
            <template #prefix>
              <el-icon><CreditCard /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-divider content-position="left">访问凭证</el-divider>

        <el-form-item label="AccessKey ID" prop="accessKeyId">
          <el-input v-model="form.accessKeyId" placeholder="请输入 AccessKey ID">
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="AccessKey Secret" prop="accessKeySecret">
          <el-input 
            v-model="form.accessKeySecret" 
            type="password" 
            placeholder="请输入 AccessKey Secret" 
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            placeholder="请输入备注信息（可选）" 
            :rows="3"
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
import { ref, computed, reactive } from 'vue'
import { 
  Search, Plus, RefreshRight, Edit, Delete, 
  Cloudy, Link, Warning, User, Key, Lock, CreditCard,
  Connection
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 类型定义
interface CloudConfig {
  id: number
  accountName: string
  accountId?: string
  provider: string
  accessKeyId: string
  accessKeySecret: string // 实际业务中不应在列表返回，这里仅作模拟
  status: 'connected' | 'disconnected'
  createTime: string
  remark?: string
}

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const providerFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟数据
const configList = ref<CloudConfig[]>([
  {
    id: 1,
    accountName: '腾讯云-生产环境',
    accountId: '100023456789',
    provider: 'Tencent',
    accessKeyId: 'AKIDz8krbsJ5yKB6...',
    accessKeySecret: '******',
    status: 'connected',
    createTime: '2023-12-01 10:30:00',
    remark: '主要生产环境'
  },
  {
    id: 2,
    accountName: '阿里云-测试环境',
    accountId: '156623456789',
    provider: 'Aliyun',
    accessKeyId: 'LTAI5t8krbsJ5yKB...',
    accessKeySecret: '******',
    status: 'connected',
    createTime: '2023-12-05 14:20:00',
    remark: '测试开发用'
  },
  {
    id: 3,
    accountName: 'AWS-海外业务',
    accountId: '882345678901',
    provider: 'AWS',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    accessKeySecret: '******',
    status: 'disconnected',
    createTime: '2023-12-10 09:15:00',
    remark: 'AccessKey已过期'
  }
])

// 表单数据
const form = reactive({
  id: 0,
  accountName: '',
  accountId: '',
  provider: '',
  accessKeyId: '',
  accessKeySecret: '',
  remark: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  accountName: [
    { required: true, message: '请输入账户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  provider: [
    { required: true, message: '请选择云服务商', trigger: 'change' }
  ],
  accessKeyId: [
    { required: true, message: '请输入 AccessKey ID', trigger: 'blur' }
  ],
  accessKeySecret: [
    { required: true, message: '请输入 AccessKey Secret', trigger: 'blur' }
  ]
})

// 计算属性：连接正常数量
const connectedCount = computed(() => {
  return configList.value.filter(item => item.status === 'connected').length
})

// 过滤后的数据
const filteredData = computed(() => {
  return configList.value.filter(item => {
    const matchesSearch = 
      item.accountName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.accountId && item.accountId.includes(searchQuery.value)) ||
      item.accessKeyId.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesProvider = providerFilter.value ? item.provider === providerFilter.value : true
    
    return matchesSearch && matchesProvider
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const getProviderLabel = (provider: string) => {
  const map: Record<string, string> = {
    'Tencent': '腾讯云',
    'Aliyun': '阿里云',
    'AWS': 'AWS',
    'Huawei': '华为云'
  }
  return map[provider] || provider
}

const getProviderTagType = (provider: string) => {
  const map: Record<string, string> = {
    'Tencent': '',
    'Aliyun': 'warning',
    'AWS': 'danger',
    'Huawei': 'danger' // Element Plus tag types limited, reusing danger
  }
  return map[provider] as any || 'info'
}

const formatAccessKey = (key: string) => {
  if (!key) return ''
  if (key.length <= 8) return key
  const start = key.slice(0, 4)
  const end = key.slice(-4)
  return `${start}***${end}`
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
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    accountName: '',
    accountId: '',
    provider: '',
    accessKeyId: '',
    accessKeySecret: '',
    remark: ''
  })
  dialogVisible.value = true
}

const handleConnect = (row: CloudConfig) => {
  ElMessage.info(`正在连接 ${row.accountName}...`)
  // 模拟连接测试
  setTimeout(() => {
    ElMessage.success(`连接 ${row.accountName} 成功`)
  }, 1500)
}

const handleEdit = (row: CloudConfig) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    accountName: row.accountName,
    accountId: row.accountId || '',
    provider: row.provider,
    accessKeyId: row.accessKeyId,
    accessKeySecret: '******', // 模拟编辑时不显示真实密钥
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleDelete = (row: CloudConfig) => {
  ElMessageBox.confirm(
    `确定要删除账户 "${row.accountName}" 吗？删除后将无法恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const index = configList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      configList.value.splice(index, 1)
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
        const now = new Date().toLocaleString().replace(/\//g, '-')
        if (isEdit.value) {
          // 编辑逻辑
          const index = configList.value.findIndex(item => item.id === form.id)
          if (index !== -1 && configList.value[index]) {
            Object.assign(configList.value[index]!, {
              accountName: form.accountName,
              accountId: form.accountId,
              provider: form.provider,
              accessKeyId: form.accessKeyId,
              remark: form.remark
            })
            ElMessage.success('更新成功')
          }
        } else {
          // 新增逻辑
          const newId = Math.max(...configList.value.map(i => i.id), 0) + 1
          configList.value.unshift({
            id: newId,
            accountName: form.accountName,
            accountId: form.accountId,
            provider: form.provider,
            accessKeyId: form.accessKeyId,
            accessKeySecret: form.accessKeySecret,
            status: 'connected', // 模拟默认连接成功
            createTime: now,
            remark: form.remark
          })
          ElMessage.success('添加成功')
        }
        submitting.value = false
        dialogVisible.value = false
      }, 800)
    }
  })
}
</script>

<style lang="scss" scoped>
.cloud-config-manage {
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
        &.bg-orange { background: linear-gradient(135deg, #E6A23C, #cf881e); }
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
        max-width: 600px;

        .search-input {
          width: 300px;
        }
        
        .filter-select {
          width: 160px;
        }
      }
    }

    .data-table {
      margin-bottom: 24px;
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.bg-success { background-color: var(--color-success); }
          &.bg-danger { background-color: var(--color-danger); }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }

  :deep(.cloud-dialog) {
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
  }
  
  .tencent-tag {
    background-color: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
  }
}
</style>