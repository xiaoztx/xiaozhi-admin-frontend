import request from '@/utils/request'

// 获取存储策略列表
export const getStorageStrategies = (params: any) => {
  return request({
    url: '/storage-strategies',
    method: 'get',
    params
  })
}

// 获取单个存储策略详情
export const getStorageStrategy = (id: number) => {
  return request({
    url: `/storage-strategies/${id}`,
    method: 'get'
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

// 获取存储策略下的文件列表
export const getStrategyFiles = (id: number, params: any) => {
  return request({
    url: `/storage-strategies/${id}/files`,
    method: 'get',
    params
  })
}

// 重命名文件
export const renameFile = (id: number, data: any) => {
  return request({
    url: `/storage-strategies/${id}/files/rename`,
    method: 'post',
    data
  })
}

// 复制文件
export const copyFile = (id: number, data: any) => {
  return request({
    url: `/storage-strategies/${id}/files/copy`,
    method: 'post',
    data
  })
}

// 删除文件
export const deleteFile = (id: number, data: any) => {
  return request({
    url: `/storage-strategies/${id}/files/delete`,
    method: 'post',
    data
  })
}

// 批量删除文件
export const batchDeleteFiles = (id: number, keys: string[]) => {
  return request({
    url: `/storage-strategies/${id}/files/batch-delete`,
    method: 'post',
    data: { keys }
  })
}

// 获取文件链接
export const getFileLink = (id: number, key: string, type: 'preview' | 'download' = 'preview') => {
  return request({
    url: `/storage-strategies/${id}/files/link`,
    method: 'get',
    params: { key, type }
  })
}

// 获取文件夹链接
export const getFolderLinks = (id: number, prefix: string, type: 'preview' | 'download' = 'preview') => {
  return request({
    url: `/storage-strategies/${id}/files/links`,
    method: 'get',
    params: { prefix, type }
  })
}
