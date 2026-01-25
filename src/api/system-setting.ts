import request from '@/utils/request'

export interface SystemSettings {
  [key: string]: any
}

export function getSystemSettings() {
  return request({
    url: '/settings',
    method: 'get'
  })
}

export function updateSystemSettings(data: SystemSettings) {
  return request({
    url: '/settings',
    method: 'put',
    data
  })
}
