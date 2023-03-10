const path = require('path')
const express = require('express')
const layout = require('express-layout')
const routes = require('./routes')
const exp = require('constants')
const app = express()

app.set('views', path.join(__dirname, 'site'))
app.set('view engine', 'ejs')

const middleware = [
  //layout(),
  express.static(path.join(__dirname, 'site')),
]
app.use(middleware)

app.use('/', routes)

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(80, (req, res) => {
  console.log("Connected on port 80");
});