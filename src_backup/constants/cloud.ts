export const SERVER_STATUS_MAP: Record<string, { type: 'success' | 'warning' | 'info' | 'danger' | '', label: string }> = {
  'Running': { type: 'success', label: '运行中' },
  'Stopped': { type: 'info', label: '已停止' },
  'Starting': { type: 'warning', label: '启动中' },
  'Stopping': { type: 'warning', label: '停止中' },
  'Pending': { type: '', label: '创建中' },
  'Error': { type: 'danger', label: '异常' }
}

export const OS_ICON_MAP: Record<string, string> = {
  'Ubuntu': 'ubuntu',
  'CentOS': 'centos',
  'Debian': 'debian',
  'Windows': 'windows',
  'Aliyun': 'aliyun'
}
