import axios from 'axios'

const API_URL_POR_DEFECTO = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? API_URL_POR_DEFECTO,
  timeout: 10_000,
  withCredentials: true,
})

