// console.log("Kanishk Backend Dev")

const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter',(req,res) => {
    res.send('Tweet')
})

app.get('/login', (req,res) => {
    res.send('<h1>Please Login at Chai Aur code</h1>')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})