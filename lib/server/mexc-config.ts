// Server-side MEXC configuration
// This file should never be sent to the client
export const MEXC_CONFIG = {
  apiKey: 'mx0vgl7SvRk6e5CVUS',
  secretKey: 'd755147672ce474a8d7ac81c7c01c82d',
  baseUrl: 'https://api.mexc.com',
  apiVersion: '/api/v3'
}

export function validateMexcConfig() {
  return MEXC_CONFIG.apiKey && MEXC_CONFIG.secretKey && MEXC_CONFIG.baseUrl
}