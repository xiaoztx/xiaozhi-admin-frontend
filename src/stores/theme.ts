import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const isSidebarCollapsed = ref(false)
  const isMobileMenuOpen = ref(false)

  const themeClass = computed(() => isDark.value ? 'dark' : 'light')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value.toString())
  }

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  // 初始化主题设置
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const savedSidebar = localStorage.getItem('sidebarCollapsed')

    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    }

    if (savedSidebar) {
      isSidebarCollapsed.value = savedSidebar === 'true'
    }
  }

  return {
    isDark,
    isSidebarCollapsed,
    isMobileMenuOpen,
    themeClass,
    toggleTheme,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    initTheme
  }
})