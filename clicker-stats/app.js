
require('dotenv').config()

const express = require('express')
const app = express()
app.set('view engine', 'ejs')
const router = express.Router()

// body parser, cors and options
{
    app.use(require('body-parser').json())
    app.use(require('body-parser').urlencoded({extended: true}))

    router.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, TwitchToken');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return next();
    })

    router.options('/api/:any', (req, res, next) => {
        // console.log('resolving OPTIONS on ', req.path)
        return res.status(200).end()
    })
}

const users = {}

router.post('/api/start_session', (req, res, next) => {
    if (users[req.body.id]) {
        console.log('continue session: ', req.body.id)
    } else {
        console.log('start session: ', req.body)
        users[req.body.id] = req.body
        users[req.body.id].delta = []
    }
    res.status(200).json({result: 'ok'})
})

router.post('/api/diff', (req, res) => {
    console.log('diff: ', req.body)
    req.body.type = 'diff'
    users[req.body.id].delta.push(req.body)
    res.status(200).json({result: 'ok'})
})

router.post('/api/accumulate', (req, res) => {
    console.log('acc: ', req.body)
    req.body.type = 'acc'
    users[req.body.id].delta.push(req.body)
    res.status(200).json({result: 'ok'})
})

router.get('/', (req, res, next) => {
    const userIds = Object.keys(users)
    res.render('listUsers', {users: userIds})
})

router.get('/user/:userId', (req, res, next) => {
    res.render('userStory', {plotData: users[req.params.userId]})
})

app.use('/', router)
app.use(express.static('static'))

const http = require('http')
http.createServer(app).listen(process.env.HTTP_PORT, () => {
    console.log('running stats on port', process.env.HTTP_PORT)
})