declare module '@/api/cloud-server' {
  export interface CloudServer {
    id: number
    instance_id: string
    instance_name: string
    region: string
    zone: string
    public_ip: string
    private_ip: string
    os_name: string
    cpu: number
    memory: number
    status: string
    expired_at: string
    created_at: string
  }

  export interface ServerListResponse {
    list: CloudServer[]
    total: number
  }

  export function getServers(params: any): Promise<{ data: ServerListResponse }>
  export function syncServers(data: { cloud_config_id: number }): Promise<any>
  export function serverAction(id: number, action: 'start' | 'stop' | 'restart'): Promise<any>
  export function deleteServer(id: number): Promise<any>
}
