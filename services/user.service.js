import { utilService } from "./utils.service.js"
import fs from 'fs'
import Cryptr from 'cryptr'
const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')


const users = utilService.readJsonFile('data/user.json')

export const userService = {
    add,
    getById,
    query,
    // getByUsername,
    getLoginToken,
    validateToken,
    checkLogin
}

function checkLogin({ username, password }) {
    let user = users.find(u => u.username === username && u.password === password)

    if (user) {
        user = {
            _id: user._id,
            fullname: user.fullname,
            score: user.score,
            isAdmin: user.isAdmin
        }
    }

    return Promise.resolve(user)
}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
    if (!loginToken) return null
    const json = cryptr.decrypt(loginToken)
    const loggedinUser = JSON.parse(json)
    return loggedinUser
}

function query() {
    users.map(user => {
        user = { ...user }
        delete user.password
        return user
    })
    return Promise.resolve(users)
}

function getById(userId) {
    let user = users.find(user => user._id === userId)

    if (user) {
        user = {
            _id: user._id,
            fullname: user.fullname,
            score: user.score
        }
    }

    return Promise.resolve(user)
}

function add({ fullname, username, password }) {

    const user = {
        _id: utilService.makeId(),
        fullname,
        username,
        password,
        score: 1000
    }

    users.push(user)

    return _saveUsersToFile()
        .then(() => ({ _id: user._id, fullname: user.fullname }))
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}