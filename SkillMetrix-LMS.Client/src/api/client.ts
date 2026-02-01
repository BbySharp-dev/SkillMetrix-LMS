import createClient from 'openapi-fetch'
import type { paths } from './types'

const API_BASE_URL = '/api'

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
})
