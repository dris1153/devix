export interface IAxiosResponse<T = unknown> {
    success: boolean
    data: T
    statusCode?: number
    message?: string
}
