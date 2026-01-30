import request from '@/utils/request'

export interface OperationLog {
  id: number
  event_time: number
  event_name: string
  event_source: string
  resource_id: string
  resource_name: string
  region: string
  account_id: string
  user_name: string
  source_ip: string
  result: string
  error_code: string
  error_message: string
  request_parameters: string
}

export interface LogQueryParams {
  page: number
  page_size: number
  start_time?: number
  end_time?: number
  keyword?: string
  type?: string // 新增筛选类型
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// 获取操作记录列表
export const getOperationLogs = (params: LogQueryParams) => {
  return request.get<any, PageResult<OperationLog>>('/operation-log', { params })
}

// 手动同步
export const syncOperationLogs = () => {
  return request.post('/operation-log/sync')
}
