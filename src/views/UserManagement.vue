<template>
  <div class="user-management">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <p class="page-description">管理系统用户账户和权限</p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.username"
            placeholder="用户名"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="searchForm.email"
            placeholder="邮箱"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            clearable
            style="width: 100px"
          >
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>

      <div class="toolbar-actions">
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <el-card class="user-table-card">
      <template #header>
        <div class="table-header">
          <span>用户列表</span>
          <el-text size="small" type="info">共 {{ total }} 个用户</el-text>
        </div>
      </template>

      <el-table
        :data="userList"
        style="width: 100%"
        :loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastLogin) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              text
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              text
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              text
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitUser">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'

// 表单数据
const searchForm = reactive({
  username: '',
  email: '',
  status: ''
})

const userForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active'
})

const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedUsers = ref<any[]>([])

// 模拟用户数据
const userList = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    lastLogin: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-02 09:00:00',
    lastLogin: '2024-01-14 16:20:00'
  },
  {
    id: 3,
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    status: 'disabled',
    createdAt: '2024-01-03 11:00:00',
    lastLogin: '2024-01-10 12:15:00'
  }
])

const userFormRef = ref<FormInstance>()

// 方法
const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索参数:', searchForm)
  loadUserList()
}

const handleRefresh = () => {
  loadUserList()
}

const handleAddUser = () => {
  isEdit.value = false
  Object.assign(userForm, {
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (user: any) => {
  isEdit.value = true
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    status: user.status
  })
  dialogVisible.value = true
}

const handleToggleStatus = async (user: any) => {
  try {
    const action = user.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}用户 ${user.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    user.status = user.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消操作
  }
}

const handleDelete = async (user: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = userList.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      userList.value.splice(index, 1)
      total.value--
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消操作
  }
}

const handleSubmitUser = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()

    if (isEdit.value) {
      // 编辑用户逻辑
      ElMessage.success('更新成功')
    } else {
      // 添加用户逻辑
      const newUser = {
        id: Date.now(),
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status,
        createdAt: new Date().toLocaleString(),
        lastLogin: '-'
      }
      userList.value.unshift(newUser)
      total.value++
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
  } catch {
    // 验证失败
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadUserList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadUserList()
}

const loadUserList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    total.value = userList.value.length
    loading.value = false
  }, 500)
}

const getRoleTagType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    user: 'primary',
    guest: 'info'
  }
  return types[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客'
  }
  return labels[role] || role
}

const formatDate = (date: string) => {
  return date
}

onMounted(() => {
  loadUserList()
})
</script>

<style lang="scss" scoped>
.user-management {
  .page-header {
    margin-bottom: 24px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .page-description {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
  }

  .user-table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .user-management {
    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .search-form {
        .el-form-item {
          margin-bottom: 8px;
        }
      }

      .toolbar-actions {
        justify-content: center;
      }
    }

    .user-table-card {
      .el-table {
        :deep(.el-table__cell) {
          padding: 8px;
        }
      }
    }
  }
}
</style>