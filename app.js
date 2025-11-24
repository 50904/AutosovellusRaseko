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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// URL ROUTES
// ----------

// Route to home page
app.get('/', (req, res) => {
  res.render('index')
});


app.post('/welcome', (req, res) => {
      console.log('Login information', req.body)
      let user = req.body.user;
      let inputPassword = req.body.inputPassword;
      let userRole = '';
      let userPassword = '';
      pgtools.getWebUserData([user]).then((resultset) => {
          let userData = resultset.rows[0];
          if (userData) {
              console.log('Dataa saatiin:')
          } else {
              console.log('Ei tullut dataa')
              res.render('invalidUserName', {user: user});
          }
          console.log('Database information', userData);
          // res.render('welcome', userData);
          });
// Route to vehicle listing page: free vehicles and vehicles in use
app.get('/vehiclelist', (req, res) => {
  pgtools.getVehicleData().then((resultset) => {
    // Lets give a key for the resultset and render it to the page
    res.render('vehicleList', { vehicleList: resultset.rows })
  });
});

// Route to individual vehicle page: select vehicle by register number
app.get('/vehicleDetails', (req, res) => {
  let register = req.query.register;
    pgtools.getVehicleDetails([register]).then((resultset) => {

      // Convert time stamp to user friendly string
      let userFriendlyTimestamp = pgtools.convertToDateTimeObject(resultset.rows[0].otto);
      let dateTimeValue = userFriendlyTimestamp.date + ' kello ' + userFriendlyTimestamp.time
      
      // Change original timestamp to string value
      resultset.rows[0].otto = dateTimeValue;

      // Render it to the page
      res.render('vehicleDetails', resultset.rows[0])
    });
});

// Route to diary containing all vehicles
app.get('/diary', (req, res) => {
    pgtools.getDiary().then((resultset) => {
        // Lets give a key for the resultset and render it to the page
        let rows = resultset.rows;
        let row = 0
        let formattedTake = {}
        let formattedReturn = {}
        for (row in rows) {
            if (rows[row].otto == null) {
                formattedTake.date = '-'
                formattedTake.time = '-'
            }
            else {
            formattedTake = pgtools.convertToDateTimeObject(rows[row].otto)
            }

             if (rows[row].palautus == null) {
                formattedReturn.date = '-'
                formattedReturn.time = '-'
            }
            else {
            formattedReturn = pgtools.convertToDateTimeObject(rows[row].palautus);
            }
            
            rows[row].otto = formattedTake.date + ' kello ' + formattedTake.time;
            rows[row].palautus = formattedReturn.date + ' kello ' + formattedReturn.time;
        }
        res.render('diary', {diaryData: rows})
    })
});

app.get('/filterDiary', (req, res) => {
  let options = {}
  let regitserList = []
  let driverList = []
  let reasonList = []

  // Fetch registernumber
  pgtools.selectQuery('SELECT * FROM webrekisterit;').then((resultset) => {
    regitserList = resultset.rows

    // Fetch reason
    pgtools.selectQuery('SELECT * FROM webtarkoitukset;').then((resultset) => {
      reasonList = resultset.rows

      // Fetch driver
      pgtools.selectQuery('SELECT * FROM webkuljettajat;').then((resultset) => {
        driverList = resultset.rows

        // options
        options = {
          registers: regitserList,
          reasons: reasonList,
          drivers: driverList
        };
      res.render('filterDiary', options)
      })
    })
  })
});

app.get('/filteredDiary', (req, res) => {
  let registerFilter = req.query.rekisterinumero
  let registerFilterValid = req.query.rekisterisuodatus
  let reasonFilter = req.query.tarkoitus
  let reasonFilterValid = req.query.tarkoitussuodatus
  let driverFilter = req.query.nimi
  let driverFilterValid = req.query.kuljettajasuodatus
  let startFilter = req.query.alkaa
  let endFilter = req.query.loppuu
  let dateFilterValid = req.query.ottosuodatus
  
  let conditions = ''
  if (registerFilterValid == 'on') {
    conditions = conditions + `rekisterinumero = '${registerFilter}' AND `;
  }
  if (reasonFilterValid == 'on') {
    conditions = conditions + `tarkoitus = '${reasonFilter}' AND `;
  }
  if (driverFilterValid == 'on') {
    conditions = conditions + `nimi = '${driverFilter}' AND `;
  }
  if (dateFilterValid == 'on') {
    conditions = conditions + `otto BETWEEN '${startFilter}' AND '${endFilter}'`;
  }

  let whereClause = 'WHERE ' + conditions
  let cleanwhereClause = ''
  console.log(whereClause.endsWith(' AND '))
  if (whereClause.endsWith(' AND ')) {
      let position = whereClause.lastIndexOf(' AND ')
      cleanwhereClause = whereClause.substring(0, position)
      console.log(position)
  }
  else {
    cleanwhereClause = whereClause
  }
  console.log('Where clause is:', cleanwhereClause)
})

app.get('/formTest', (req, res) => {
  res.render('formTest')
})

// TODO: Route to vehicle's diary page: all entries for individual vehicle by register number

// TODO: Route to vehicle's tracking page: location by register number

// SERVER START
// ------------

app.listen(PORT);
console.log(`Server started on port ${PORT}`)