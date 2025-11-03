const express = require('express');
const {engine} = require('express-handlebars');

const app = express();

// Set a folder for static files and images
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use('/icons', express.static('public/icons'));

// Handlebars-konfiguraatio
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Local libraries and modules
// -------------------------

const pgtools = require('./postgres-tools');

// Reitti etusivulle
app.get('/', (req, res) => {
  res.render('home', { title: 'Tervetuloa Express & Handlebars -sovellukseen!' });
});

app.get('/iconList', (req, res) => {
  res.render('iconList');
});

// Test route
app.get('/test', (req, res) => {
  const data = {'testKey': 'hiihoo'};
  pgtools.selectQuery('SELECT * FROM public.vapaana').then((resultset) => {
    console.log(resultset.rows);
  })
  res.render('test', data);
});


// Reitit kaikille Handlebars-sivuille
app.get('/about', (req, res) => {
  res.render('about', { title: 'Tietoa sovelluksesta', description: 'Tämä on testisivu sovelluksen tiedoille.', author: 'AutosovellusRaseko-tiimi' });
});

//  Route to vehicle listing page: free vehicles and vehicles in use
app.get('/vehicles', (req, res) => {
    pgtools.getVehicleData().then((resultset) => {
        // Lets give a key for the resultset and render it to the page
        res.render('vehicles', { vehicleList: resultset.rows });
    });
    
});
// Route to individual vehicle page: select vehicle by register number
app.get('/vehicleDetail', (req, res) => {
    pgtools.getVehicleDetails2(['FNK-129']).then((resultset) => {
        // Lets give a key for the resultset and render it to the page
        res.render('vehicleDetail', resultset.rows[0]);
        
    });
    
  });
// Route to diary page: all entries for all vehicles
app.get('/diary2', (req, res) => {
  pgtools.getDiary().then((resultset) => {
        // Lets give a key for the resultset and render it to the page
        res.render('diary2', { diaryData: resultset.rows });
    });
});

// TODO: Route to vehicle listing using cards
app.get('/vehiclelist', (req, res) => {
  pgtools.getVehicleData().then((resultset) => {
    // Lets give a key for the resultset and render it to the page
    res.render('vehicleList', { vehicleList: resultset.rows });
  });
})
// TODO: Route to vehicle's diary page: all entries for individual vehicle by register number

// TODO: Route to vehicle's tracking page: location by register number

// SERVER START
// ------------
app.get('/diary', (req, res) => {
  res.render('diary', { title: 'diary', entries: [
    { date: '2025-09-17', distance: 120, driver: 'Matti' },
    { date: '2025-09-16', distance: 85, driver: 'Maija' }
  ] });
});

app.get('/dbtest', (req, res) => {
  res.render('dbtest', { title: 'Tietokantatesti', dbStatus: 'Yhteys OK', testValue: 42 });
});

app.get('/form', (req, res) => {
  res.render('form', { title: 'Lomake', fields: ['Nimi', 'Sähköposti', 'Viesti'] });
});

app.get('/images', (req, res) => {
  res.render('images', { title: 'Kuvat', images: ['kuva1.jpg', 'kuva2.jpg', 'kuva3.jpg'] });
});

app.get('/index', (req, res) => {
  res.render('index', { title: 'Etusivu', welcome: 'Tervetuloa testietusivulle!' });
});

app.get('/svgtest', (req, res) => {
  res.render('svgtest');
});

app.get('/locate', (req, res) => {
  res.render('locate', { title: 'Sijainti', location: { lat: 60.5, lng: 22.3 } });
});

app.get('/signin', (req, res) => {
  res.render('signin', { title: 'Kirjaudu sisään', username: 'testikäyttäjä' });
});

app.get('/vehicle', (req, res) => {
  res.render('vehicle', { title: 'Ajoneuvot', vehicles: [
    { reg: 'FNK-129', model: 'Toyota Corolla' },
    { reg: 'FPB-343', model: 'Volkswagen Golf' }
  ] });
});

app.get('/vehicledetails-FNK-129', (req, res) => {
  res.render('vehicledetails-FNK-129', { title: 'Ajoneuvon tiedot FNK-129', details: { reg: 'FNK-129', model: 'Toyota Corolla', year: 2020 } });
});

app.get('/vehicledetails-FPB-343', (req, res) => {
  res.render('vehicledetails-FPB-343', { title: 'Ajoneuvon tiedot FPB-343', details: { reg: 'FPB-343', model: 'Volkswagen Golf', year: 2019 } });
});

app.get('/vehicledetails-OXZ-915', (req, res) => {
  res.render('vehicledetails-OXZ-915', { title: 'Ajoneuvon tiedot OXZ-915', details: { reg: 'OXZ-915', model: 'Ford Focus', year: 2018 } });
});

app.get('/vehicledetails', (req, res) => {
  res.render('vehicledetails', { title: 'Ajoneuvon tiedot', details: { reg: 'ABC-123', model: 'Testiauto', year: 2025 } });
});

app.get('/vlistFlex', (req, res) => {

       res.render('vlistFlex');
});

app.listen(PORT, () => {
  console.log(`Serveri käynnissä portissa ${PORT}`);
});
