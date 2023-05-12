/*
* Axios is a library for AJAX calls (getting data without reloading the page).
* Use Axios instead of the built-in fetch because it's slightly better.
*
* This wrapper removes some boilerplate code.
*/

import axios from 'axios';
import {apiBase} from "../config";
import {authHeader} from "./authHeader";


const apiInstance = axios.create({
  baseURL: apiBase,
  timeout: 30000
});

async function req(method, url, data, params) {
  try {
    switch (method) {

      case 'get': {
        let res = await apiInstance.request({
          url, method, params, data, headers: { ...authHeader() }
        });

        return {
          ok: true,
          data: await res.data,
          err: null
        };
      }

      default: {

        let res = await apiInstance.request({
          url, method, data, headers: { ...authHeader() }
        });

        return {
          ok: true,
          data: await res.data,
          err: null
        };
      }
    }
  } catch (err) {
    if (err.response) {
      if (err.response.data.error) {
        return { ok: false, data: err.response.data, err: err.response.data.error.message };
      } else {
        return { ok: false, data: err.response.data, err: `${err.response.status} - ${err.response.statusText}` };
      }
    } else if (err.request) {
      return { ok: false, data: err.request, err: err.request };
    }
    return { ok: false, data: null, err: err.message };
  }
}

function createRelayRequest(url, data) {
  return {
    url,
    content: data
  }
}

async function rel(method, url, data) {
  if (method === 'get') {
    return req(method, '/internal/relay', null, {relayurl: url})
  } else {
    return req(method, '/internal/relay', createRelayRequest(url, data));
  }
}

export default {
  get: (endpoint) => req('get', endpoint),
  post: (endpoint, data) => req('post', endpoint, data),
  patch: (endpoint, data) => req('patch', endpoint, data),
  put: (endpoint, data) => req('put', endpoint, data),
  del: (endpoint, data) => req('delete', endpoint, data),
  relay: {
    get: (endpoint) => rel('get', endpoint),
    post: (endpoint, data) => rel('post', endpoint, data),
    patch: (endpoint, data) => rel('patch', endpoint, data),
    put: (endpoint, data) => rel('put', endpoint, data),
    del: (endpoint, data) => rel('delete', endpoint, data)
  }
}
