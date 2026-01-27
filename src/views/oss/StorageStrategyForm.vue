<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑存储策略' : '添加存储策略'"
    width="600px"
    destroy-on-close
    align-center
    class="oss-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        label-width="120px"
        status-icon
      >
      <el-form-item label="存储类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择存储类型" style="width: 100%">
          <el-option label="本地存储 (Local)" value="local" />
          <el-option label="腾讯云 COS" value="tencent" />
          <!-- 后续可扩展其他类型 -->
        </el-select>
      </el-form-item>

      <template v-if="form.type === 'tencent'">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：腾讯-文章图片" />
          <div class="form-tip text-gray-400 text-xs mt-1">
            存储策略的展示名，也会用于向用户展示。
          </div>
        </el-form-item>

        <el-form-item label="应用内挂载路径" prop="path">
          <el-input v-model="form.path" placeholder="/cos" />
          <div class="form-tip text-gray-400 text-xs mt-1">
            此策略在应用内部的访问路径，<span class="text-warning">需保证唯一，只允许一级路径</span>。<br>
            <span class="text-success">✓ 正确示例：/cos、/tencent、/tencent-cos</span><br>
            <span class="text-danger">✗ 错误示例：/data/cos、/storage/tencent</span>
          </div>
        </el-form-item>

        <div class="mt-4 mb-2 font-bold">腾讯云COS配置</div>
        <div class="form-tip text-gray-400 text-xs mb-4">
          前往 <a href="https://console.cloud.tencent.com/cos" target="_blank" class="text-info">腾讯云对象存储控制台</a> 创建存储桶，并获取访问密钥。
        </div>

        <el-form-item label="配置方式" prop="config.mode">
          <el-radio-group v-model="form.config.mode" @change="handleModeChange">
            <el-radio label="manual">手动输入</el-radio>
            <el-radio label="auto">自动获取</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.config.mode === 'auto'">
          <el-form-item label="选择云凭证" prop="config.credentialId">
            <el-select v-model="form.config.credentialId" placeholder="请选择云凭证" style="width: 100%" @change="handleCredentialChange">
              <el-option
                v-for="item in credentialOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <div class="form-tip text-gray-400 text-xs mt-1">
              自动获取当前用户在云配置管理中配置的腾讯云凭证。
            </div>
          </el-form-item>

          <template v-if="form.config.credentialId">
            <el-form-item label="存储桶名称" prop="config.bucket">
              <el-select 
                v-model="form.config.bucket" 
                placeholder="请选择存储桶" 
                style="width: 100%"
                @change="handleBucketChange"
              >
                <el-option
                  v-for="item in bucketOptions"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.region }}</span>
                </el-option>
              </el-select>
              <div class="form-tip text-gray-400 text-xs mt-1">
                从云凭证自动获取的存储桶列表。
              </div>
            </el-form-item>

            <el-form-item label="访问域名" prop="config.domain">
              <el-input v-model="form.config.domain" placeholder="自动获取访问域名" />
              <div class="form-tip text-gray-400 text-xs mt-1">
                从云凭证自动获取的访问域名，<span class="text-info">支持手动修改</span>（例如配置了CDN加速域名）。<br>
                <span class="text-warning">注意：请确保该云凭证拥有获取存储桶列表及文件的读写权限 (ListBucket, GetObject, PutObject 等)。</span>
              </div>
            </el-form-item>
          </template>
        </template>

        <template v-if="form.config.mode === 'manual'">
          <el-form-item label="存储桶名称" prop="config.bucket">
          <el-input v-model="form.config.bucket" placeholder="例如 my-bucket-1234567890" />
          <div class="form-tip text-gray-400 text-xs mt-1">
            在腾讯云COS控制台创建的存储桶名称，格式为 bucket-appid。
          </div>
        </el-form-item>

        <el-form-item label="访问域名" prop="config.domain">
            <el-input v-model="form.config.domain" placeholder="https://bucket-appid.cos.region.myqcloud.com 或 https://oss.yourdomain.com" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              在存储桶概况页面的"域名信息"栏下获取COS访问域名。<br>
              <span class="text-info">支持的域名类型：</span><br>
              • 默认域名：https://bucket-appid.cos.region.myqcloud.com<br>
              • 自定义源站域名：https://oss.yourdomain.com（需在COS控制台绑定）<br>
              此域名用于API操作（上传、删除、列表等），CDN加速域名请在下方单独配置。
            </div>
          </el-form-item>

          <div class="mt-4 mb-2 font-bold">API 密钥信息</div>
          <div class="form-tip text-gray-400 text-xs mb-4">
            前往 <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="text-info">腾讯云API密钥管理</a> 获取您的 SecretId 和 SecretKey。建议使用子用户账号，仅授予COS相关权限。
          </div>

          <el-form-item label="SecretId" prop="config.secretId">
            <el-input v-model="form.config.secretId" placeholder="请输入 SecretId" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              腾讯云API访问密钥 SecretId。
            </div>
          </el-form-item>

          <el-form-item label="SecretKey" prop="config.secretKey">
            <el-input v-model="form.config.secretKey" type="password" show-password placeholder="请输入 SecretKey" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              腾讯云API访问密钥 SecretKey。
            </div>
          </el-form-item>
        </template>

        <div class="mt-4 mb-2 font-bold">高级配置</div>
          
        <el-form-item label="云端存储根目录" prop="config.root">
            <el-input v-model="form.config.root" placeholder="例如 /files 或留空表示存储桶根目录" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              文件在COS中的存放根目录，以 / 开头，留空表示存储桶根目录。
            </div>
          </el-form-item>

          <el-form-item label="CDN加速域名" prop="config.cdnDomain">
            <el-input v-model="form.config.cdnDomain" placeholder="例如 https://cdn.example.com" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              如果您配置了CDN加速，请在此填写加速域名。留空则使用默认访问域名。
            </div>
          </el-form-item>

          <el-form-item label="访问权限" prop="config.acl">
            <div class="acl-options">
              <div 
                class="acl-item mb-2" 
                :class="{ active: form.config.acl === 'public-read' }"
                @click="form.config.acl = 'public-read'"
              >
                <div class="acl-radio">
                  <el-radio v-model="form.config.acl" label="public-read">公有读，私有写</el-radio>
                </div>
                <div class="acl-desc">
                  文件可以被公开访问（无需授权），但只有授权用户能上传/修改文件。适合用于网站静态资源、图片等公开内容。
                </div>
              </div>

              <div 
                class="acl-item" 
                :class="{ active: form.config.acl === 'private' }"
                @click="form.config.acl = 'private'"
              >
                <div class="acl-radio">
                  <el-radio v-model="form.config.acl" label="private">私有读写</el-radio>
                </div>
                <div class="acl-desc">
                  文件的读取和写入都需要授权。适合用于存储敏感文件、私人文档等需要权限控制的内容。
                </div>
              </div>
            </div>
            <div class="form-tip text-gray-400 text-xs mt-2">
              <span class="text-info">提示：</span>请确保您的COS存储桶访问权限与此设置一致。公有读需要将存储桶设置为"公有读私有写"或"公有读写"，私有读写需要将存储桶设置为"私有读写"。
            </div>
          </el-form-item>

          <el-form-item label="上传方式" prop="config.uploadType">
            <div class="upload-type-box">
              <div class="font-bold mb-1">客户端直传</div>
              <div class="text-xs text-gray-500">客户端直接上传到腾讯云COS，减少服务器带宽压力，提升上传效率</div>
            </div>
          </el-form-item>

          <div class="mt-4 mb-2 font-bold">关于数据万象服务</div>
          <div class="form-tip text-gray-400 text-xs mb-4">
            如果您需要图片处理、缩略图生成等功能，请在 <a href="https://console.cloud.tencent.com/ci" target="_blank" class="text-info">腾讯云数据万象控制台</a> 自行开通数据万象服务。开通后，系统将自动支持图片处理功能。
            <ul class="list-disc pl-5 mt-2">
              <li>实时图片缩放、裁剪、旋转</li>
              <li>图片格式转换（WEBP、HEIF等）</li>
              <li>图片质量压缩和优化</li>
              <li>图片水印和文字叠加</li>
            </ul>
          </div>

          <div class="mt-4 mb-2 font-bold">跨域策略配置</div>
          <div class="form-tip text-gray-400 text-xs mb-4">
            系统将自动为您的COS存储桶配置跨域策略（CORS），确保文件能被正常访问。
            <div class="bg-gray-50 p-3 rounded mt-2 border border-gray-100">
              <div class="font-bold mb-2">将自动配置以下CORS规则：</div>
              <div class="space-y-1">
                <div><span class="text-primary font-bold">来源：</span> * (允许所有来源)</div>
                <div><span class="text-primary font-bold">方法：</span> GET, POST, PUT, DELETE, HEAD</div>
                <div><span class="text-primary font-bold">允许Headers：</span> * (允许所有请求头)</div>
                <div><span class="text-primary font-bold">暴露Headers：</span> ETag</div>
                <div><span class="text-primary font-bold">缓存时间：</span> 3600秒</div>
              </div>
            </div>
          </div>

          <div class="mt-4 mb-2 font-bold">权限配置建议</div>
          <div class="form-tip text-gray-400 text-xs mb-4">
            为确保安全，建议：
            <ul class="list-disc pl-5 mt-2">
              <li>使用子用户账号，仅授予必要的COS权限</li>
              <li>定期更换API密钥</li>
              <li>设置合适的存储桶访问权限</li>
              <li>如需要跨域访问，请配置CORS规则</li>
            </ul>
          </div>

          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="form.status"
              active-value="active"
              inactive-value="inactive"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
      </template>

      <template v-if="form.type === 'local'">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：评论图片、文章图片" />
          <div class="form-tip text-gray-400 text-xs mt-1">
            存储策略的展示名，也会用于向用户展示。
          </div>
        </el-form-item>

        <el-form-item label="存储路径" prop="path">
          <el-input v-model="form.path" placeholder="例如 /comments 或 /articles" />
          <div class="form-tip text-gray-400 text-xs mt-1">
            文件的访问路径，<span class="text-warning">需保证唯一性，只允许一级路径</span>。<br>
            <span class="text-success">✓ 正确示例：/comments、/articles、/uploads</span><br>
            <span class="text-danger">✗ 错误示例：/data/comments、/storage/articles</span><br>
            <span class="text-info">实际存储位置：data/storage/路径名</span>
          </div>
        </el-form-item>

        <el-form-item label="单文件大小限制" prop="maxSize">
          <el-input 
            v-model.number="form.maxSize" 
            placeholder="请输入字节大小"
          >
            <template #append>字节</template>
          </el-input>
          <div class="form-tip text-gray-400 text-xs mt-1">
            单个文件的最大大小限制（字节）。默认 10485760 字节（10MB）。
          </div>
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
      </template>
    </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { type FormInstance, type FormRules, ElMessage } from 'element-plus'
