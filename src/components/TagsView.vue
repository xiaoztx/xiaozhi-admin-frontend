<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper" ref="scrollPaneRef">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        class="tags-view-item"
        :class="isActive(tag) ? 'active' : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon
          v-if="!isAffix(tag)"
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>

    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { Close } from '@element-plus/icons-vue'
import type { TagView } from '@/stores/tagsView'

const tagsViewStore = useTagsViewStore()
const route = useRoute()
const router = useRouter()
const scrollPaneRef = ref()
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<TagView>({})

const visitedViews = computed(() => tagsViewStore.visitedViews)

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

function openMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105
  const offsetLeft = scrollPaneRef.value.$el.getBoundingClientRect().left
  const offsetWidth = scrollPaneRef.value.$el.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const left15 = e.clientX - offsetLeft + 15

  if (left15 > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = left15
  }

  top.value = e.clientY - 60 // 调整菜单位置，根据header高度
  visible.value = true
  selectedTag.value = tag
}

function closeMenu() {
  visible.value = false
}

function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view)
  const { fullPath } = view
  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}

function closeOthersTags() {
  router.push(selectedTag.value)
  tagsViewStore.delOthersViews(selectedTag.value).then(() => {
    // 刷新
  })
}

function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then((res: any) => {
    if (res.visitedViews.some((tag: TagView) => tag.path === view.path)) {
      return
    }
    toLastView(res.visitedViews, view)
  })
}

function isActive(tag: TagView) {
  return tag.path === route.path
}

function isAffix(tag: TagView) {
  return tag.meta?.affix
}

function addTags() {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route)
  }
}

function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then((res: any) => {
    if (isActive(view)) {
      toLastView(res.visitedViews, view)
    }
  })
}

function toLastView(visitedViews: TagView[], view: TagView) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path!)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

watch(
    () => route.path,
    () => {
      addTags()
      moveToCurrentTag()
    }
  )

  onMounted(() => {
    initTags()
    addTags()
  })

  function initTags() {
    const affixTags: TagView[] = [
      {
        path: '/',
        meta: { title: '仪表盘', affix: true },
        fullPath: '/',
        name: 'Dashboard'
      }
    ]
    
    for (const tag of affixTags) {
      // Must have tag name
      if (tag.name) {
        tagsViewStore.addVisitedView(tag)
      }
    }
  }

  function moveToCurrentTag() {
    nextTick(() => {
      const tags = document.querySelectorAll('.tags-view-item')
      for (const tag of tags) {
        if ((tag as any).to?.path === route.path) {
          scrollPaneRef.value.setScrollTop(0)
          // 简单实现：将滚动条滚动到当前标签
          // 由于 element-plus scrollbar 的限制，这里可能需要更复杂的计算
          // 但通常水平滚动会自动跟随焦点，或者我们可以手动计算 left
          
          // 更好的方式是获取 el-scrollbar 的 wrapRef 并设置 scrollLeft
          const wrap = scrollPaneRef.value.wrapRef
          if (wrap) {
            const tagLeft = (tag as HTMLElement).offsetLeft
            const tagWidth = (tag as HTMLElement).offsetWidth
            const containerWidth = wrap.offsetWidth
            
            // 保持当前标签在可视区域中间
            wrap.scrollLeft = tagLeft - containerWidth / 2 + tagWidth / 2
          }
          break
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;

  .tags-view-wrapper {
    width: 100%;
    
    :deep(.el-scrollbar__view) {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 32px;
      line-height: 32px;
      border: 1px solid transparent;
      border-radius: 6px;
      color: var(--text-secondary);
      background: transparent;
      padding: 0 12px;
      font-size: 13px;
      margin-right: 6px;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      
      &:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }

      &.active {
        background-color: var(--bg-secondary);
        color: var(--color-primary);
        border-color: var(--border-light);
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        &::before {
          content: '';
          background: var(--color-primary);
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          position: relative;
          margin-right: 8px;
        }
      }

      .el-icon-close {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        margin-left: 6px;
        font-size: 10px;
        color: var(--text-tertiary);

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--text-primary);
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: var(--bg-primary);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: var(--text-primary);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-light);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--color-primary);
      }
    }
  }
}

// 暗色模式微调
:global(.dark) {
  .tags-view-item {
    &.active {
      background-color: #2b2d31 !important; // 深色卡片背景
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
    }

    &:hover:not(.active) {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    .el-icon-close:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: #fff !important;
    }
  }
}
</style>
