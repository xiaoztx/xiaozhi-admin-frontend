<template>
  <div class="cloud-config-manage">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card card-blue">
        <div class="stat-content">
          <div class="stat-label">总配置数</div>
          <div class="stat-value">{{ configList.length }}</div>
        </div>
        <div class="stat-icon-bg">
          <el-icon><Cloudy /></el-icon>
        </div>
      </div>
      <div class="stat-card card-green">
        <div class="stat-content">
          <div class="stat-label">连接正常</div>
          <div class="stat-value">{{ configList.filter(item => item.status === 'active' || item.status === 'connected').length }}</div>
        </div>
        <div class="stat-icon-bg">
          <el-icon><Link /></el-icon>
        </div>
      </div>
      <div class="stat-card card-orange">
        <div class="stat-content">
          <div class="stat-label">连接异常</div>
          <div class="stat-value">{{ configList.filter(item => item.status === 'error' || item.status === 'inactive').length }}</div>
        </div>
        <div class="stat-icon-bg">
          <el-icon><Warning /></el-icon>
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
        :data="configList"
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
              <span class="dot" :class="(row.status === 'active' || row.status === 'connected') ? 'bg-success' : 'bg-danger'"></span>
              <span>{{ (row.status === 'active' || row.status === 'connected') ? '正常' : '异常' }}</span>
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
          :total="total"
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
          <el-input 
            v-model="form.accessKeyId" 
            placeholder="请输入 AccessKey ID"
            type="password"
            show-password
          >
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
import { ref, reactive, onMounted } from 'vue'
import { 
  Search, Plus, RefreshRight, Edit, Delete, 
  Cloudy, Link, Warning, User, Key, Lock, CreditCard,
  Connection
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getCloudConfigs, createCloudConfig, updateCloudConfig, deleteCloudConfig, connectTest } from '@/api/cloud-config'

// 类型定义
interface CloudConfig {
  id: number
  accountName: string // 对应后端 Name
  accountId?: string  // 对应后端 AccountID
  provider: string
  accessKeyId: string // 对应后端 AccessKey
  accessKeySecret: string // 对应后端 SecretKey
  status: 'active' | 'inactive' | 'error' | 'connected'
  createTime: string // 对应后端 CreatedAt
  remark?: string
}

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const providerFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 列表数据
const configList = ref<CloudConfig[]>([])

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

// 计算属性
// const connectedCount = computed(() => {
//   return configList.value.filter(item => item.status === 'active' || item.status === 'connected').length
// })

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 获取列表
const loadConfigs = async () => {
  loading.value = true
  try {
    const res: any = await getCloudConfigs({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value,
      provider: providerFilter.value
    })
    
    configList.value = res.list.map((item: any) => ({
      id: item.id,
      accountName: item.name,
      accountId: item.account_id,
      provider: item.provider,
      accessKeyId: item.access_key,
      status: item.status,
      createTime: formatDateTime(item.created_at),
      remark: item.remark
    }))
    total.value = res.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 方法
const getProviderLabel = (provider: string) => {
  const map: Record<string, string> = {
    'tencent': '腾讯云',
    'aliyun': '阿里云',
    'aws': 'AWS',
    'huawei': '华为云'
  }
  return map[provider.toLowerCase()] || provider
}

const getProviderTagType = (provider: string) => {
  const map: Record<string, string> = {
    'tencent': '',
    'aliyun': 'warning',
    'aws': 'danger',
    'huawei': 'danger'
  }
  return map[provider.toLowerCase()] as any || 'info'
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
  loadConfigs()
}

const handleRefresh = () => {
  loadConfigs()
  ElMessage.success('刷新成功')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadConfigs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadConfigs()
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

const handleConnect = async (row: CloudConfig) => {
  ElMessage.info(`正在连接 ${row.accountName}...`)
  try {
    await connectTest(row.id)
    ElMessage.success(`连接 ${row.accountName} 成功`)
    loadConfigs() // 重新加载列表以更新状态
  } catch (error) {
    // 错误已在拦截器处理
    loadConfigs() // 失败也刷新一下状态
  }
}

const handleEdit = (row: CloudConfig) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    accountName: row.accountName,
    accountId: row.accountId || '',
    provider: row.provider,
    accessKeyId: row.accessKeyId,
    accessKeySecret: '', // 编辑时不显示 SecretKey
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
  ).then(async () => {
    try {
      await deleteCloudConfig(row.id)
      ElMessage.success('删除成功')
      if (configList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      loadConfigs()
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
          name: form.accountName,
          account_id: form.accountId,
          provider: form.provider,
          access_key: form.accessKeyId,
          secret_key: form.accessKeySecret, // 后端已处理空值不更新的情况
          remark: form.remark
        }
        
        if (isEdit.value) {
          await updateCloudConfig(form.id, data)
          ElMessage.success('更新成功')
        } else {
          await createCloudConfig(data)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadConfigs()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadConfigs()
})
</script>

<style lang="scss" scoped>
.cloud-config-manage {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  // .stats-cards 样式已经提取到全局 main.scss

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