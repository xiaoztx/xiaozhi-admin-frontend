<template>
  <div class="oss-management">
    <el-card class="main-card" shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header-bar">
        <el-button @click="handleRefresh" class="refresh-btn">
          <el-icon class="mr-1"><Refresh /></el-icon>刷新
        </el-button>
        
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 卡片网格区域 -->
      <div class="storage-grid">
        <!-- 添加策略卡片 -->
        <div class="storage-card add-card" @click="handleAdd">
          <div class="add-content">
            <div class="plus-icon-wrapper">
              <el-icon><Plus /></el-icon>
            </div>
            <span class="add-text">添加存储策略</span>
          </div>
        </div>

        <!-- 存储策略卡片列表 -->
        <div 
          v-for="item in filteredList" 
          :key="item.id" 
          class="storage-card data-card"
          @click="handleEdit(item)"
        >
          <div class="card-icon">
            <el-icon v-if="item.type === 'local'"><Document /></el-icon>
            <el-icon v-else><Coin /></el-icon>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="tags-row">
              <el-tag 
                v-if="item.status === 'active'" 
                type="success" 
                effect="light" 
                class="status-tag"
              >已配置</el-tag>
              
              <el-tag type="info" effect="plain" class="type-tag">{{ item.providerKey }}</el-tag>
              
              <el-tag 
                v-if="item.defaultFor" 
                type="warning" 
                effect="dark" 
                class="default-tag"
              >{{ item.defaultFor }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑策略弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑存储策略' : '添加存储策略'"
      width="600px"
      destroy-on-close
      align-center
      class="oss-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="oss-form"
        status-icon
      >
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：腾讯-文章图片" />
        </el-form-item>

        <el-form-item label="存储类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择存储类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="本地存储 (Local)" value="local" />
            <el-option label="腾讯云 COS" value="tencent" />
            <el-option label="阿里云 OSS" value="aliyun" />
            <el-option label="AWS S3" value="aws" />
          </el-select>
        </el-form-item>

        <!-- 云存储特定字段 -->
        <template v-if="form.type !== 'local'">
          <el-form-item label="云凭证" prop="credentialId">
            <el-select v-model="form.credentialId" placeholder="请选择云凭证" style="width: 100%">
              <el-option
                v-for="cred in credentialOptions"
                :key="cred.id"
                :label="cred.name"
                :value="cred.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Bucket" prop="bucket">
            <el-input v-model="form.bucket" placeholder="请输入存储桶名称" />
          </el-form-item>

          <el-form-item label="Region" prop="region">
            <el-input v-model="form.region" placeholder="请输入地域 (如: ap-guangzhou)" />
          </el-form-item>
        </template>

        <!-- 本地存储特定字段 -->
        <template v-if="form.type === 'local'">
          <el-form-item label="存储路径" prop="path">
            <el-input v-model="form.path" placeholder="请输入服务器本地路径" />
          </el-form-item>
          
          <el-form-item label="访问域名" prop="domain">
            <el-input v-model="form.domain" placeholder="请输入访问域名" />
          </el-form-item>
        </template>

        <el-form-item label="默认用途" prop="defaultFor">
          <el-select v-model="form.defaultFor" placeholder="选择默认用途（可选）" clearable style="width: 100%">
            <el-option label="文章图片默认" value="文章图片默认" />
            <el-option label="用户头像默认" value="用户头像默认" />
            <el-option label="评论图片默认" value="评论图片默认" />
            <el-option label="所有分组默认" value="所有分组默认" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
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
  Search, Plus, Refresh, Document, Coin
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

// 类型定义
interface StorageStrategy {
  id: number
  name: string
  type: 'local' | 'tencent' | 'aliyun' | 'aws'
  providerKey: string
  status: 'active' | 'inactive'
  defaultFor?: string
  credentialId?: number
  bucket?: string
  region?: string
  path?: string
  domain?: string
}

// 状态变量
const searchQuery = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟数据
const strategyList = ref<StorageStrategy[]>([
  {
    id: 1,
    name: '腾讯-文章图片',
    type: 'tencent',
    providerKey: 'tenant_cos',
    status: 'active',
    defaultFor: '文章分组默认'
  },
  {
    id: 2,
    name: '腾讯-用户头像',
    type: 'tencent',
    providerKey: 'tenant_cos',
    status: 'active',
    defaultFor: '所有分组默认'
  },
  {
    id: 3,
    name: '腾讯-评论图片',
    type: 'tencent',
    providerKey: 'tencent_cos',
    status: 'active',
    defaultFor: '评论图片默认'
  },
  {
    id: 4,
    name: '内置-用户头像',
    type: 'local',
    providerKey: 'local',
    status: 'active'
  },
  {
    id: 5,
    name: '内置-文章图片',
    type: 'local',
    providerKey: 'local',
    status: 'active'
  },
  {
    id: 6,
    name: '内置-评论图片',
    type: 'local',
    providerKey: 'local',
    status: 'active'
  },
  {
    id: 7,
    name: '本机存储',
    type: 'local',
    providerKey: 'local',
    status: 'active'
  }
])

// 模拟云凭证选项
const credentialOptions = ref([
  { id: 1, name: '腾讯云-生产' },
  { id: 2, name: '阿里云-测试' }
])

// 表单数据
const form = reactive({
  id: 0,
  name: '',
  type: 'local',
  credentialId: undefined as number | undefined,
  bucket: '',
  region: '',
  path: '',
  domain: '',
  defaultFor: '',
  status: 'active'
})

// 表单验证
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择存储类型', trigger: 'change' }],
  credentialId: [{ required: true, message: '请选择云凭证', trigger: 'change' }],
  bucket: [{ required: true, message: '请输入Bucket名称', trigger: 'blur' }],
  region: [{ required: true, message: '请输入Region', trigger: 'blur' }],
  path: [{ required: true, message: '请输入存储路径', trigger: 'blur' }],
  domain: [{ required: true, message: '请输入访问域名', trigger: 'blur' }]
})

