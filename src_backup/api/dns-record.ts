import request from '../utils/request'

export const getRecords = (domainId: string | number, params: any) => {
  return request({
    url: '/dns-records',
    method: 'get',
    params: {
      ...params,
      domain_id: domainId
    }
  })
}

export const createRecord = (domainId: string | number, data: any) => {
  return request({
    url: '/dns-records',
    method: 'post',
    data: {
      ...data,
      domain_id: typeof domainId === 'string' ? parseInt(domainId) : domainId
    }
  })
}

export const updateRecord = (domainId: string | number, recordId: string | number, data: any) => {
  return request({
    url: `/dns-records/${recordId}`,
    method: 'put',
    data: {
      ...data,
      domain_id: typeof domainId === 'string' ? parseInt(domainId) : domainId
    }
  })
}

export const deleteRecord = (domainId: string | number, recordId: string | number) => {
  return request({
    url: `/dns-records/${recordId}`,
    method: 'delete',
    params: {
      domain_id: domainId
    }
  })
}

export const setRecordStatus = (domainId: string | number, recordId: string | number, status: string) => {
  return request({
    url: `/dns-records/${recordId}/status`,
    method: 'put',
    data: { 
      status,
      domain_id: typeof domainId === 'string' ? parseInt(domainId) : domainId
    }
  })
}
