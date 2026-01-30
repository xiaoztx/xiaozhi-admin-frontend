import request from '@/utils/request'

export interface CloudServer {
  id: number
  instance_id: string
  instance_name: string
  region: string
  zone: string
  public_ip: string
  private_ip: string
  os_name: string
  cpu: number
  memory: number
  bandwidth: number
  status: string
  expired_at: string
  created_at: string
  start_time: string
  cloud_config?: {
    provider: string
    name: string
  }
}

export interface ServerListResponse {
  list: CloudServer[]
  total: number
}

export const getServers = (params: any) => {
  return request<any, ServerListResponse>({
    url: '/servers',
    method: 'get',
    params
  })
}

export function getServerDetail(id: number) {
  // 获取服务器详情
  return request<any, CloudServer>({
    url: `/servers/${id}`,
    method: 'get'
  })
}

export const syncServers = (data: { cloud_config_id: number }) => {
  return request({
    url: '/servers/sync',
    method: 'post',
    data
  })
}

export const serverAction = (id: number, action: 'start' | 'stop' | 'restart') => {
  return request({
    url: `/servers/${id}/action`,
    method: 'post',
    data: { action }
  })
}

export const deleteServer = (id: number) => {
  return request({
    url: `/servers/${id}`,
    method: 'delete'
  })
}

export interface MonitorPoint {
  timestamp: number
  value: number
}

export interface MonitorData {
  cpu: MonitorPoint[]
  memory: MonitorPoint[]
  disk_read: MonitorPoint[]
  disk_write: MonitorPoint[]
  net_in: MonitorPoint[]
  net_out: MonitorPoint[]
}

export const getServerMonitorData = (id: number, params?: { start_time?: string; end_time?: string }) => {
  return request<any, MonitorData>({
    url: `/servers/${id}/monitor`,
    method: 'get',
    params
  })
}
