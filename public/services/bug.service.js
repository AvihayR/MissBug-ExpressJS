
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import axios from '../lib/axios.js'

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getDefaultSort
}


function query(filterBy, sortBy) {
    const queryParams = {
        ...filterBy,
        ...sortBy,
    }

    return axios.get(BASE_URL, { params: queryParams })
        .then(res => {
            if (res.status === 400) return ''
            else return res.data
        })
}
function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    // console.log('front service saving bug')
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL, bug).then(res => res.data)
}


function getDefaultFilter() {
    return {
        txt: '',
        severity: 0,
        createdAt: null,
        pageIdx: 0
    }
}

function getDefaultSort() {
    return { sortBy: "title" }
}