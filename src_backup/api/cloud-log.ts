import request from '@/utils/request'

export interface CloudOperationRecord {
  EventName: string
  EventTime: number
  RequestID: string
  EventSource: string
  ResourceType: string
  ResourceName: string
  UserIdentity: {
    UserName: string
    AccountId: string
    PrincipalId: string
  }
  SourceIPAddress: string
  EventRegion: string
  EventID: string
  ErrorCode?: string
  ErrorMessage?: string
  RequestParameters?: Record<string, any>
}

export interface CloudLogQueryParams {
  max_results?: number
  resource_id?: string
  start_time?: string
  end_time?: string
}

export const getCloudRecords = (params: CloudLogQueryParams) => {
  return request({
    url: '/cloud/audit',
    method: 'get',
    params
  })
}

export interface CloudSystemLog {
  Time: number
  TopicId: string
  TopicName: string
  Source: string
  FileName: string
  PkgId: string
  PkgLogId: string
  Content: string
}

export interface CloudSystemLogQueryParams {
  resource_id: string
  topic_id: string
  start_time?: string
  end_time?: string
  query?: string
  limit?: number
}

export const getCloudSystemLogs = (params: CloudSystemLogQueryParams) => {
  return request({
    url: '/cloud/system-logs',
    method: 'get',
    params
  })
}
