import request from '@/utils/request'

export interface OperationLog {
  id: number
  user_id: string
  module: string
  action: string
  content: string
  ip: string
  user_agent: string
  status: number
  duration: number
  created_at: string
  user?: {
    id: number
    username: string
    avatar: string
  }
}

export interface LogQueryParams {
  page: number
  page_size: number
  module?: string
  status?: string // success, fail
  keyword?: string
  start_time?: string
  end_time?: string
}

export const getOperationLogs = (params: LogQueryParams) => {
  return request.get<{ list: OperationLog[]; total: number }>('/logs/operation', { params })
}
