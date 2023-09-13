import fs from 'fs'
import { utilService } from './utils.service.js'
import { loggerService } from './logger.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = utilService.readJsonFile('data/bugs.json')
const PAGE_SIZE = 4
//Read Bugs
function query(filterBy, sortBy) {
    return new Promise((resolve, reject) => {

        let bugsToReturn = bugs

        if (sortBy === 'title') {
            bugsToReturn = bugsToReturn.sort((bug1, bug2) => bug1.title.localeCompare(bug2.title))
        } else if (sortBy === 'severity') {
            bugsToReturn = bugsToReturn.sort((bug1, bug2) => bug2.severity - bug1.severity)
        }

        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            bugsToReturn = bugsToReturn.filter(bug => regExp.test(bug.title))
        }
        if (filterBy.severity) {
            bugsToReturn = bugsToReturn.filter(bug => bug.severity > filterBy.severity)
        }
        if (filterBy.pageIdx !== undefined) {
            //PAGINATION
            const startIdx = +filterBy.pageIdx * PAGE_SIZE
            const endIdx = startIdx + PAGE_SIZE

            if (startIdx >= bugsToReturn.length) {
                reject('End of pages')
            }

            bugsToReturn = bugsToReturn.slice(startIdx, endIdx)
            resolve(bugsToReturn)
        }

    })

}

//Read Bug
function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}

//Delete Bug
function remove(bugId, loggedInUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('No such bug')
    const bug = bugs[bugIdx]

    if (!loggedInUser.isAdmin &&
        bug.owner._id !== loggedInUser._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(bugIdx, 1)
    _saveBugsToFile()
    return Promise.resolve()
}

//Save bug
function save(bug, loggedInUser) {
    if (bug.owner._id !== loggedInUser._id) return Promise.reject('Not your bug')

    if (bug._id) {
        const bugIdx = bugs.findIndex(currBug => currBug._id === bug._id)
        bugs[bugIdx].title = bug.title
        bugs[bugIdx].severity = bug.severity
    } else {
        bug = {
            _id: utilService.makeId(),
            owner: loggedInUser,
            title: bug.title,
            severity: bug.severity,
            score: bug.score
        }

        bugs.unshift(bug)
    }

    return _saveBugsToFile().then(() => bug)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}