import { getCloudConfigs, getCloudBuckets } from '@/api/cloud-config'
import { createStorageStrategy, updateStorageStrategy } from '@/api/storage-strategy'

const props = defineProps<{
  visible: boolean
  editData?: any
}>()

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => !!props.editData)

const credentialOptions = ref<any[]>([])

const form = reactive({
  id: 0,
  name: '',
  type: 'local',
  path: '',
  maxSize: 10485760,
  status: 'active',
  config: {
    mode: 'manual',
    credentialId: '',
    bucket: '',
    region: '',
    secretId: '',
    secretKey: '',
    domain: '',
    cdnDomain: '',
    root: '',
    acl: 'public-read',
    uploadType: 'direct'
  } as Record<string, any>
})

// 路径校验规则
const validatePath = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入存储路径'))
  } else if (!/^\/[a-zA-Z0-9_-]+$/.test(value)) {
    callback(new Error('只允许一级路径，例如：/uploads'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择存储类型', trigger: 'change' }],
  maxSize: [{ required: true, message: '请输入文件大小限制', trigger: 'blur' }],
  path: [{ required: true, validator: validatePath, trigger: 'blur' }]
})

// 初始化表单
watch(() => props.visible, (val) => {
  if (val) {
    if (props.editData) {
      Object.assign(form, props.editData)
      // 如果没有mode字段，默认为手动
      if (!form.config.mode) {
        form.config.mode = 'manual'
      }
    } else {
      Object.assign(form, {
        id: 0,
        name: '',
        type: 'local',
        path: '',
        maxSize: 10485760,
        status: 'active',
        config: {
          mode: 'manual',
          credentialId: '',
          bucket: '',
          region: '',
          secretId: '',
          secretKey: '',
          domain: '',
          cdnDomain: '',
          root: '',
          acl: 'public-read',
          uploadType: 'direct'
        }
      })
    }
  }
})

const handleModeChange = async (val: string) => {
  if (val === 'auto' && credentialOptions.value.length === 0) {
    await fetchCredentials()
  }
}

const fetchCredentials = async () => {
  try {
    const res: any = await getCloudConfigs({
      page: 1,
      pageSize: 100,
      provider: 'Tencent' // 目前只处理腾讯云
    })
    
    credentialOptions.value = res.list
      .filter((item: any) => item.status === 'active' || item.status === 'connected')
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        // 保存完整配置以便自动填充（如果需要）
        fullConfig: item
      }))
      
    if (credentialOptions.value.length === 0) {
      ElMessage.warning('未找到可用的腾讯云凭证')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取云凭证失败')
  }
}

