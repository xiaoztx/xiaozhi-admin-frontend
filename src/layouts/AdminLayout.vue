<template>
  <div class="admin-layout" :class="themeClass">
    <!-- 侧边栏 -->
    <AdminSidebar />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 头部导航 -->
      <AdminHeader />
      
      <!-- 标签页导航 -->
      <TagsView />

      <!-- 页面内容 -->
      <div class="content">
        <router-view v-if="isRouterAlive" v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="isMobileMenuOpen && isMobile"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useTagsViewStore } from '@/stores/tagsView'
import AdminSidebar from '@/components/AdminSidebar.vue'
import AdminHeader from '@/components/AdminHeader.vue'
import TagsView from '@/components/TagsView.vue'

const themeStore = useThemeStore()
const tagsViewStore = useTagsViewStore()

const themeClass = computed(() => themeStore.themeClass)
const isMobileMenuOpen = computed(() => themeStore.isMobileMenuOpen)
const isMobile = computed(() => window.innerWidth <= 768)
const cachedViews = computed(() => tagsViewStore.cachedViews)

const isRouterAlive = ref(true)
const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}
provide('reload', reload)

const closeMobileMenu = () => {
  themeStore.closeMobileMenu()
}

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  background-color: var(--bg-primary);

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: var(--bg-secondary);
      transition: background-color 0.3s ease;
    }
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .admin-layout {
    .main-content {
      .content {
        padding: 10px;
      }
    }
  }
}
</style>