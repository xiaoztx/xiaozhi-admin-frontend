import request from '../utils/request'

export const getDomains = (params: any) => {
  return request({
    url: '/domains',
    method: 'get',
    params
  })
}

export const addDomain = (data: any) => {
  return request({
    url: '/domains',
    method: 'post',
    data
  })
}

export const updateDomain = (id: number, data: any) => {
  return request({
    url: `/domains/${id}`,
    method: 'put',
    data
  })
}

export const deleteDomain = (id: number) => {
  return request({
    url: `/domains/${id}`,
    method: 'delete'
  })
}

export const getValidCloudConfigs = () => {
  return request({
    url: '/domain-configs',
    method: 'get'
  })
}

export const getCloudDomains = (cloudConfigId: number) => {
  return request({
    url: '/domains/cloud-domains',
    method: 'get',
    params: { cloud_config_id: cloudConfigId }
  })
}
