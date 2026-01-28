<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="handleUpdateVisible"
    :title="`编辑存储策略 - ${form.name}`"
    width="800px"
    destroy-on-close
    class="edit-strategy-dialog"
  >
    <div class="edit-strategy-content" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="140px"
        status-icon
        class="edit-form"
      >
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：腾讯-文章图片" />
        </el-form-item>

        <el-form-item label="存储类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择存储类型" style="width: 100%" disabled>
            <el-option label="本地存储 (Local)" value="local" />
            <el-option label="腾讯云 COS" value="tencent" />
          </el-select>
        </el-form-item>

        <template v-if="form.type === 'tencent'">
          <el-divider content-position="center" class="custom-divider">腾讯云COS配置</el-divider>
          
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
          
          <el-form-item label="所属地域" prop="config.region">
            <el-input v-model="form.config.region" placeholder="例如 ap-shanghai" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              存储桶所在的地域，例如 ap-shanghai、ap-beijing。
            </div>
          </el-form-item>

          <el-divider content-position="center" class="custom-divider">路径设置</el-divider>

          <el-form-item label="云端存储根目录" prop="config.root">
              <el-input v-model="form.config.root" placeholder="例如 /files 或留空表示存储桶根目录" />
              <div class="form-tip text-gray-400 text-xs mt-1">
                文件在COS中的存放根目录，以 / 开头，留空表示存储桶根目录。
              </div>
          </el-form-item>

          <el-form-item label="应用内挂载路径" prop="path">
            <el-input v-model="form.path" placeholder="/cos" />
            <div class="form-tip text-gray-400 text-xs mt-1">
              此策略在应用内部的访问路径，<span class="text-warning">需保证唯一。</span>
            </div>
          </el-form-item>

          <el-divider content-position="center" class="custom-divider">API 密钥信息</el-divider>

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
          
          <!-- 高级配置部分 -->
          <div class="mt-8">
             <el-divider content-position="center" class="custom-divider">高级配置</el-divider>
             
             <el-form-item label="CDN加速域名">
               <el-input v-model="form.config.cdnDomain" placeholder="例如 https://cdn.example.com" />
               <div class="form-tip text-gray-400 text-xs mt-1">
                 填写完整的CDN访问地址（包含协议），用于替换文件URL中的主机名和协议部分。<br>
                 示例：https://cdn.example.com 或 https://files.yourdomain.com
               </div>
             </el-form-item>

             <el-form-item label="CDN 配置选项">
               <el-checkbox v-model="form.config.noCdnSign" label="不为 CDN 签名文件 URL" />
               <span class="inline-tip">如果您的 COS 域名设置中开启了“回源鉴权”，请勾选此项。</span>
             </el-form-item>

             <el-form-item label="下线中转">
               <el-checkbox v-model="form.config.offlineTransfer" label="开启下线中转" />
               <div class="form-tip text-gray-400 text-xs mt-1">
                 开启后，用户下载文件时会通过 咔卟哆代理，可以提供更好的访问控制和统计。
               </div>
             </el-form-item>

             <el-row :gutter="20">
               <el-col :span="12">
                 <el-form-item label="样式分隔符">
                   <el-input v-model="form.config.styleSeparator" placeholder="/ArticleImage 或 /CommentImage" />
                   <div class="form-tip text-gray-400 text-xs mt-1">
                     用于腾讯云数据万象的图片处理样式。<br>
                     <span class="font-bold">配置方法：</span><br>
                     1. 在腾讯云数据万象控制台创建图片样式（例如：ArticleImage）<br>
                     2. 在此处填写样式路径（例如：/ArticleImage）<br>
                     3. 系统会自动在图片URL后拼接样式分隔符和参数<br>
                     <span class="text-info">示例：如果配置为 /ArticleImage，生成的URL格式为：<br>
                     https://bucket.cos.region.myqcloud.com/path/image.jpg/ArticleImage</span>
                   </div>
                 </el-form-item>
               </el-col>
               <el-col :span="12">
                 <el-form-item label="默认访问样式">
                    <el-input v-model="form.config.visitStyle" placeholder="例如 web 或 original" />
                    <div class="form-tip text-gray-400 text-xs mt-1">
                      如果开启了原图保护，请在此填写允许访问的样式名称。<br>
                      <span class="text-danger">注意：如果遇到 "The image can not be accessed, please use style" 错误，说明您的存储桶开启了原图保护，必须在此配置样式。</span>
                    </div>
                 </el-form-item>
               </el-col>
             </el-row>
             
             <el-divider content-position="center" class="custom-divider">访问权限</el-divider>

             <el-form-item prop="config.acl" label-width="0">
               <div class="acl-cards">
                 <div 
                   class="acl-card" 
                   :class="{ active: form.config.acl === 'public-read' }"
                   @click="form.config.acl = 'public-read'"
                 >
                   <div class="acl-header">
                     <el-radio v-model="form.config.acl" label="public-read" value="public-read" class="acl-radio">公有读，私有写</el-radio>
                   </div>
                   <div class="acl-desc">
                     文件可以被公开访问（无需授权），但只有授权用户能上传/修改文件。适合用于网站静态资源、图片等公开内容。
                   </div>
                 </div>

                 <div 
                   class="acl-card" 
                   :class="{ active: form.config.acl === 'private' }"
                   @click="form.config.acl = 'private'"
                 >
                   <div class="acl-header">
                     <el-radio v-model="form.config.acl" label="private" value="private" class="acl-radio">私有读写</el-radio>
                   </div>
                   <div class="acl-desc">
                     文件的读取和写入都需要授权。适合用于存储敏感文件、私人文档等需要权限控制的内容。
                   </div>
                 </div>
               </div>
               <div class="form-tip text-info mt-2 font-bold">
                 提示：请确保您的COS存储桶访问权限与此设置一致。
               </div>
             </el-form-item>

             <div class="info-block mt-4 mb-4">
               <div class="info-title">关于数据万象服务</div>
               <div class="info-content">
                 如果您需要图片处理、缩略图生成等功能，请在 <a href="https://console.cloud.tencent.com/ci" target="_blank" class="text-info">腾讯云数据万象控制台</a> 中开通数据万象服务。系统会自动检测并使用相关功能。
               </div>
             </div>

             <div class="info-block mb-4">
               <div class="info-title">跨域策略配置</div>
               <div class="info-content">
                 系统会自动为您的存储桶配置以下跨域策略：
                 <ul class="cors-list">
                   <li><span class="label">来源：</span> * (允许所有来源)</li>
                   <li><span class="label">方法：</span> GET, POST, PUT, DELETE, HEAD</li>
                   <li><span class="label">允许的头部：</span> * (允许所有头部)</li>
                   <li><span class="label">暴露的头部：</span> ETag</li>
                   <li><span class="label">缓存时间：</span> 3600 秒</li>
                 </ul>
               </div>
             </div>

             <el-divider content-position="center" class="custom-divider">存储与上传</el-divider>

             <el-form-item label="文件大小限制" prop="maxSize">
               <el-input 
                 v-model.number="form.maxSize" 
                 placeholder="请输入大小"
               >
                 <template #append>字节</template>
               </el-input>
               <div class="form-tip text-gray-400 text-xs mt-1">
                 单个文件的最大大小限制（字节）。默认 10485760 字节（10MB），输入 0 表示不限制。
               </div>
             </el-form-item>

             <el-form-item label="上传分片大小" prop="config.uploadPartSize">
               <el-input 
                 v-model.number="form.config.uploadPartSize" 
                 placeholder="请输入大小"
               >
                 <template #append>MB</template>
               </el-input>
               <div class="form-tip text-gray-400 text-xs mt-1">
                 分片上传时每个分片的大小，0 表示使用后端默认值。
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
          </div>

        </template>

        <template v-if="form.type === 'local'">
          <!-- 本地存储的表单项保持原样，但也应用新的布局 -->
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="例如：评论图片、文章图片" />
          </el-form-item>

          <el-form-item label="存储路径" prop="path">
            <el-input v-model="form.path" placeholder="例如 /comments 或 /articles" />
          </el-form-item>

          <el-form-item label="单文件大小限制" prop="maxSize">
            <el-input 
              v-model.number="form.maxSize" 
              placeholder="请输入字节大小"
            >
              <template #append>字节</template>
            </el-input>
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
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { type FormInstance, type FormRules, ElMessage } from 'element-plus'
import { updateStorageStrategy, getStorageStrategy } from '@/api/storage-strategy'
import { isEqual, cloneDeep } from 'lodash-es'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<FormInstance>()
const submitting = ref(false)
const loading = ref(false)
const originalForm = ref<any>(null)

