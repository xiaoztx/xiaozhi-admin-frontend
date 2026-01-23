<template>
  <div class="github-account-manage">
    <el-card class="main-card" shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header-bar">
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>新增账户
          </el-button>
          <el-button type="success" @click="handleQuickConnect">
            <el-icon class="mr-1"><Connection /></el-icon>一键连接
          </el-button>
          <el-button @click="handleRefresh">
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
              <el-avatar :size="32" :src="row.avatarUrl" />
              <span class="ml-2">{{ row.username }}</span>
              <el-tag v-if="row.isPrimary" size="small" type="danger" effect="dark" class="ml-2">主账户</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="publicRepos" label="公开仓库" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" round>{{ row.publicRepos }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="followers" label="粉丝" width="100" align="center" />
        <el-table-column prop="following" label="关注" width="100" align="center" />
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="light">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.isPrimary"
              link 
              type="primary" 
              size="small" 
              @click="handleSetPrimary(row)"
            >
              <el-icon class="mr-1"><Star /></el-icon>设为主账户
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
        
        <el-form-item label="状态" prop="status">
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
import { ref, reactive, computed } from 'vue'
import { 
  Search, Plus, RefreshRight, Edit, Delete, Connection, Star, User, Key
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 类型定义
interface GithubAccount {
  id: number
  username: string
  nickname: string
  email: string
  avatarUrl: string
  publicRepos: number
  followers: number
  following: number
  status: 'active' | 'disabled'
  remark: string
  isPrimary: boolean
  token?: string
}

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟数据
const accountList = ref<GithubAccount[]>([
  {
    id: 1,
    username: 'xiaozhi-admin',
    nickname: '小植管理员',
    email: 'admin@xiaozhi.ai',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    publicRepos: 12,
    followers: 56,
    following: 10,
    status: 'active',
    remark: '主要维护账号',
    isPrimary: true
  },
  {
    id: 2,
    username: 'test-bot',
    nickname: '测试机器人',
    email: 'bot@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
    publicRepos: 5,
    followers: 2,
    following: 0,
    status: 'active',
    remark: 'CI/CD专用',
    isPrimary: false
  }
])

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
  let result = accountList.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.username.toLowerCase().includes(query) ||
      item.nickname.toLowerCase().includes(query)
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

const handleQuickConnect = () => {
  ElMessage.info('正在尝试连接 GitHub API...')
  setTimeout(() => {
    ElMessage.success('连接成功，API响应正常')
  }, 1500)
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    username: '',
    token: '',
    remark: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row: GithubAccount) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    token: '******', // 模拟不显示真实token
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
  ).then(() => {
    const index = accountList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      accountList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSetPrimary = (row: GithubAccount) => {
  ElMessageBox.confirm(
    `确定要将 "${row.username}" 设置为主账户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'primary'
    }
  ).then(() => {
    accountList.value.forEach(item => item.isPrimary = false)
    const target = accountList.value.find(item => item.id === row.id)
    if (target) {
      target.isPrimary = true
      ElMessage.success('设置成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        if (isEdit.value) {
          const index = accountList.value.findIndex(item => item.id === form.id)
          if (index !== -1 && accountList.value[index]) {
            // 模拟更新
            Object.assign(accountList.value[index]!, {
              username: form.username,
              remark: form.remark,
              status: form.status
            })
            ElMessage.success('更新成功')
          }
        } else {
          // 模拟新增，自动填充一些mock数据
          accountList.value.push({
            id: Date.now(),
            username: form.username,
            nickname: 'New User',
            email: 'user@example.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/0?v=4',
            publicRepos: 0,
            followers: 0,
            following: 0,
            status: form.status as any,
            remark: form.remark,
            isPrimary: false
          })
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        submitting.value = false
      }, 800)
    }
  })
}
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