const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

// Handlebars-konfiguraatio
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Reitti etusivulle
app.get('/', (req, res) => {
  res.render('home', { title: 'Tervetuloa Express & Handlebars -sovellukseen!' });
});

// Test route
app.get('/test', (req, res) => {
  const data = {'testKey': 'hiihoo'};
  res.render('test', data);
});

// Reitit kaikille Handlebars-sivuille
app.get('/about', (req, res) => {
  res.render('about', { title: 'Tietoa sovelluksesta', description: 'Tämä on testisivu sovelluksen tiedoille.', author: 'AutosovellusRaseko-tiimi' });
});

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
app.listen(PORT, () => {
  console.log(`Serveri käynnissä portissa ${PORT}`);
});
