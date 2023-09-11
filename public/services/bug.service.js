
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import axios from '../lib/axios.js'

const BASE_URL = '/api/bug/'
const STORAGE_KEY = 'bugDB'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
}


function query(filterBy = {}) {
    return axios.get(BASE_URL)
        .then(res => res.data)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }

            if (filterBy.severity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
            }
            return bugs
        })
}
function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
    // return storageService.get(STORAGE_KEY, bugId)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
        .then(res => res.data)
    // return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
    const url = BASE_URL + 'save'
    let queryParams = `?title=${bug.title}&severity=${bug.severity}`

    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios.get(url + queryParams).then(res => res.data)
}


function _createBugs() {
    // let bugs = utilService.loadFromStorage(STORAGE_KEY)
    let bugs = query().then(currBugs => {
        if (!currBugs || !currBugs.length) {
            currBugs = [
                {
                    title: "Infinite Loop Detected",
                    severity: 4,
                },
                {
                    title: "Keyboard Not Found",
                    severity: 3,
                },
                {
                    title: "404 Coffee Not Found",
                    severity: 2,
                },
                {
                    title: "Unexpected Response",
                    severity: 1,
                }
            ]
            console.log(currBugs)
            currBugs.forEach(bug => save(bug))
            return currBugs
        }
    })


}