const bucketOptions = ref<any[]>([])

const handleCredentialChange = async (val: number) => {
  const selectedCredential = credentialOptions.value.find(item => item.id === val)
  if (selectedCredential && selectedCredential.fullConfig) {
    const config = selectedCredential.fullConfig
    // 自动填充 SecretId 和 SecretKey
    form.config.secretId = config.accessKey || config.config?.accessKey || ''
    form.config.secretKey = config.secretKey || config.config?.secretKey || ''
    
    // 清空存储桶选择
    form.config.bucket = ''
    form.config.domain = ''
    form.config.cdnDomain = ''
    bucketOptions.value = []
    
    // 获取存储桶列表
    try {
      const res: any = await getCloudBuckets(val)
      bucketOptions.value = res.list
      if (bucketOptions.value.length === 0) {
        ElMessage.warning('该凭证下未找到存储桶')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('获取存储桶列表失败')
    }
  }
}

const handleBucketChange = (val: string) => {
  const selectedBucket = bucketOptions.value.find(item => item.name === val)
  if (selectedBucket) {
    form.config.domain = selectedBucket.domain
    form.config.region = selectedBucket.region
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateStorageStrategy(form.id, form)
        } else {
          await createStorageStrategy(form)
        }
        ElMessage.success('保存成功')
        emit('submit')
        emit('update:visible', false)
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

/* 滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}
.dialog-content::-webkit-scrollbar-thumb {
  background-color: var(--border-medium);
  border-radius: 3px;
}
.dialog-content::-webkit-scrollbar-track {
  background-color: transparent;
}

.form-tip {
  line-height: 1.5;
  color: var(--text-tertiary);
  font-size: 12px;
}
.text-warning { color: var(--color-warning); }
.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-info { color: var(--color-primary); }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.font-bold { font-weight: 700; color: var(--text-primary); }

.acl-item {
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--bg-primary);
}
.acl-item:hover {
  border-color: var(--border-medium);
  background-color: var(--bg-secondary);
}
.acl-item.active {
  border-color: var(--color-primary);
  background-color: rgba(64, 158, 255, 0.1);
}
.acl-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  margin-left: 24px;
  line-height: 1.5;
}
.upload-type-box {
  background-color: var(--bg-secondary);
  padding: 10px 15px;
  border-radius: 4px;
  width: 100%;
  color: var(--text-primary);
}

.list-disc { list-style-type: disc; }
.pl-5 { padding-left: 1.25rem; }
.bg-gray-50 { background-color: var(--bg-secondary); color: var(--text-primary); }
.p-3 { padding: 0.75rem; }
.rounded { border-radius: 0.25rem; }
.border { border-width: 1px; }
.border-gray-100 { border-color: var(--border-light); }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
.text-primary { color: var(--color-primary); }
</style>