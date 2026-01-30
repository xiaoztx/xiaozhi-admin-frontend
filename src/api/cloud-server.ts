import request from '@/utils/request'

export interface CloudServer {
  id: number
  cloud_config_id?: number
  instance_id: string
  instance_name: string
  region: string
  zone: string
  public_ip: string
  private_ip: string
  os_name: string
  cpu: number
  memory: number
  system_disk_size: number
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

export interface CloudDisk {
  disk_id: string
  disk_type: string
  disk_size: number
  disk_usage: string
  delete_with_instance: boolean
  disk_name?: string
  disk_charge_type?: string
  status: string
  created_at: string
}

export const getServerDetail = (id: number) => {
  return request.get(`/servers/${id}`)
}

export const getServerDisks = (id: number) => {
  return request.get<CloudDisk[]>(`/servers/${id}/disks`)
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
  memory_used: MonitorPoint[]
  disk_read: MonitorPoint[]
  disk_write: MonitorPoint[]
  disk_usage: MonitorPoint[]
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
