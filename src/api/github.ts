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
