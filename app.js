// WEB APPLICATION FOR SERVING RASEKO'S VEHICLE LENDING DATABASE
// =============================================================

// LIBRARIES
// =========

// External libraries and modules
// ------------------------------

const express = require('express');
const {engine} = require('express-handlebars');

// Local libraries and modules
// ---------------------------

const pgtools = require('./postgres-tools');

// INITIALIZATION
// --------------

// Create an express app
const app = express();

// Define a TCP port to listen: read en or use 8080 in undifined
const PORT = process.env.PORT || 8080;

// Set a folder for static files and images
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use('/icons', express.static('public/icons'));

// Set templating
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// URL ROUTES
// ----------

// Route to home page
app.get('/', (req, res) => {
  res.render('home', { title: 'Tervetuloa Express & Handlebars -sovellukseen!' });
});

// Route to vehicle listing page: free vehicles and vehicles in use
app.get('/vehiclelist', (req, res) => {
  pgtools.getVehicleData().then((resultset) => {
    // Lets give a key for the resultset and render it to the page
    res.render('vehicleList', { vehicleList: resultset.rows });
  });
});

// Route to individual vehicle page: select vehicle by register number
app.get('/vehicleDetails', (req, res) => {
  let register = req.query.register;
    pgtools.getVehicleDetails([register]).then((resultset) => {

      // Convert time stamp to user friendly string
      let userFriendlyTimestamp = pgtools.convertToDateTimeObject(resultset.rows[0].otto);
      console.log(userFriendlyTimestamp);
      let dateTimeValue = userFriendlyTimestamp.date + ' kello ' + userFriendlyTimestamp.time;
      
      // Change original timestamp to string value
      resultset.rows[0].otto = dateTimeValue;
      // Render it to the page
      res.render('vehicleDetails', resultset.rows[0]);
    });
});

// Route to diary page: all entries for all vehicles
app.get('/diary', (req, res) => {
  pgtools.getDiary().then((resultset) => {
    // Lets give a key for the resultset and render it to the page
    let rows = resultset.rows
    console.log(rows[0])
    let row = 0
    let fromattedTake = {}
    let formattedReturn = {}
    for (row in rows) {
      if (rows[row].otto == null) {
        fromattedTake.date = '-'
        fromattedTake.time = '-'
      }else{
        fromattedTake = pgtools.convertToDateTimeObject(rows[row].otto);
      }

      if (rows[row].palautus == null) {
        formattedReturn.date = '-'
        formattedReturn.time = '-'
      }else{
        formattedReturn = pgtools.convertToDateTimeObject(rows[row].palautus);
      }
      resultset.rows[row].otto = fromattedTake.date + ' kello ' + fromattedTake.time;
      resultset.rows[row].palautus = formattedReturn.date + ' kello ' + formattedReturn.time;
      console.log(rows[row].otto)
      console.log(rows[row].palautus)
    };
    res.render('diary', { diaryData: rows }); 
  });
});

// TODO: Route to vehicle's diary page: all entries for individual vehicle by register number

// TODO: Route to vehicle's tracking page: location by register number

// SERVER START
// ------------

app.listen(PORT);
console.log(`Server started on port ${PORT}`)