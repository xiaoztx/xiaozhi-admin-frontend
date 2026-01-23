import request from '@/utils/request'

export const getCloudConfigs = (params: any) => {
  return request({
    url: '/cloud-configs',
    method: 'get',
    params
  })
}

export const createCloudConfig = (data: any) => {
  return request({
    url: '/cloud-configs',
    method: 'post',
    data
  })
}

export const updateCloudConfig = (id: number, data: any) => {
  return request({
    url: `/cloud-configs/${id}`,
    method: 'put',
    data
  })
}

export const deleteCloudConfig = (id: number) => {
  return request({
    url: `/cloud-configs/${id}`,
    method: 'delete'
  })
}

export const connectTest = (id: number) => {
  return request({
    url: `/cloud-configs/${id}/connect`,
    method: 'post'
  })
}
