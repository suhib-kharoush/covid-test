'use strict';
// application dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
const cors = require('cors');


// enviromental variables
require('dotenv').config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// application setup
const app = express();
const client = new pg.Client(DATABASE_URL);

//application middlewre
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodoverride('_method'));
app.use(cors());
app.set('view engine', 'ejs');

// routes
app.get('/', homePage);
app.post('/getCountryResult', getCountryResult);
app.get('/allCountries', getAllCountries);
app.post('/Records', addToDatabase);
app.get('/Records', renderFromDatabase);
app.get('/viewDetails/:country_id', detailsHandler);
app.delete('/deleteCountry/:country_id', deleteCountry);




function deleteCountry(req, res) {
    const id = req.params.country_id;
    const sql = `DELETE FROM corona WHERE id=$1`;
    const safeValues = [id];

    client.query(sql, safeValues).then(() => {
        res.redirect('/Records')
    })
}






function detailsHandler(req, res) {
    const id = req.params.country_id;
    const sql = `SELECT * FROM corona WHERE id=$1;`;
    const safeValues = [id];

    client.query(sql, safeValues).then(results => {
        res.render('pages/details', { covid: results.rows })
    })
}


function renderFromDatabase(req, res) {
    const sql = `SELECT * FROM corona;`;

    client.query(sql).then(results => {
        res.render('pages/records', { covid: results.rows })
    })
}



function addToDatabase(req, res) {
    const { Country, TotalConfirmed, TotalDeaths, TotalRecovered, Date } = req.body;
    const sql = `INSERT INTO corona(country, totalconfirmed, totaldeaths, totalrecovered, date) VALUES($1, $2, $3, $4, $5)`;
    const safeValues = [Country, TotalConfirmed, TotalDeaths, TotalRecovered, Date];

    client.query(sql, safeValues).then(() => {
        res.redirect('/Records')
    })
}






function getAllCountries(req, res) {
    const url = `https://api.covid19api.com/summary`
    superagent.get(url).then(results => {
        const corona = results.body.Countries.map(data => {
            return new Country(data)
        })
        res.render('pages/allCountries', { covid: corona });
    })
}

function Country(data) {
    this.Country = data.Country;
    this.TotalConfirmed = data.TotalConfirmed;
    this.TotalDeaths = data.TotalDeaths;
    this.TotalRecovered = data.TotalRecovered;
    this.Date = data.Date;
}


function getCountryResult(req, res) {
    const { country, from, to } = req.body;
    const url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`

    superagent.get(url).then(results => {
        res.render('pages/getCountryResult', { covid: results.body })
    })
}











function homePage(req, res) {
    const url = `https://api.covid19api.com/world/total`

    superagent.get(url).then(results => {
        res.render('pages/home', { covid: results.body })
    })
}



client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`listening from PORT ${PORT}`);
    })
})