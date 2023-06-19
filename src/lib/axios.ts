import axios, {AxiosError} from 'axios';
import {apiTokenUrl} from '../data/urls';
import {Tokens} from '../types/tokens';
import {setIsAuthenticated} from './authstore';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

axiosInstance.interceptors.request.use(requestConfig => {
  const tokens = localStorage.getItem('tokens');
  if(tokens) {
    const {accessToken}: Tokens = JSON.parse(tokens)
    requestConfig.headers.Authorization = accessToken
  }

  return requestConfig;
})

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    // @ts-ignore
    error.config.retry = true;

    // @ts-ignore
    if((status === 401 || status === 403) && error.config.retry) {
      try {

        // @ts-ignore
        error.config.retry = false;
        const tokenString = localStorage.getItem('tokens');

        if(!tokenString) {
          return Promise.reject(error)
        }

        const tokens: Tokens = JSON.parse(tokenString);
        const {data} = await axios.post<Tokens>(
          `${process.env.REACT_APP_API_URL}${apiTokenUrl}`,
          undefined,
          {
            params: {
              token: tokens.refreshToken,
            },
          },
        );

        if (data) {
          localStorage.setItem('tokens', JSON.stringify(data));
        }

        // @ts-ignore
        return axiosInstance(error.config);
      } catch (e) {
        const response = (e as AxiosError).response;
        if (response?.status === 403) {
          setIsAuthenticated(false)
        }

        return Promise.reject(error);
      } finally {
        // @ts-ignore
        error.config.retry = true;
      }
    }

    return Promise.reject(error);
  }
)
