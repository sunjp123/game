
import axios from 'axios'
axios.interceptors.request.use(config => {
    config.headers = { ...config.headers, 'Cache-Control': 'no-cache' ,appName:navigator.appName}
    const r = Math.random();
    if (config.url.includes("?")) {
        config.url = config.url + "&v=" + r;
    } else {
        config.url = config.url + "?v=" + r;
    }
    return config
})
axios.interceptors.response.use(function (response) {
    if (response) {
        
    }

    return response
}, (error) => {
    
})

function queryParams(params) {
    return params ? Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&') : '';
}

export const genUrlFromParams = (url, params) => {
    if (url && params) {
        params = { ...params }
        url += (url.indexOf('?') === -1 ? '?' : '&') + queryParams(params)
    }

    return url
}

/**
 * 从全局变量直接访问 prevCond 【不建议使用，最好从 store 获取】
 */
export const getPrevCondFromGlobal = () => {
    return window.GlobalSearchCriteria || {}
}

/** 
 * 从全局变量直接访问 GlobalSwitches  【不建议使用，最好从 store 获取】
*/
export const getSwitchesFromGlobal = () => {
    return window.GlobalSwitches || {}
}

/** 
 * 从全局变量直接访问 GlobalConfigs  【不建议使用，最好从 store 获取】
*/
export const getConfigsFromGlobal = () => {
    return window.GlobalConfigs || {}
}

/**
 * 从全局变量直接访问 GlobalOrderData 【不建议使用，最好从 store 获取】
 */
export const getOrderDataFromGlobal = () => {
    return window.GlobalOrderData || {}
}

let prevCond = getPrevCondFromGlobal(),
    transactionID = prevCond.transactionID,
    extHeader = transactionID ? { transactionID } : {}

//注入额外的 extHeader 信息
export const injectFetchExtHeader = (ext) => {
    extHeader = Object.assign({}, extHeader, ext)
}

export const fetchJsonpGet = (url, params) => {
    url = genUrlFromParams(url, params)

    return new Promise((resolve, reject) => {
        fetchJsonp(url, Object.assign({ credentials: 'same-origin' }, extHeader))
            .then(res => {
                resolve && resolve({ data: res.json() })
            }, reason => {
                reject && reject(reason)
            })
    })
}

export const fetchGet = (url, params, axiosExtendOps = {}) => {
    return fetchGetWithHeaders(url, params, {}, axiosExtendOps);
}

export const fetchGetWithHeaders = (url, params, headers = {}, axiosExtendOps = {}) => {
    url = genUrlFromParams(url, params)
    let ops = {
        withCredentials: true,
        headers: Object.assign({
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8'
        }, extHeader, headers)
    }
    Object.assign(ops, axiosExtendOps);
    return axios.get(url, ops)
}

export const fetchPost = (url, params, axiosExtendOps = {}) => {
    return fetchPostWithHeaders(url, params, {}, axiosExtendOps)
}

export const fetchPostWithHeaders = (url, params, headers = {}, axiosExtendOps = {}) => {
    let ops = {
        withCredentials: true,
        headers: Object.assign({
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8'
        }, extHeader, headers)
    };
    Object.assign(ops, axiosExtendOps);
    return axios.post(url, params, ops)
}

export const fetchPostForm = (url, params) => {
    return axios.post(url, params, {
        withCredentials: true,
        headers: Object.assign({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }, extHeader)
    })
}
