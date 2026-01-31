import request from '@/utils/request'

export const getGithubAccounts = () => {
  return request({
    url: '/github/accounts',
    method: 'get'
  })
}

export const addGithubAccount = (data: any) => {
  return request({
    url: '/github/accounts',
    method: 'post',
    data
  })
}

export const updateGithubAccount = (id: number, data: any) => {
  return request({
    url: `/github/accounts/${id}`,
    method: 'put',
    data
  })
}

export const connectGithubAccount = (id: number) => {
  return request({
    url: `/github/accounts/${id}/connect`,
    method: 'post'
  })
}

export const setPrimaryAccount = (id: number, isPrimary: boolean) => {
  return request({
    url: `/github/accounts/${id}/primary`,
    method: 'put',
    data: { is_primary: isPrimary }
  })
}

export const getContributions = (id: number, from: string, to: string) => {
  return request({
    url: `/github/accounts/${id}/contributions`,
    method: 'get',
    params: { from, to }
  })
}

export const deleteGithubAccount = (id: number) => {
  return request({
    url: `/github/accounts/${id}`,
    method: 'delete'
  })
}

// 监控相关 API
export const getGithubMonitors = () => {
  return request({
    url: '/github/monitors',
    method: 'get'
  })
}

export const addGithubMonitor = (data: { url: string; remark?: string }) => {
  return request({
    url: '/github/monitors',
    method: 'post',
    data
  })
}

export const deleteGithubMonitor = (id: number) => {
  return request({
    url: `/github/monitors/${id}`,
    method: 'delete'
  })
}

export const syncGithubMonitor = (id: number) => {
  return request({
    url: `/github/monitors/${id}/sync`,
    method: 'post'
  })
}
