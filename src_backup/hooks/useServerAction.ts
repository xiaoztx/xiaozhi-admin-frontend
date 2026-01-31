import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { serverAction, deleteServer, type CloudServer } from '@/api/cloud-server'

export function useServerAction(refreshCallback?: () => void) {
  const actionLoading = ref(false)

  const handleServerAction = async (server: CloudServer, action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (action === 'delete') {
      try {
        await ElMessageBox.confirm(
          `确定要删除服务器 ${server.instance_name} 吗？此操作仅删除本地记录。`,
          '删除警告',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
        
        actionLoading.value = true
        await deleteServer(server.id)
        ElMessage.success('删除成功')
        refreshCallback?.()
      } catch (error) {
        if (error !== 'cancel') console.error(error)
      } finally {
        actionLoading.value = false
      }
      return
    }

    const actionMap: Record<string, string> = {
      start: '开机',
      stop: '关机',
      restart: '重启'
    }

    try {
      await ElMessageBox.confirm(
        `确定要对 ${server.instance_name} 执行 ${actionMap[action]} 操作吗？`, 
        '操作确认', 
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 乐观更新
      // const originalStatus = server.status
      if (action === 'stop') server.status = 'Stopping'
      else if (action === 'start') server.status = 'Starting'
      else if (action === 'restart') server.status = 'Rebooting' // 假设有 Rebooting 状态

      actionLoading.value = true
      await serverAction(server.id, action)
      ElMessage.success('指令已下发')
      
      // 延迟刷新
      setTimeout(() => {
        refreshCallback?.()
      }, 2000)
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
        // 简单恢复状态（不够严谨，但比没有好）
        refreshCallback?.()
      }
    } finally {
      actionLoading.value = false
    }
  }

  return {
    handleServerAction,
    actionLoading
  }
}
