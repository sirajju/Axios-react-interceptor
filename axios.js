import React from 'react'
import ax from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import cryptojs from 'crypto-js'

async function Axios(options, callback) {
    // const navigate = useNavigate()
    const { url, method, route, payload, headers, params, crypto } = options
    const requestUrl = url && url.endsWith('/') ? url.slice(0, -1) : false;
    const requestRoute = route && route.startsWith('/') ? route.slice(1) : route;
    const host = requestUrl || `http://${window.location.hostname}:5000`
    const requestMethod = getMethod(method)
    const requestParams = params && getParams(params)
    if (!callback) {
        toast.error('CallBack function is missing')
    } else if (!route) {
        toast.error('Route is missing')
    } else {
        try {
            if (method && method != "GET" && method !='DELETE') {
                const res = await requestMethod(`${host}/${requestRoute}${requestParams || ''}`, payload, { headers } || {})
                if (res) {
                    if (res.data.body && crypto) {
                        const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                        return await callback(JSON.parse(decrypted), res, null)
                    }
                    else {
                        return await callback(res, null)
                    }
                }
            } else {
                const res = await requestMethod(`${host}/${requestRoute}${requestParams || ''}`, { headers } || {})
                if (res) {
                    if (res.data.body && crypto) {
                        const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                        return await callback(JSON.parse(decrypted), res, null)
                    }
                    else{
                        return await callback(res, null)
                    }
                }
            }
        } catch (error) {
            callback(null, error.message)
            toast.error(error.message)
        }
    }
}
function getMethod(method) {
    switch (method) {
        case "POST":
            return ax.post
        case "PUT":
            return ax.put
        case "PATCH":
            return ax.patch
        case "DELETE":
            return ax.delete
        default:
            return ax.get
    }
}
function getParams(params) {
    const keys = Object.keys(params)
    const entries = keys.map((key, ind) => {
        if (ind == 0) {
            return `?${key}=${params[key]}`
        }
        else {
            return `&${key}=${params[key]}`
        }
    }).toString().replace(/,/g, '')
    return entries
}
const opt = {
    route: 'isAlive',
    headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNpcmFqanUiLCJlbWFpbCI6Im11bm5hczJhYUBnbWFpbC5jb20iLCJpYXQiOjE3MDUxMzYxMjZ9.ObWWHIHfs1tNZDdLU9O9kia5ZrmOfu5_D2ARZVmfJFY` },
    params: { getData: true },
    crypto: true,
    failUrl: '/login'
}
export default Axios