const form = reactive({
  id: 0,
  name: '',
  type: 'local',
  path: '',
  maxSize: 10485760,
  status: 'active',
  config: {
    // 默认值
    bucket: '',
    region: '',
    secretId: '',
    secretKey: '',
    domain: '',
    cdnDomain: '',
    root: '',
    acl: 'public-read',
    uploadType: 'direct',
    styleSeparator: '!',
    visitStyle: '',
    noCdnSign: false,
    offlineTransfer: false,
    uploadPartSize: 50
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
  name: [{ required: true, message: '', trigger: 'blur' }],
  type: [{ required: true, message: '', trigger: 'change' }],
  maxSize: [{ required: true, message: '', trigger: 'blur' }],
  path: [{ required: true, validator: validatePath, trigger: 'blur' }],
  'config.bucket': [{ required: true, message: '', trigger: 'blur' }],
  'config.region': [{ required: true, message: '', trigger: 'blur' }],
  'config.domain': [{ required: true, message: '', trigger: 'blur' }]
})

const closeDialog = () => {
  emit('update:modelValue', false)
}

const handleUpdateVisible = (val: boolean) => {
  emit('update:modelValue', val)
}

const loadData = async (id: number) => {
  if (!id) return
  loading.value = true
  try {
    // 从后端获取完整详情
    const res: any = await getStorageStrategy(id)
    const data = res.data || res // 兼容不同的响应结构
    
    // 基础字段复制
    form.id = data.id
    form.name = data.name
    form.type = data.type
    form.path = data.path
    form.status = data.status
    
    // 处理配置字段 (settings)
    let settings: any = {}
    try {
      if (data.settings) {
        settings = typeof data.settings === 'string'
          ? JSON.parse(data.settings)
          : data.settings
      }
    } catch (e) {
      console.error('解析配置失败', e)
    }
    
    // 映射 maxSize (优先从settings获取，如果没有则使用默认值)
    form.maxSize = settings.max_size || 10485760

    // 映射 top-level 字段到 config
    form.config.bucket = data.bucket_name || ''
    form.config.region = data.region || ''
    form.config.domain = data.domain || ''
    form.config.secretId = data.secret_id || ''
    form.config.secretKey = data.secret_key || ''
    form.config.root = data.root_path || ''
    form.config.acl = data.acl || 'public-read'
    
    // 映射 settings 字段到 config (snake_case 转 camelCase)
    form.config.cdnDomain = settings.cdn_domain || ''
    form.config.uploadType = settings.upload_method || 'direct'
    form.config.styleSeparator = settings.style_separator || '!'
    form.config.visitStyle = settings.visit_style || ''
    form.config.noCdnSign = settings.no_cdn_sign || false
    form.config.offlineTransfer = settings.offline_transfer || false
    form.config.uploadPartSize = settings.upload_part_size || 50

    // 保存初始状态用于比较
    originalForm.value = cloneDeep(form)
  } catch (error) {
    console.error('获取策略详情失败', error)
    ElMessage.error('获取策略详情失败')
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示和 ID 变化
watch(
  () => [props.modelValue, props.id],
  ([visible, id]) => {
    if (visible && id) {
      loadData(Number(id))
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 检查是否有修改
      if (isEqual(form, originalForm.value)) {
        ElMessage.info('未做出修改')
        return
      }

      submitting.value = true
      try {
        await updateStorageStrategy(form.id, form)
        ElMessage.success('保存成功')
        emit('submit')
        closeDialog()
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
.edit-strategy-content {
  padding: 0 20px;
  max-height: 65vh; /* 限制高度，允许滚动 */
  overflow-y: auto;
}

.custom-divider {
  margin: 40px 0 30px 0;
}
.custom-divider :deep(.el-divider__text) {
  font-size: 16px;
  color: #409eff; /* 蓝色文字 */
  font-weight: 500;
}

.form-tip {
  line-height: 1.5;
  color: #909399;
  font-size: 12px;
}
.text-warning { color: #e6a23c; }
.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
.text-info { color: #409eff; }
.mt-1 { margin-top: 0.25rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.font-bold { font-weight: 700; }

.info-block {
  background-color: #f0f9eb;
  padding: 16px;
  border-radius: 4px;
}
.info-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
.info-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
.cors-list {
  margin-top: 8px;
  padding-left: 20px;
}
.cors-list li {
  margin-bottom: 4px;
}
.cors-list .label {
  color: #409eff;
  font-weight: 500;
}
.acl-cards {
  display: flex;
  gap: 20px;
  width: 100%;
}
.acl-card {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.acl-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.acl-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}
.acl-header {
  margin-bottom: 8px;
}
.inline-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
}
.acl-radio :deep(.el-radio__label) {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}
.acl-card.active .acl-radio :deep(.el-radio__label) {
  color: #409eff;
}
.acl-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  padding-left: 24px; /* 对齐 Radio 文字 */
}
.acl-card.active .acl-desc {
  color: #409eff;
}
/* 暗黑模式适配 */
html.dark .custom-divider :deep(.el-divider__text) {
  background-color: var(--el-dialog-bg-color); /* 匹配 Dialog 背景 */
  color: #409eff;
}
html.dark .info-block {
  background-color: #1a2518; /* 对应浅色 #f0f9eb 的深色变体 */
}
html.dark .info-title {
  color: #a3a6ad;
}
html.dark .info-content {
  color: #cfd3dc;
}
html.dark .acl-card {
  border-color: #4c4d4f;
  background-color: transparent;
}
html.dark .acl-card:hover {
  border-color: #606266;
  background-color: #262727;
}
html.dark .acl-card.active {
  border-color: #409eff;
  background-color: #18222c; /* 深蓝色背景 */
}
html.dark .acl-radio :deep(.el-radio__label) {
  color: #e5eaf3;
}
html.dark .acl-card.active .acl-radio :deep(.el-radio__label) {
  color: #409eff;
}
html.dark .acl-desc {
  color: #a3a6ad;
}
html.dark .acl-card.active .acl-desc {
  color: #a0cfff;
}
</style>
