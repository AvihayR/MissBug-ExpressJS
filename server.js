import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'


const app = express()

//App configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => { res.send('Hello there') })

//READ Bugs
app.get('/api/bug', (req, res) => {
    // console.log(req.query, 'Req query')

    const filterBy = {
        txt: req.query.txt,
        severity: req.query.severity,
        pageIdx: req.query.pageIdx
    }

    const sortBy = req.query.sortBy

    bugService.query(filterBy, sortBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            res.status(400).send('Bad Request: ' + err);
        })
})

//CREATE/ADD Bug - POST
app.post('/api/bug', (req, res) => {

    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot add bug')

    const bug = {
        title: req.body.title,
        description: req.body.description,
        severity: req.body.severity,
        createdAt: req.body.createdAt,
        labels: req.body.labels,
        owner: req.body.owner
    }


    bugService.save(bug, loggedInUser)
        .then(bug => {
            res.send(bug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})


//Update Bug - PUT
app.put('/api/bug', (req, res) => {

    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot update bug')

    const bug = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: req.body.severity,
        createdAt: req.body.createdAt,
        labels: req.body.labels,
        owner: req.body.owner
    }

    bugService.save(bug, loggedInUser)
        .then(bug => {
            res.send(bug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//READ Bug
app.get('/api/bug/:bugId', (req, res) => {
    let visitedBugs = req.cookies.visitedBugs || []

    bugService.getById(req.params.bugId)
        .then(bug => {

            visitedBugs.push(bug)
            res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
            if (visitedBugs.length > 2) return res.status(401).send('Wait for a bit')

            res.send(bug)
        })
})

//Delete Bug
app.delete('/api/bug/:bugId', (req, res) => {

    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot remove bug')

    const bugId = req.params.bugId
    bugService.remove(bugId, loggedInUser)
        .then(() => {
            // console.log(`Bug ${bugId} removed!`)
            res.send('Bug removed successfully!')
        })
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})



//READ Users
app.get('/api/user', (req, res) => {

    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot get Users', err)
            res.status(400).send('Cannot get users, ' + err);
        })
})

//READ Single User
app.get('/api/user/:userId', (req, res) => {

    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot get User', err)
            res.status(400).send('Cannot get user, ' + err);
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.add(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(400).send('Cannot signup')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out..')
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

app.listen(3030, () => loggerService.info('Server ready http://127.0.0.1:3030'))