import request from '@/utils/request'

// 获取云配置列表
export const getCloudConfigs = (params: any) => {
  return request({
    url: '/cloud-configs',
    method: 'get',
    params
  })
}

// 创建云配置
export const createCloudConfig = (data: any) => {
  return request({
    url: '/cloud-configs',
    method: 'post',
    data
  })
}

// 更新云配置
export const updateCloudConfig = (id: number, data: any) => {
  return request({
    url: `/cloud-configs/${id}`,
    method: 'put',
    data
  })
}

// 删除云配置
export const deleteCloudConfig = (id: number) => {
  return request({
    url: `/cloud-configs/${id}`,
    method: 'delete'
  })
}

// 连接测试
export const connectTest = (id: number) => {
  return request({
    url: `/cloud-configs/${id}/connect`,
    method: 'post'
  })
}
