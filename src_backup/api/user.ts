import request from '@/utils/request'

export const getUsers = (params: any) => {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export const createUser = (data: any) => {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export const updateUser = (id: number, data: any) => {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export const deleteUser = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

export const getProfile = () => {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

export const updateProfile = (data: any) => {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}
