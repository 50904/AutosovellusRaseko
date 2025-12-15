// WEB APPLICATION FOR SERVING RASEKO'S VEHICLE LENDING DATABASE
// =============================================================

// LIBRARIES
// ---------

// External libraries
// ------------------
const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');

// Local libraries and modules
// ---------------------------

const pgtools =  require('./postgres-tools');

// INITIALIZATION
// --------------

// Create an express app
const app = express();

// Define a TCP port to listen: read env or use 8080 in undefined
const PORT = process.env.PORT || 8080

// Set a folders for static files like css, images or icons
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use('/icons', express.static('public/icons'));

// Setup session settings 
app.use(session({
  secret: 'hippopotamus on virtahepo', // Signing passphrase for cookies
  resave: false, // Unmodified sessions will not be saved
  saveUninitialized: false, // Unmodified new sessions will not be saved
  cookie: {
    maxAge: 1800000 // Max lifetime for the cookie in ms, 30 minutes
  }

}));

// Setup templating
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Setup URL parser to use extended option
app.use(express.urlencoded({extended: true}))

// URL ROUTES
// ----------

// Route for testing menus
app.get('/menu', (req, res) => {
    res.render('menu')
});
// Route to home page
app.get('/', (req, res) => {
    res.render('index')
});

app.post('/welcome', (req, res) => {

    // Collect login data from body
    let inputEmail = req.body.user;
    let inputPassword = req.body.password;

    // Get session data
    let sessionData = req.session;

    // Define variables for users Role and Stored password
    let userRole = '';
    let userPassword = '';

    // Get user data from database using given email address
    pgtools.getWebUserData([inputEmail]).then((resultset) => {
        let userData = resultset.rows[0];
        
        // Check if query returns anything
        if (userData) {

            // Parse user information from resultset to avoid timing conflicts
            userEmail = userData.email;
            userRole = userData.user_role;
            userPassword = userData.password;

            // Check if given password matches stored password
            if (inputPassword == userPassword) {

                // Success 
                sessionData.user = {role: userRole}
                res.render('welcome', {user: inputEmail, role: userRole})
            }
            else {
                
                res.render('invalidPassword');
            }
            
        } else {
            
            res.render('invalidUserName', {user: inputEmail});
        }
      
    })
})
// Route to vehicle listing page: free vehicles and vehicles in use
app.get('/vehiclelist', (req, res) => {
    let userRole = req.session.user;
    if (userRole) {
        pgtools.getVehicleData().then((resultset) => {
            let vehicleData = resultset.rows;


        // Lets give a key for the resultset and render it to the page
        res.render('vehiclelist', {vehicleList: resultset.rows});
        
    })
    } else {
        res.render('notAuthorized');
    }
    
})

// Route to individual vehicle page: select vehicle by register number
app.get('/vehicleDetails', (req, res) => {
        let register = req.query.register;
        let user = req.session.user;
        if (user) {
            if (user.role == 'opettaja' || user.role == 'hallinto') {
                pgtools.getVehicleDetails([register]).then((resultset) => {

                    // Render it to the page
                    res.render('vehicleDetails', resultset.rows[0]);

                })
            } else {
                res.render('notAuthorized');
            }
        } else {
            res.render('notSignedIn');
        }
});      

// Route to diary of single vehicle by register number
app.get('/vehicleDiary', (req, res) => {
    let register = req.query.register;
    let user = req.session.user;
        if (user) {
            if (user.role == 'opettaja' || user.role == 'hallinto') {
                pgtools.getVehicleDiary([register]).then((resultset) => {
                res.render('vehicleDiary', {diaryData: resultset.rows})

                })
            } else {
                res.render('notAuthorized');
            }
        } else {
            res.render('notSignedIn');
        }
});      

// Route to diary containing all vehicles
app.get('/diary', (req, res) => {

    let user = req.session.user;
    if (user) {
        if (user.role == 'opettaja' || user.role == 'hallinto') {
            pgtools.getDiary().then((resultset) => {
                // Lets give a key for the resultset and render it to the page
                res.render('diary', {diaryData: resultset.rows})
            })
        } else {
            res.render('notAuthorized');
        }
    } else {
        res.render('notSignedIn');
    }
    
});

app.get('/filterDiary', (req, res) => {

            // Set user role to none
            let userRole = 'none';
    
            // Read session data
            if (req.session.user) {
                userRole = req.session.user.role;
            }

            if (userRole == 'opettaja' || userRole == 'hallinto') {
        
            } else {
                res.render('notAuthorized');
            }

            // Set query parameters
            let options = {};
            let registerList = [];
            let driverList = [];
            let reasonList = [];

            pgtools.selectQuery('SELECT * FROM webrekisterit;').then((resultset) => {
            registerList = resultset.rows;

            pgtools.selectQuery('SELECT * FROM webtarkoitukset;').then((resultset) => {
            reasonList = resultset.rows

            pgtools.selectQuery('SELECT * FROM webkuljettajat;').then((resultset) => {
            driverList = resultset.rows;

            options = {registers: registerList,
                reasons: reasonList,
                drivers: driverList
                };
                res.render('filterDiary', options)

            })
        })
    })

});

app.get('/filteredDiary', (req, res) => {
    if (req.session.user) {
        userRole = req.session.user.role;
        if (userRole == 'opettaja' || userRole == 'hallinto') {
            let registerFilter = req.query.rekisterinumero
            let registerFilterValid = req.query.rekisterisuodatus
            let reasonFilter = req.query.tarkoitus
            let reasonFilterValid = req.query.tarkoitussuodatus
            let driverFilter = req.query.nimi
            let driverFilterValid = req.query.kuljettajasuodatus
            let startFilter = req.query.alkaa
            let startFilterString = startFilter.toString()
            let endFilter = req.query.loppuu
            let dateFiltersValid = req.query.ottosuodatus
    
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
            if (dateFiltersValid == 'on') {
                conditions = conditions +  `otettu BETWEEN '${startFilter}' AND '${endFilter}'`;
            }

            let whereClause = 'WHERE ' + conditions;
            let cleanwhereClause = '';
            if (whereClause.endsWith(' AND ')) {
            let position = whereClause.lastIndexOf(' AND ');
            cleanwhereClause = whereClause.substring(0, position);
            }
            else {
            cleanwhereClause = whereClause
            }
            console.log(cleanwhereClause);
            let sqlstatement = 'SELECT * FROM public.webajopaivakirja ' + cleanwhereClause
            pgtools.selectQuery(sqlstatement).then((resultset) => {
                res.render('filteredDiary', {diaryData: resultset.rows});
            })
        } else {
            res.render('notAuthorized')
        }
    } else {
        res.render('notSignedIn')
    }
})

// Route to diary containing all vehicle data tax administration
app.get('/diaryTax', (req, res) => {

    let user = req.session.user;
    if (user) {
        if (user.role == 'hallinto') {
            pgtools.getTaxDiary().then((resultset) => {
                // Lets give a key for the resultset and render it to the page
                res.render('diaryTax', {diaryData: resultset.rows})
            })
        } else {
            res.render('notAuthorized');
        }
    } else {
        res.render('notSignedIn');
    }
    
});

// Route to sign out page
app.get('/signOut', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.render('signOutError');
        } else {
            res.render('signOutSuccess');
        }

    });
})

app.get('/api/meaningOfLife', (req, res) => {
    const something = {"explation": "42"}
    res.json(something);
})
// TODO: Route to vehicle's diary page: all entries for individual vehicle by register number

// TODO: Route to vehicle's tracking page: location by register number

// SERVER START
// ------------
app.listen(PORT)
console.log(`Server started on port ${PORT}`)