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
            <el-button type="primary" :loading="saving" @click="handleSave">保存所有配置</el-button>
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
                <div class="logo-uploader">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleLogoChange"
                  >
                    <img v-if="basicForm.logoUrl" :src="basicForm.logoUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="upload-tip">
                    <p>建议尺寸: 200x200px</p>
                    <p>支持格式: PNG, JPG, SVG</p>
                    <el-button text type="primary" size="small">点击上传</el-button>
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
                
                <el-form-item label="强制HTTPS">
                  <div class="flex-column">
                    <el-switch v-model="securityForm.forceHttps" />
                    <div class="item-desc mt-2">强制将所有HTTP请求重定向到HTTPS</div>
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
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)

// 基本设置数据
const basicForm = reactive({
  siteName: '咔吥哆管理系统',
  adminEmail: 'admin@xiaozhi.ai',
  description: '一个现代化、高效的后台管理系统',
  copyright: '© 2024 XiaoZhi Inc.',
  icp: '京ICP备12345678号',
  logoUrl: ''
})

// 安全设置数据
const securityForm = reactive({
  allowRegister: true,
  forceHttps: true,
  loginLockCount: 5,
  minPasswordLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'numbers']
})

// 通知设置数据
const notificationForm = reactive({
  enableEmail: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: '465',
  senderEmail: 'notify@xiaozhi.ai',
  senderName: 'XiaoZhi Admin',
  smtpPassword: '',
  // Webhook 配置
  enableWebhook: false,
  webhookUrl: '',
  webhookMethod: 'POST',
  customTemplate: false,
  templateBody: '{\n  "msg_type": "text",\n  "content": {\n    "text": "{{title}}\\n{{content}}"\n  }\n}'
})

// 方法
const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('配置保存成功')
  }, 1000)
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
  }

  .logo-uploader {
    display: flex;
    align-items: center;
    gap: 20px;

    .avatar-uploader {
      :deep(.el-upload) {
        border: 1px dashed var(--border-medium);
        border-radius: 8px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: border-color 0.3s;
        width: 100px;
        height: 100px;
        background-color: var(--bg-secondary);

        &:hover {
          border-color: var(--color-primary);
        }
      }
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: var(--text-tertiary);
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
    }

    .avatar {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: cover;
    }

    .upload-tip {
      p {
        margin: 0 0 4px 0;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}
</style>