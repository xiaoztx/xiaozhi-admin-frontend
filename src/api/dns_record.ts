import request from '../utils/request'

export const getRecords = (domain: string, params: any) => {
  return request({
    url: `/dns/${domain}/records`,
    method: 'get',
    params
  })
}

export const createRecord = (domain: string, data: any) => {
  return request({
    url: `/dns/${domain}/records`,
    method: 'post',
    data
  })
}

export const updateRecord = (domain: string, recordId: string, data: any) => {
  return request({
    url: `/dns/${domain}/records/${recordId}`,
    method: 'put',
    data
  })
}

export const deleteRecord = (domain: string, recordId: string) => {
  return request({
    url: `/dns/${domain}/records/${recordId}`,
    method: 'delete'
  })
}

export const setRecordStatus = (domain: string, recordId: string, status: string) => {
  return request({
    url: `/dns/${domain}/records/${recordId}/status`,
    method: 'put',
    data: { status }
  })
}
