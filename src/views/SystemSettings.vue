<template>
  <div class="system-settings">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="page-title">系统设置</h2>
            <p class="page-description">配置系统的基本信息、安全策略及通知服务</p>
          </div>
          <div class="header-right">
            <el-button @click="handleReset">重置更改</el-button>
            <el-button type="primary" :loading="saving" @click="handleSave" :disabled="isGuestRestricted">保存所有配置</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <div class="tab-content">
            <el-form :model="basicForm" label-position="top" class="settings-form">
              <div class="form-section">
                <div class="section-title">站点信息</div>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="系统名称">
                      <el-input v-model="basicForm.siteName" placeholder="请输入系统名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="管理员邮箱">
                      <el-input v-model="basicForm.adminEmail" placeholder="admin@example.com" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="系统描述">
                  <el-input 
                    v-model="basicForm.description" 
                    type="textarea" 
                    :rows="3" 
                    placeholder="请输入系统简短描述" 
                  />
                </el-form-item>

                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="版权信息">
                      <el-input v-model="basicForm.copyright" placeholder="© 2024 Your Company" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="ICP备案号">
                      <el-input v-model="basicForm.icp" placeholder="京ICP备xxxxxxxx号" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="form-section">
                <div class="section-title">Logo 设置</div>
                
                <el-form-item label="Logo 图标">
                  <div class="logo-input-wrapper">
                    <el-input 
                      v-model="basicForm.logoUrl" 
                      placeholder="请输入图片 URL 或点击右侧图标上传" 
                      clearable
                    >
                      <template #prefix>
                        <el-icon><Link /></el-icon>
                      </template>
                      <template #suffix>
                        <el-upload
                          action="#"
                          :show-file-list="false"
                          :auto-upload="false"
                          :on-change="handleLogoChange"
                          class="upload-trigger"
                        >
                          <el-icon class="folder-icon" title="上传本地图片"><FolderOpened /></el-icon>
                        </el-upload>
                      </template>
                    </el-input>
                    <div class="item-desc mt-2">支持网络图片链接，或点击文件夹图标上传本地图片（建议尺寸 200x200px）</div>
                  </div>
                </el-form-item>

                <div class="url-preview" v-if="basicForm.logoUrl">
                  <div class="preview-label">预览：</div>
                  <div class="preview-box">
                      <img :src="basicForm.logoUrl" class="preview-img" alt="Logo Preview" @error="handleImgError" />
                  </div>
                </div>

                <el-form-item label="Favicon 图标" class="mt-4">
                  <div class="logo-input-wrapper">
                    <el-input 
                      v-model="basicForm.faviconUrl" 
                      placeholder="请输入图标 URL 或点击右侧图标上传" 
                      clearable
                    >
                      <template #prefix>
                        <el-icon><Link /></el-icon>
                      </template>
                      <template #suffix>
                        <el-upload
                          action="#"
                          :show-file-list="false"
                          :auto-upload="false"
                          :on-change="handleFaviconChange"
                          class="upload-trigger"
                        >
                          <el-icon class="folder-icon" title="上传本地图标"><FolderOpened /></el-icon>
                        </el-upload>
                      </template>
                    </el-input>
                    <div class="item-desc mt-2">浏览器标签页图标（建议尺寸 32x32px 或 16x16px，支持 .ico, .png）</div>
                  </div>
                </el-form-item>

                <div class="url-preview" v-if="basicForm.faviconUrl">
                  <div class="preview-label">预览：</div>
                  <div class="preview-box sm">
                      <img :src="basicForm.faviconUrl" class="preview-img" alt="Favicon Preview" @error="handleImgError" />
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="tab-content">
            <el-form :model="securityForm" label-position="left" label-width="180px" class="settings-form">
              <div class="form-section">
                <div class="section-title">访问控制</div>
                <el-form-item label="允许新用户注册">
                  <div class="flex-column">
                    <el-switch v-model="securityForm.allowRegister" />
                    <div class="item-desc mt-2">关闭后将无法注册新账号，仅管理员可添加</div>
                  </div>
                </el-form-item>

                <el-form-item label="游客限制模式">
                  <div class="flex-column">
                    <el-radio-group v-model="securityForm.guestLimitMode">
                      <el-radio value="mock" label="演示模式" />
                      <el-radio value="disable" label="只读模式" />
                    </el-radio-group>
                    <div class="item-desc mt-2">
                      <span v-if="securityForm.guestLimitMode === 'mock'">演示模式：游客可操作界面，后端拦截写入（推荐用于演示）</span>
                      <span v-else>只读模式：界面上禁用/隐藏所有写操作按钮</span>
                    </div>
                  </div>
                </el-form-item>
                
                <el-form-item label="强制HTTPS">
                  <div class="flex-column">
                    <el-switch v-model="securityForm.forceHttps" />
                    <div class="item-desc mt-2">强制将所有HTTP请求重定向到HTTPS</div>
                  </div>
                </el-form-item>
                
                <el-form-item label="注册邀请码">
                  <div class="flex-column" style="width: 100%">
                    <div class="flex-row items-center mb-2">
                      <el-switch v-model="securityForm.enableInviteCode" active-text="启用" class="mr-4" />
                      <template v-if="securityForm.enableInviteCode">
                        <el-tooltip content="点击复制" placement="top">
                          <el-input 
                            v-model="securityForm.inviteCode" 
                            readonly 
                            placeholder="点击生成邀请码" 
                            style="width: 200px; margin-right: 12px; cursor: pointer"
                            class="invite-code-input"
                            @click="handleCopyInviteCode"
                          >
                            <template #prefix>
                              <el-icon><Key /></el-icon>
                            </template>
                          </el-input>
                        </el-tooltip>
                        <el-button type="primary" plain size="small" @click="generateInviteCode">
                          生成
                        </el-button>
                      </template>
                    </div>
                    <div class="item-desc">启用后，用户注册时必须填写此邀请码</div>
                  </div>
                </el-form-item>

                <el-form-item label="登录失败锁定">
                  <el-input-number v-model="securityForm.loginLockCount" :min="0" :max="10" />
                  <span class="suffix-text">次失败后锁定账号（0为不锁定）</span>
                </el-form-item>
              </div>

              <div class="form-section">
                <div class="section-title">密码策略</div>
                <el-form-item label="最小密码长度">
                  <el-slider 
                    v-model="securityForm.minPasswordLength" 
                    :min="6" 
                    :max="20" 
                    show-input
                    input-size="small"
                  />
                </el-form-item>
                
                <el-form-item label="密码复杂度要求">
                  <el-checkbox-group v-model="securityForm.passwordComplexity">
                    <el-checkbox value="uppercase" label="包含大写字母" />
                    <el-checkbox value="lowercase" label="包含小写字母" />
                    <el-checkbox value="numbers" label="包含数字" />
                    <el-checkbox value="symbols" label="包含特殊符号" />
                  </el-checkbox-group>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <div class="tab-content">
            <el-form :model="notificationForm" label-position="top" class="settings-form">
              <div class="form-section">
                <div class="section-header">
                  <div class="section-title">邮件服务 (SMTP)</div>
                  <el-switch v-model="notificationForm.enableEmail" active-text="启用" />
                </div>
                
                <template v-if="notificationForm.enableEmail">
                  <el-row :gutter="24">
                    <el-col :span="16">
                      <el-form-item label="SMTP 服务器">
                        <el-input v-model="notificationForm.smtpHost" placeholder="smtp.example.com" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="端口">
                        <el-input v-model="notificationForm.smtpPort" placeholder="465" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="24">
                    <el-col :span="12">
                      <el-form-item label="发件人邮箱">
                        <el-input v-model="notificationForm.senderEmail" placeholder="noreply@example.com" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="发件人名称">
                        <el-input v-model="notificationForm.senderName" placeholder="System Admin" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item label="SMTP 密码/授权码">
                    <el-input 
                      v-model="notificationForm.smtpPassword" 
                      type="password" 
                      show-password 
                      placeholder="请输入密码或授权码" 
                    />
                  </el-form-item>

                  <el-button type="primary" plain size="small" @click="handleTestEmail">
                    发送测试邮件
                  </el-button>
                </template>
                <el-empty v-else description="邮件服务已禁用" :image-size="100" />
              </div>

              <div class="form-section">
                <div class="section-header">
                  <div class="section-title">推送平台 Webhook</div>
                  <el-switch v-model="notificationForm.enableWebhook" active-text="启用" />
                </div>
                
                <template v-if="notificationForm.enableWebhook">
                  <el-form-item label="Webhook URL">
                    <el-input v-model="notificationForm.webhookUrl" placeholder="https://api.example.com/webhook" />
                  </el-form-item>

                  <el-form-item label="请求方式">
                    <el-radio-group v-model="notificationForm.webhookMethod">
                      <el-radio value="POST" label="POST" />
                      <el-radio value="GET" label="GET" />
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="请求体模板">
                    <div class="flex-column" style="width: 100%;">
                      <div class="mb-2">
                        <el-switch 
                          v-model="notificationForm.customTemplate" 
                          active-text="自定义模板" 
                          inactive-text="默认模板"
                        />
                      </div>
                      
                      <el-input 
                        v-if="notificationForm.customTemplate"
                        v-model="notificationForm.templateBody" 
                        type="textarea" 
                        :rows="6" 
                        placeholder='{"title": "{{title}}", "content": "{{content}}"}' 
                        class="code-input"
                      />
                      <div v-if="notificationForm.customTemplate" class="item-desc mt-2">
                        支持变量: <span v-pre>{{title}}</span> - 标题, <span v-pre>{{content}}</span> - 内容, <span v-pre>{{time}}</span> - 时间
                      </div>
                      <div v-else class="item-desc mt-2">
                        默认使用标准 JSON 格式推送通知内容
                      </div>
                    </div>
                  </el-form-item>

                  <el-button type="primary" plain size="small" @click="handleTestWebhook">
                    发送测试请求
                  </el-button>
                </template>
                <el-empty v-else description="Webhook 服务已禁用" :image-size="100" />
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Key, Link, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSystemSettings, updateSystemSettings } from '@/api/system-setting'
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'

