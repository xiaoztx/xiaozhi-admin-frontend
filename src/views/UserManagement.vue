<template>
  <div class="user-management">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statistics" :key="index">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :class="stat.type">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-card shadow="never" class="main-card">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="left-tools">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/邮箱"
            class="search-input"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select 
            v-model="searchForm.role" 
            placeholder="角色" 
            clearable 
            class="filter-select" 
            @change="handleSearch"
          >
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>

          <el-select 
            v-model="searchForm.status" 
            placeholder="状态" 
            clearable 
            class="filter-select"
            @change="handleSearch"
          >
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </div>

        <div class="right-tools">
          <el-button type="primary" @click="handleAddUser">
            <el-icon class="mr-1"><Plus /></el-icon> 新增用户
          </el-button>
          <el-button @click="handleRefresh" :loading="refreshLoading" circle>
            <el-icon><RefreshRight /></el-icon>
          </el-button>
          <el-button 
            type="danger" 
            plain 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
        
        <el-table-column prop="id" label="用户ID" width="100" align="center" sortable />

        <el-table-column label="用户名" min-width="180">
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-avatar 
                :size="32" 
                class="user-avatar" 
                :src="row.avatar" 
                :style="!row.avatar ? { backgroundColor: getAvatarColor(row.username) } : {}"
              >
                {{ !row.avatar ? row.username.charAt(0).toUpperCase() : '' }}
              </el-avatar>
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />

        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" effect="plain" round>
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="disabled"
              inline-prompt
              active-text="正常"
              inactive-text="禁用"
              :disabled="row.role === 'super_admin'"
              :before-change="() => handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button 
              link 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="row.role === 'super_admin'"
            >
              删除
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
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      destroy-on-close
      align-center
      class="user-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <el-icon size="22" class="mr-2 dialog-icon" :class="isEdit ? 'primary' : 'success'">
            <Edit v-if="isEdit" />
            <UserFilled v-else />
          </el-icon>
          <span class="dialog-title">{{ isEdit ? '编辑用户' : '新增用户' }}</span>
        </div>
      </template>
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password 
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="userForm.role" 
            placeholder="请选择角色" 
            style="width: 100%"
            :disabled="isEdit && userForm.role === 'super_admin'"
          >
            <el-option label="超级管理员" value="super_admin" v-if="userForm.role === 'super_admin'" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group 
            v-model="userForm.status"
            :disabled="isEdit && userForm.role === 'super_admin'"
          >
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitUser" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { User, Search, Plus, RefreshRight, Edit, UserFilled, Message, Lock, Key } from '@element-plus/icons-vue'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'

// 统计数据
const statistics = computed(() => [
  { label: '总用户数', value: total.value, icon: User, type: 'primary' },
  { label: '活跃用户', value: userList.value.filter(u => u.status === 'active').length, icon: 'Check', type: 'success' },
  { label: '管理员', value: userList.value.filter(u => u.role === 'admin' || u.role === 'super_admin').length, icon: Key, type: 'warning' },
  { label: '本月新增', value: 0, icon: 'TrendCharts', type: 'info' },
])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  role: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const refreshLoading = ref(false)
const userList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedUsers = ref<any[]>([])

// 表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  id: 0,
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active'
})

const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const res: any = await getUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.keyword,
      status: searchForm.status,
      role: searchForm.role
    })
    userList.value = res.list
    total.value = res.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    refreshLoading.value = false
  }
}

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

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

const handleRefresh = () => {
  refreshLoading.value = true
  loadUserList()
}

const handleAddUser = () => {
  isEdit.value = false
  Object.assign(userForm, {
    id: 0,
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(userForm, { ...row, password: '' }) // 密码不回显
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      if (userList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      loadUserList()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  // 暂时不支持批量删除
  ElMessage.warning('暂不支持批量删除')
}

const handleStatusChange = (row: any) => {
  return new Promise<boolean>((resolve) => {
    const action = row.status === 'active' ? '禁用' : '启用'
    const newStatus = row.status === 'active' ? 'disabled' : 'active'
    
    ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {
      try {
        await updateUser(row.id, { ...row, status: newStatus })
        ElMessage.success(`${action}成功`)
        resolve(true)
      } catch (error) {
        resolve(false)
      }
    }).catch(() => {
      resolve(false)
    })
  })
}

const handleSubmitUser = async () => {
  if (!userFormRef.value) return
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateUser(userForm.id, userForm)
          ElMessage.success('更新成功')
        } else {
          await createUser(userForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadUserList()
      } catch (error) {
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const checkSelectable = (row: any) => {
  // 只有超级管理员不可被选中
  return row.role !== 'super_admin'
}

const handleSelectionChange = (val: any[]) => {
  selectedUsers.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadUserList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadUserList()
}

// 辅助函数
const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    super_admin: 'danger',
    admin: 'warning',
    user: 'primary',
    guest: 'info'
  }
  return map[role]
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户',
    guest: '访客'
  }
  return map[role] || role
}

const getAvatarColor = (username: string) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

onMounted(() => {
  loadUserList()
})
</script>

<style lang="scss" scoped>
.user-management {
  .mb-4 {
    margin-bottom: 20px;
  }
  
  .mr-1 {
    margin-right: 4px;
  }

  // 统计卡片样式
  .stat-card {
    transition: all 0.3s;
    height: 100%;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        
        &.primary { background: rgba(64, 158, 255, 0.1); color: var(--color-primary); }
        &.success { background: rgba(103, 194, 58, 0.1); color: var(--color-success); }
        &.warning { background: rgba(230, 162, 60, 0.1); color: var(--color-warning); }
        &.info { background: rgba(144, 147, 153, 0.1); color: var(--color-info); }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.2;
          margin-bottom: 4px;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }

  // 主内容卡片
  .main-card {
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  // 工具栏
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    .left-tools {
      display: flex;
      gap: 12px;
      flex: 1;
      min-width: 300px;

      .search-input {
        width: 240px;
      }

      .filter-select {
        width: 120px;
      }
    }

    .right-tools {
      display: flex;
      gap: 12px;
    }
  }

    .user-info-cell {
      display: flex;
      align-items: center;
      gap: 12px;
  
      .user-avatar {
        flex-shrink: 0;
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }
  
      .username {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .dialog-icon {
      &.primary { color: var(--color-primary); }
      &.success { color: var(--color-success); }
    }
    
    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .user-management {
    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .left-tools {
        flex-direction: column;
        
        .search-input, .filter-select {
          width: 100%;
        }
      }

      .right-tools {
        justify-content: space-between;
      }
    }
  }
}
</style>