import React from 'react';
import ax from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import cryptojs from 'crypto-js';

interface AxiosOptions {
  url?: string;
  method?: string;
  route: string;
  payload?: object;
  headers?: object;
  params?: object;
  crypto?: boolean;
}

async function Axios(options: AxiosOptions, callback: Function) {
  // const navigate = useNavigate()
  const { url, method, route, payload, headers, params, crypto } = options;
  const requestUrl = url && url.endsWith('/') ? url.slice(0, -1) : false;
  const requestRoute = route && route.startsWith('/') ? route.slice(1) : route;
  const host = requestUrl || `http://${window.location.hostname}:5000`;
  const requestMethod = getMethod(method);
  const requestParams = params && getParams(params);

  if (!callback) {
    toast.error('CallBack function is missing');
  } else if (!route) {
    toast.error('Route is missing');
  } else {
    try {
      if (method && method !== 'GET' && method !== 'DELETE') {
        const res = await requestMethod(`${host}/${requestRoute}${requestParams || ''}`, payload, { headers } || {});
        if (res) {
          if (res.data.body && crypto) {
            const decrypted = cryptojs.AES.decrypt(res.data.body, CRYPTO_SECRET_KEY).toString(cryptojs.enc.Utf8);
            return await callback(JSON.parse(decrypted), res, null);
          } else {
            return await callback(res, null);
          }
        }
      } else {
        const res = await requestMethod(`${host}/${requestRoute}${requestParams || ''}`, { headers } || {});
        if (res) {
          if (res.data.body && crypto) {
            const decrypted = cryptojs.AES.decrypt(res.data.body, CRYPTO_SECRET_KEY).toString(cryptojs.enc.Utf8);
            return await callback(JSON.parse(decrypted), res, null);
          } else {
            return await callback(res, null);
          }
        }
      }
    } catch (error) {
      callback(null, error.message);
      toast.error(error.message);
    }
  }
}

function getMethod(method: string | undefined) {
  switch (method) {
    case 'POST':
      return ax.post;
    case 'PUT':
      return ax.put;
    case 'PATCH':
      return ax.patch;
    case 'DELETE':
      return ax.delete;
    default:
      return ax.get;
  }
}

function getParams(params: object | undefined) {
  const keys = Object.keys(params || {});
  const entries = keys
    .map((key, ind) => {
      if (ind === 0) {
        return `?${key}=${params![key]}`;
      } else {
        return `&${key}=${params![key]}`;
      }
    })
    .toString()
    .replace(/,/g, '');
  return entries;
}


export default Axios;