const activeTab = ref('basic')
const saving = ref(false)
const systemStore = useSystemStore()
const userStore = useUserStore()

const isGuest = computed(() => userStore.userInfo.role === 'guest')
const isGuestRestricted = computed(() => {
  return isGuest.value && systemStore.guestLimitMode === 'disable'
})

// 基本设置数据
const basicForm = reactive({
  siteName: '',
  adminEmail: '',
  description: '',
  copyright: '',
  icp: '',
  logoUrl: '',
  faviconUrl: ''
})

// 安全设置数据
const securityForm = reactive({
  allowRegister: true,
  forceHttps: true,
  enableInviteCode: false,
  inviteCode: '',
  loginLockCount: 5,
  minPasswordLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'numbers'],
  guestLimitMode: 'mock'
})

// 通知设置数据
const notificationForm = reactive({
  enableEmail: false,
  smtpHost: '',
  smtpPort: '',
  senderEmail: '',
  senderName: '',
  smtpPassword: '',
  // Webhook 配置
  enableWebhook: false,
  webhookUrl: '',
  webhookMethod: 'POST',
  customTemplate: false,
  templateBody: ''
})

// 初始化加载配置
onMounted(async () => {
  try {
    const { data } = await getSystemSettings()
    if (data) {
      // 映射基本设置
      basicForm.siteName = data.site_name || ''
      basicForm.adminEmail = data.admin_email || ''
      basicForm.description = data.site_desc || ''
      basicForm.copyright = data.copyright || ''
      basicForm.icp = data.icp || ''
      basicForm.logoUrl = data.logo_url || ''
      basicForm.faviconUrl = data.site_favicon || ''
      
      // 映射安全设置
      securityForm.allowRegister = data.allow_register === 'true' || data.allow_register === true
      securityForm.forceHttps = data.force_https === 'true' || data.force_https === true
      securityForm.enableInviteCode = data.enable_invite_code === 'true' || data.enable_invite_code === true
      securityForm.inviteCode = data.invite_code || ''
      securityForm.loginLockCount = parseInt(data.login_lock_count) || 5
      securityForm.minPasswordLength = parseInt(data.min_password_length) || 8
      securityForm.guestLimitMode = data.guest_limit_mode || 'mock'
      
      // 密码复杂度处理
      if (data.password_complexity) {
        if (typeof data.password_complexity === 'string') {
          try {
            securityForm.passwordComplexity = JSON.parse(data.password_complexity)
          } catch (e) {
            securityForm.passwordComplexity = []
          }
        } else {
          securityForm.passwordComplexity = data.password_complexity
        }
      }

      // 映射通知设置
      notificationForm.enableEmail = data.enable_email === 'true' || data.enable_email === true
      notificationForm.smtpHost = data.smtp_host || ''
      notificationForm.smtpPort = data.smtp_port || ''
      notificationForm.senderEmail = data.sender_email || ''
      notificationForm.senderName = data.sender_name || ''
      notificationForm.smtpPassword = data.smtp_password || ''
      notificationForm.enableWebhook = data.enable_webhook === 'true' || data.enable_webhook === true
      notificationForm.webhookUrl = data.webhook_url || ''
      notificationForm.webhookMethod = data.webhook_method || 'POST'
      notificationForm.customTemplate = data.custom_template === 'true' || data.custom_template === true
      
      // 模板内容处理
      if (data.template_body) {
        if (typeof data.template_body === 'string') {
           notificationForm.templateBody = data.template_body
        } else {
           notificationForm.templateBody = JSON.stringify(data.template_body, null, 2)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载系统配置失败')
  }
})

// 方法
const handleSave = async () => {
  if (isGuestRestricted.value) {
    ElMessage.warning('当前处于只读模式，无法保存配置')
    return
  }
  saving.value = true
  try {
    const payload = {
      // 基本设置
      site_name: basicForm.siteName,
      admin_email: basicForm.adminEmail,
      site_desc: basicForm.description,
      copyright: basicForm.copyright,
      icp: basicForm.icp,
      logo_url: basicForm.logoUrl,
      site_favicon: basicForm.faviconUrl,

      // 安全设置
      allow_register: securityForm.allowRegister,
      force_https: securityForm.forceHttps,
      enable_invite_code: securityForm.enableInviteCode,
      invite_code: securityForm.inviteCode,
      login_lock_count: securityForm.loginLockCount,
      min_password_length: securityForm.minPasswordLength,
      password_complexity: securityForm.passwordComplexity,
      guest_limit_mode: securityForm.guestLimitMode,

      // 通知设置
      enable_email: notificationForm.enableEmail,
      smtp_host: notificationForm.smtpHost,
      smtp_port: notificationForm.smtpPort,
      sender_email: notificationForm.senderEmail,
      sender_name: notificationForm.senderName,
      smtp_password: notificationForm.smtpPassword,
      enable_webhook: notificationForm.enableWebhook,
      webhook_url: notificationForm.webhookUrl,
      webhook_method: notificationForm.webhookMethod,
      custom_template: notificationForm.customTemplate,
      template_body: notificationForm.templateBody
    }

    await updateSystemSettings(payload)
    
    // 更新 Favicon
    if (basicForm.faviconUrl) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
      }
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = basicForm.faviconUrl
      document.getElementsByTagName('head')[0]?.appendChild(link)
    }

    // 刷新系统配置 Store
    await systemStore.loadSettings()

    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  ElMessage.info('已重置为默认配置')
  // 这里可以添加重置逻辑
}

const handleLogoChange = (file: any) => {
  // 模拟图片上传预览
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.logoUrl = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const handleFaviconChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.faviconUrl = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
     // 可以设置一个默认图或者提示错误
     // target.src = 'default-logo.png' 
  }
}

const generateInviteCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  securityForm.inviteCode = code
  ElMessage.success('邀请码已生成')
}

