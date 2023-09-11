import express from 'express'
import { bugService } from './services/bug.service.js'
import cookieParser from 'cookie-parser'

const app = express()

//App configuration
app.use(express.static('public'))
app.use(cookieParser())
app.get('/', (req, res) => { res.send('Hello there') })

//READ Bugs
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
})

//SAVE - (Create/Update Bug)
app.get('/api/bug/save', (req, res) => {
    // console.log(req.query)
    const bug = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: req.query.severity,
        createdAt: req.query.createdAt
    }

    bugService.save(bug)
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
    // console.log(req.params.bugId)
    bugService.getById(req.params.bugId)
        .then(bug => {


            visitedBugs.push(bug)
            res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
            if (visitedBugs.length > 2) return res.status(401).send('Wait for a bit')

            res.send(bug)
        })
})

//Delete Bug
app.get('/api/bug/:bugId/remove', (req, res) => {
    bugService.remove(req.params.bugId)
        .then(() => {
            console.log(`Bug ${req.params.bugId} removed!`)
            res.redirect('/api/bug')
        })
})

app.listen(3030, () => console.log('Server ready at port 3030'))