// 计算属性
const filteredList = computed(() => {
  if (!searchQuery.value) return strategyList.value
  const query = searchQuery.value.toLowerCase()
  return strategyList.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.providerKey.toLowerCase().includes(query)
  )
})

// 方法
const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleTypeChange = () => {
  // 清空特定字段
  form.credentialId = undefined
  form.bucket = ''
  form.region = ''
  form.path = ''
  form.domain = ''
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    name: '',
    type: 'tencent',
    credentialId: undefined,
    bucket: '',
    region: '',
    path: '',
    domain: '',
    defaultFor: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (item: StorageStrategy) => {
  isEdit.value = true
  Object.assign(form, { ...item })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        const providerKey = form.type === 'local' ? 'local' : 
                           form.type === 'tencent' ? 'tencent_cos' : 
                           form.type === 'aliyun' ? 'aliyun_oss' : 'aws_s3'
        
        const newItem: StorageStrategy = {
          id: isEdit.value ? form.id : Date.now(),
          name: form.name,
          type: form.type as any,
          providerKey: providerKey,
          status: form.status as any,
          defaultFor: form.defaultFor || undefined,
          credentialId: form.credentialId,
          bucket: form.bucket,
          region: form.region,
          path: form.path,
          domain: form.domain
        }

        if (isEdit.value) {
          const index = strategyList.value.findIndex(i => i.id === form.id)
          if (index !== -1) {
            strategyList.value[index] = newItem
            ElMessage.success('更新成功')
          }
        } else {
          strategyList.value.push(newItem)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        submitting.value = false
      }, 600)
    }
  })
}
</script>

<style lang="scss" scoped>
.oss-management {
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
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;

    .search-wrapper {
      width: 300px;
    }
  }

  .storage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .storage-card {
    height: 100px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: var(--bg-tertiary); // 使用主题背景色
    border: 1px solid var(--border-light);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-medium);
    }
  }

  .add-card {
    border: 1px dashed var(--border-medium);
    background-color: var(--bg-secondary); // 使用次级背景色
    justify-content: center;
    color: var(--text-secondary);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background-color: var(--bg-tertiary);
    }

    .add-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .plus-icon-wrapper {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .add-text {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .data-card {
    .card-icon {
      font-size: 28px;
      margin-right: 16px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
    }

    .card-content {
      flex: 1;
      overflow: hidden;

      .card-title {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tags-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .el-tag {
          height: 20px;
          padding: 0 6px;
          font-size: 11px;
          border: none;
        }

        .status-tag {
          background-color: rgba(103, 194, 58, 0.15); // 使用带透明度的颜色，适配暗黑模式
          color: var(--color-success);
        }

        .type-tag {
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .default-tag {
          background-color: rgba(230, 162, 60, 0.15);
          color: var(--color-warning);
        }
      }
    }
  }
}
</style>