import request from '@/utils/request'

// 获取存储策略列表
export const getStorageStrategies = (params: any) => {
  return request({
    url: '/storage-strategies',
    method: 'get',
    params
  })
}

// 创建存储策略
export const createStorageStrategy = (data: any) => {
  return request({
    url: '/storage-strategies',
    method: 'post',
    data
  })
}

// 更新存储策略
export const updateStorageStrategy = (id: number, data: any) => {
  return request({
    url: `/storage-strategies/${id}`,
    method: 'put',
    data
  })
}

// 删除存储策略
export const deleteStorageStrategy = (id: number) => {
  return request({
    url: `/storage-strategies/${id}`,
    method: 'delete'
  })
}
