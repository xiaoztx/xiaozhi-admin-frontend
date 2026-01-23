import request from '../utils/request'

export const getRecords = (domain: string, params: any) => {
  return request({
    url: `/domains/${domain}/records`,
    method: 'get',
    params
  })
}

export const createRecord = (domain: string, data: any) => {
  return request({
    url: `/domains/${domain}/records`,
    method: 'post',
    data
  })
}

export const updateRecord = (domain: string, recordId: number, data: any) => {
  return request({
    url: `/domains/${domain}/records/${recordId}`,
    method: 'put',
    data
  })
}

export const deleteRecord = (domain: string, recordId: number) => {
  return request({
    url: `/domains/${domain}/records/${recordId}`,
    method: 'delete'
  })
}

export const setRecordStatus = (domain: string, recordId: number, status: string) => {
  return request({
    url: `/domains/${domain}/records/${recordId}/status`,
    method: 'put',
    data: { status }
  })
}
