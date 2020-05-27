const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./client/static'));

const cors = require('cors');
app.use(cors())

const api = require('./api');
app.use('/api/v1', api);

const cdn = require('./cdn');
app.use('/cdn/v1/', cdn);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/views/index.html');
});

app.get('/docs', (req, res) => {
    res.sendFile(__dirname + '/client/views/docs.html');
})

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/views/notFound.html');
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening...`);
})