<template>
  <div class="github-account-manage">
    <el-card class="main-card" shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header-bar">
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>新增账户
          </el-button>
          <el-button type="success" @click="handleQuickConnect" disabled>
            <el-icon class="mr-1"><Connection /></el-icon>一键连接(请针对单个账户操作)
          </el-button>
          <el-button :loading="loading" @click="handleRefresh">
            <el-icon class="mr-1"><RefreshRight /></el-icon>刷新
          </el-button>
        </div>
        
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名/昵称"
            class="search-input"
            clearable
            @clear="handleSearch"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
        <el-table-column prop="username" label="用户名" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar_url" />
              <span class="ml-2">{{ row.username }}</span>
              <el-tag v-if="row.isPrimary" size="small" type="danger" effect="dark" class="ml-2">主账户</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="public_repos" label="公开仓库" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" round>{{ row.public_repos }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="followers" label="粉丝" width="100" align="center" />
        <el-table-column prop="following" label="关注" width="100" align="center" />
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
             <el-button 
              v-if="row.status === 'pending'"
              link 
              type="success" 
              size="small" 
              :loading="connectLoading"
              @click="handleConnect(row)"
            >
              <el-icon class="mr-1"><Connection /></el-icon>连接
            </el-button>
            <el-button 
              v-if="row.status === 'active'"
              link 
              :type="row.isPrimary ? 'warning' : 'primary'" 
              size="small" 
              @click="handleSetPrimary(row)"
            >
              <el-icon class="mr-1"><Star /></el-icon>
              {{ row.isPrimary ? '取消主账户' : '设为主账户' }}
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              <el-icon class="mr-1"><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon class="mr-1"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑账户' : '新增账户'"
      width="500px"
      destroy-on-close
      align-center
      class="github-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="github-form"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入GitHub用户名">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="Token" prop="token">
          <el-input 
            v-model="form.token" 
            type="password" 
            placeholder="请输入Personal Access Token" 
            show-password
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">用于API访问和仓库操作</div>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            placeholder="可选备注"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status" v-if="isEdit">
           <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="disabled"
            active-text="启用"
            inactive-text="禁用"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Search, Plus, RefreshRight, Edit, Delete, Connection, Star, User, Key, Refresh
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getGithubAccounts, addGithubAccount, updateGithubAccount, deleteGithubAccount, connectGithubAccount, setPrimaryAccount } from '@/api/github'

// 类型定义
interface GithubAccount {
  id: number
  username: string
  email: string
  avatar_url: string
  status: 'active' | 'disabled' | 'pending'
  remark: string
  // 前端辅助字段，后端暂未返回
  nickname?: string
  public_repos?: number
  followers?: number
  following?: number
  is_primary?: boolean // 后端返回蛇形
  isPrimary?: boolean // 兼容旧逻辑
}

// 状态变量
const loading = ref(false)
const connectLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const accountList = ref<GithubAccount[]>([])

// 表单数据
const form = reactive({
  id: 0,
  username: '',
  token: '',
  remark: '',
  status: 'active'
})

// 验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  token: [{ required: true, message: '请输入Token', trigger: 'blur' }]
})

// 计算属性
const filteredData = computed(() => {
  let result = accountList.value.map(item => ({
    ...item,
    isPrimary: item.is_primary || item.isPrimary // 兼容处理
  }))
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.username.toLowerCase().includes(query)
    )
  }
  // 排序：主账户置顶
  return [...result].sort((a, b) => {
    return (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getGithubAccounts()
    accountList.value = res.list || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleRefresh = async () => {
  loading.value = true
  try {
    // 1. 获取最新列表
    await loadData()
    
    // 2. 筛选出已连接(active)的账户
    const activeAccounts = accountList.value.filter(acc => acc.status === 'active')
    
    if (activeAccounts.length > 0) {
      ElMessage.info(`正在同步 ${activeAccounts.length} 个账户...`)
      
      // 3. 并发同步所有 active 账户
      // 使用 Promise.allSettled 确保某个失败不影响其他
      const results = await Promise.allSettled(
        activeAccounts.map(acc => connectGithubAccount(acc.id))
      )
      
      // 4. 统计结果
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length
      
      if (failCount > 0) {
        ElMessage.warning(`同步完成：成功 ${successCount} 个，失败 ${failCount} 个`)
      } else {
        ElMessage.success(`全部 ${successCount} 个账户同步成功`)
      }
      
      // 5. 再次加载最新数据以更新 UI
      await loadData()
    } else {
      ElMessage.success('列表已刷新，暂无需要同步的账户')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleQuickConnect = () => {
  ElMessage.info('功能开发中...')
}

const handleConnect = async (row: GithubAccount) => {
  connectLoading.value = true
  try {
    await connectGithubAccount(row.id)
    const msg = row.status === 'active' ? '同步成功' : '连接成功，数据已同步'
    ElMessage.success(msg)
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    connectLoading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    username: '',
    token: '',
    remark: '',
    status: 'pending' // 默认为待连接
  })
  dialogVisible.value = true
}

// 辅助函数
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'pending': return 'warning'
    default: return 'info'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return '已连接'
    case 'pending': return '待连接'
    default: return '禁用'
  }
}

const handleEdit = (row: GithubAccount) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username, // username 不可编辑，但需要回显
    token: '', // 编辑时不显示旧 Token，只允许覆盖
    remark: row.remark,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = (row: GithubAccount) => {
  ElMessageBox.confirm(
    `确定要删除账户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await deleteGithubAccount(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleSetPrimary = (row: GithubAccount) => {
  // 如果当前是主账户，则执行取消操作；否则执行设置操作
  const action = row.isPrimary ? '取消' : '设置'
  const newStatus = !row.isPrimary
  
  ElMessageBox.confirm(
    `确定要将 "${row.username}" ${action}为主账户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await setPrimaryAccount(row.id, newStatus)
      ElMessage.success(`${action}主账户成功`)
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
        if (isEdit.value) {
          await updateGithubAccount(form.id, {
            token: form.token, // 如果为空，后端不更新
            remark: form.remark
          })
          ElMessage.success('更新成功')
        } else {
          await addGithubAccount({
            username: form.username,
            token: form.token,
            remark: form.remark
          })
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
.github-account-manage {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .main-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);
  }

  .page-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    .action-area {
      display: flex;
      gap: 12px;
    }

    .search-wrapper {
      width: 300px;
    }
  }

  .data-table {
    margin-bottom: 24px;

    .user-info {
      display: flex;
      align-items: center;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  .ml-2 {
    margin-left: 8px;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--text-tertiary);
    line-height: 1.4;
    margin-top: 4px;
  }
}
</style>