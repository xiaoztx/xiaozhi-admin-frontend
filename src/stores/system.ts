import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSystemSettings } from '@/api/system-setting'

export const useSystemStore = defineStore('system', () => {
  const siteName = ref('咔吥哆管理系统')
  const logoUrl = ref('')
  const faviconUrl = ref('')
  const description = ref('')
  const copyright = ref('')
  const icp = ref('')

  // 安全设置
  const allowRegister = ref(true)
  const enableInviteCode = ref(false)
  const minPasswordLength = ref(8)
  const passwordComplexity = ref<string[]>([])
  const guestLimitMode = ref('mock')

  const loadSettings = async () => {
    try {
      const { data } = await getSystemSettings()
      if (data) {
        siteName.value = data.site_name || '咔吥哆管理系统'
        logoUrl.value = data.logo_url || ''
        faviconUrl.value = data.site_favicon || ''
        description.value = data.site_desc || ''
        copyright.value = data.copyright || ''
        icp.value = data.icp || ''
        
        // 安全设置映射
        allowRegister.value = data.allow_register === 'true' || data.allow_register === true
        enableInviteCode.value = data.enable_invite_code === 'true' || data.enable_invite_code === true
        minPasswordLength.value = parseInt(data.min_password_length) || 8
        guestLimitMode.value = data.guest_limit_mode || 'mock'
        
        if (data.password_complexity) {
          if (typeof data.password_complexity === 'string') {
            try {
              passwordComplexity.value = JSON.parse(data.password_complexity)
            } catch (e) {
              passwordComplexity.value = []
            }
          } else {
            passwordComplexity.value = data.password_complexity
          }
        }

        updateFavicon()
      }
    } catch (error) {
      console.error('Failed to load system settings:', error)
    }
  }

  const updateFavicon = () => {
    if (faviconUrl.value) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
      }
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = faviconUrl.value
      document.getElementsByTagName('head')[0]?.appendChild(link)
    }
  }

  return {
    siteName,
    logoUrl,
    faviconUrl,
    description,
    copyright,
    icp,
    allowRegister,
    enableInviteCode,
    minPasswordLength,
    passwordComplexity,
    guestLimitMode,
    loadSettings
  }
})