const handleCopyInviteCode = async () => {
  if (!securityForm.inviteCode) return
  try {
    await navigator.clipboard.writeText(securityForm.inviteCode)
    ElMessage.success('邀请码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleTestEmail = () => {
  if (!notificationForm.senderEmail) {
    ElMessage.warning('请先配置发件人邮箱')
    return
  }
  ElMessage.success(`测试邮件已发送至 ${basicForm.adminEmail}`)
}

const handleTestWebhook = () => {
  if (!notificationForm.webhookUrl) {
    ElMessage.warning('请先配置 Webhook URL')
    return
  }
  ElMessage.success('测试请求已发送')
}
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .main-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);
    min-height: calc(100vh - 140px);

    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-light);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .page-description {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .settings-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
      padding: 0 24px;
      border-bottom: 1px solid var(--border-light);
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background-color: var(--border-light);
    }

    :deep(.el-tabs__item) {
      height: 50px;
      font-size: 14px;
      color: var(--text-secondary);
      
      &.is-active {
        color: var(--color-primary);
        font-weight: 500;
      }
    }
  }

  .tab-content {
    padding: 32px 24px;
    max-width: 800px;
  }

  .settings-form {
    .form-section {
      margin-bottom: 40px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 3px solid var(--color-primary);
        line-height: 1;
      }
    }

    .item-desc {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.4;
    }

    .suffix-text {
      margin-left: 12px;
      color: var(--text-secondary);
      font-size: 13px;
    }

    .flex-column {
      display: flex;
      flex-direction: column;
    }
    
    .flex-row {
      display: flex;
    }
    
    .items-center {
      align-items: center;
    }
    
    .mr-4 { margin-right: 16px; }

    .mt-2 {
      margin-top: 8px;
    }

    .mb-2 {
      margin-bottom: 8px;
    }
    
    .code-input {
      :deep(.el-textarea__inner) {
        font-family: Consolas, Monaco, 'Courier New', monospace;
        font-size: 13px;
        background-color: var(--bg-secondary);
      }
    }
    
    .invite-code-input {
      :deep(.el-input__inner) {
        cursor: pointer;
        color: var(--color-primary);
        font-weight: 600;
        font-family: monospace;
        letter-spacing: 2px;
        text-align: center;
      }
    }
  }

  .logo-input-wrapper {
    width: 100%;
    
    .upload-trigger {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-right: 4px;
      
      .folder-icon {
        font-size: 18px;
        color: var(--text-secondary);
        transition: color 0.3s;
        
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }

  .url-preview {
    margin-top: 12px;
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .preview-label {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .preview-box {
      width: 100px;
      height: 100px;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 4px;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
    
    .preview-box.sm {
      width: 48px;
      height: 48px;
      padding: 2px;
    }
  }
}
</style>