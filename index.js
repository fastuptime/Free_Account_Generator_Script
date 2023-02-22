const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const db = require('old-wio.db');
const fs = require('fs');
const axios = require('axios');
////////////////////////////////////////
const domain = 'localhost.com';
const trlinkapi_key = "your_trlinkapi_key";
////////////////////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/generate', async (req, res) => {
    let {
        type
    } = req.body;
    if (!type) return res.send('Please enter a type!');
    let acs = JSON.parse(fs.readFileSync('./acs.json', 'utf8'));
    let acsSearch = acs.find(x => x.name === type);
    if (!acsSearch) return res.send('Please enter a valid type!');
    function randomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    let id = randomString(10);
    let random = acsSearch.acs[Math.floor(Math.random() * acsSearch.acs.length)];

    db.set(`data_${id}`, {
        status: 'alinmadi',
        platform: type,
        mail: random.mail,
        pass: random.password
    });
    await axios.get(`https://ay.live/api/?api=${trlinkapi_key}&url=${domain}/gen/${id}&alias=&format=text&ct=1`).then(response => {
        res.redirect(response.data);
    }).catch(err => {
        console.log(err);
        res.send('An error occurred while creating the link!');
    });
});

app.get("/gen/:id", (req, res) => {
    let id = req.params.id;
    let data = db.fetch(`data_${id}`);
    if (!data) return res.send('This id is not valid!');
    if (data.status === 'alindi') return res.send('This id is already used!');
    db.set(`data_${id}`, {
        status: 'alindi',
        platform: data.platform,
        mail: data.mail,
        pass: data.pass
    });
    res.send(`Mail: ${data.mail} <br> Password: ${data.pass}`);
});

app.listen(80);