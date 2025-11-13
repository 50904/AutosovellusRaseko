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

// Route to home page
app.get('/', (req, res) => {
  res.render('home', { title: 'Tervetuloa Express & Handlebars -sovellukseen!' });
});

// Route to vehicle listing using cards
app.get('/vehiclelist', (req, res) => {
  pgtools.getVehicleData().then((resultset) => {
    // Lets give a key for the resultset and render it to the page
    res.render('vehicleList', { vehicleList: resultset.rows });
  });
})

// Route to individual vehicle page: select vehicle by register number
app.get('/vehicleDetail', (req, res) => {
  let register = req.query.register
  pgtools.getVehicleDetails([register]).then((resultset) => {
    // Convert time stamp to user friendly string 
    let userFriendlyTimestamp = pgtools.convertToDateTimeObject(resultset.rows[0].otto);
    let dateTimeValue = userFriendlyTimestamp.date + ' kello ' + userFriendlyTimestamp.time
    
    // Change original timestamp to string value
    resultset.rows[0].otto = dateTimeValue;
    
    // Render it to the page
    res.render('vehicleDetail', resultset.rows[0]);
    });
  });

// Route to diary page: all entries for all vehicles
app.get('/diary', (req, res) => {
  pgtools.getDiary().then((resultset) => {
        // Lets give a key for the resultset and render it to the page
        res.render('diary', { diaryData: resultset.rows });
    });
});


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

app.listen(PORT, () => {
  console.log(`Serveri käynnissä portissa ${PORT}`);
});
