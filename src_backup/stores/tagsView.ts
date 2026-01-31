import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView extends Partial<RouteLocationNormalized> {
  title?: string
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addView(view: TagView) {
    addVisitedView(view)
    addCachedView(view)
  }

  function addVisitedView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    
    // 处理标题
    const title = view.meta?.title || '未知页面'
    
    visitedViews.value.push(Object.assign({}, view, {
      title: title as string
    }))
  }

  function addCachedView(view: TagView) {
    if (cachedViews.value.includes(view.name as string)) return
    if (!view.meta?.noCache) {
      cachedViews.value.push(view.name as string)
    }
  }

  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view)
      delCachedView(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delVisitedView(view: TagView) {
    if (!view.path) return

    // 1. 确定父级路径前缀
    const parentPath = view.path.endsWith('/') ? view.path.slice(0, -1) : view.path
    const prefix = parentPath + '/'

    // 2. 一次性过滤出所有需要保留的视图
    // 逻辑：删除自己 + 删除所有子路径页面
    const newVisitedViews: TagView[] = []
    
    visitedViews.value.forEach(v => {
      const isSelf = v.path === view.path
      const isChild = v.path && v.path.startsWith(prefix)

      if (isSelf || isChild) {
        // 如果是要删除的页面（自己或子页面），同时清理它的缓存
        delCachedView(v)
      } else {
        // 否则保留
        newVisitedViews.push(v)
      }
    })

    // 3. 更新视图列表
    visitedViews.value = newVisitedViews
  }

  function delCachedView(view: TagView) {
    const index = cachedViews.value.indexOf(view.name as string)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  function delOthersViews(view: TagView) {
    return new Promise((resolve) => {
      delOthersVisitedViews(view)
      delOthersCachedViews(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delOthersVisitedViews(view: TagView) {
    visitedViews.value = visitedViews.value.filter((v) => {
      return v.meta?.affix || v.path === view.path
    })
  }

  function delOthersCachedViews(view: TagView) {
    const index = cachedViews.value.indexOf(view.name as string)
    if (index > -1) {
      cachedViews.value = cachedViews.value.slice(index, index + 1)
    } else {
      cachedViews.value = []
    }
  }

  function delAllViews() {
    return new Promise((resolve) => {
      delAllVisitedViews()
      delAllCachedViews()
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delAllVisitedViews() {
    const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix)
    visitedViews.value = affixTags
  }

  function delAllCachedViews() {
    cachedViews.value = []
  }

  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index === -1) {
        return
      }
      visitedViews.value = visitedViews.value.filter((item, i) => {
        if (item.meta?.affix) {
          return true
        }
        return i >= index
      })
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delRightViews(view: TagView) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index === -1) {
        return
      }
      visitedViews.value = visitedViews.value.filter((item, i) => {
        if (item.meta?.affix) {
          return true
        }
        return i <= index
      })
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    delView,
    delCachedView,
    delOthersViews,
    delAllViews,
    delLeftViews,
    delRightViews,
  }
})
