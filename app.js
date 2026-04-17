// WEB APPLICATION FOR SERVING RASEKO'S VEHICLE LENDING DATABASE
// =============================================================

// LIBRARIES
// ---------

// External libraries
// ------------------
const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');

require('dotenv').config();

// Local libraries and modules
// ---------------------------

const pgtools = require('./postgres-tools');
const { route } = require('express/lib/application');

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
// Route to home page: login
app.get('/', (req, res) => {
    res.render('index')
});

// Route to welcome page: compare credentials given at login against the database
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

                // Success updated session data and render welcome page
                // Session data contains property user and has only userRolse as value
                // It is possible to store more user data by defining more key-value-pairs
                sessionData.user = {role: userRole}
                res.render('welcome', {user: inputEmail, role: userRole})
            }

            else {
                // Invalid password, render error page
                res.render('invalidPassword');
            }

        } else {
            //  Invalid email address, render error page
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

// TODO: Muunna käyttämään oikeaa dataa fleet management sovelluksesta.
// TODO: Käytä .env muuttujia API_KEY ja API_BASE_URL (tai API_URL) API-kutsun asetuksiin.
// app.get('/api/vehiclePositionData', (req, res) => {
//     register = req.query.register
//     console.log(register)

//     // Example data as JavaScript object from external source
//     let data = {lat: 60.4786,
//                 lon: 22.1636,
//                 register: register
//     }

//     // Convert data to JSON 
//     let jsonData = JSON.stringify(data)
    
//     // Send JSON-data as response
//     res.json(jsonData);
// })

// TODO: Route to vehicle's tracking page: location by register number.
// TODO: Kytke näkymä käyttämään API-dataa (/api/deviceRoutes tai /api/vehiclePositionData),
// TODO: jolloin API_KEY ja API_BASE_URL ovat käytössä myös vehiclePosition-reitityksen yhteydessä.
// app.get('/vehiclePosition', (req,res) => {
//     let vehicleData = {register: req.query.register}
//     res.render('vehiclePosition', vehicleData)
// })

// Route to vehicle tracking page.
// The page loads route data through the external API proxy below.
app.get('/vehiclePosition', (req, res) => {
    const { register, deviceId, startTime, endTime } = req.query;
    res.render('vehiclePosition', { register, deviceId, startTime, endTime });
});

// Cache for device list to avoid calling the external API on every request.
let deviceListCache = {
    expiresAt: 0,
    data: []
};

const getApiHeaders = (apiKey) => {
    return {
        API_KEY: apiKey,
        Accept: '*/*'
    };
};

const getDevicesFromApi = async (baseUrl, apiKey) => {
    const now = Date.now();
    if (deviceListCache.expiresAt > now && Array.isArray(deviceListCache.data) && deviceListCache.data.length > 0) {
        return deviceListCache.data;
    }

    const devicesResponse = await fetch(`${baseUrl}/public/api/devices/all`, {
        headers: getApiHeaders(apiKey)
    });

    if (!devicesResponse.ok) {
        const body = await devicesResponse.text();
        throw new Error(`Device list fetch failed: ${devicesResponse.status} ${body}`);
    }

    const devices = await devicesResponse.json();
    deviceListCache = {
        // Cache 5 minutes
        expiresAt: now + 5 * 60 * 1000,
        data: Array.isArray(devices) ? devices : []
    };

    return deviceListCache.data;
};

const resolveDeviceIdByRegister = async (inputIdOrRegister, baseUrl, apiKey) => {
    if (!inputIdOrRegister) {
        return inputIdOrRegister;
    }

    const normalizedInput = inputIdOrRegister.trim().toUpperCase();
    const devices = await getDevicesFromApi(baseUrl, apiKey);

    const match = devices.find((device) => {
        const fields = device?.fleetManagementFields || {};
        const licensePlate = String(fields.licensePlate || '').trim().toUpperCase();
        const registernumber = String(fields.registernumber || '').trim().toUpperCase();
        return licensePlate === normalizedInput || registernumber === normalizedInput;
    });

    // Common id keys seen in tracking APIs. Prefer explicit IDs over names.
    return match?.deviceId || match?.id || match?.uuid || match?.identifier || inputIdOrRegister;
};

// External API proxy for route data.
// Returns start/stop address data and timestamps for the selected route.
app.get('/api/deviceRoutes', async (req, res) => {
    const inputIdOrRegister = req.query.deviceId || req.query.register;
    const now = new Date();
    const startTime = req.query.startTime || new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const endTime = req.query.endTime || now.toISOString();
    const apiKeyRaw = process.env.API_KEY;
    const apiKey = (apiKeyRaw || '').trim().replace(/^['\"]|['\"]$/g, '');
    const baseUrl = process.env.API_BASE_URL;
    const authHeaderName = process.env.API_AUTH_HEADER || 'API_KEY';
    const authScheme = process.env.API_AUTH_SCHEME || '';

    if (!inputIdOrRegister) {
        return res.status(400).json({ error: 'Missing deviceId parameter' });
    }

    if (!apiKey || !baseUrl) {
        return res.status(500).json({ error: 'Missing API configuration' });
    }

    try {
        const deviceId = await resolveDeviceIdByRegister(inputIdOrRegister, baseUrl, apiKey);
        const url = `${baseUrl}/public/api/devices/routes/nopoints/${encodeURIComponent(deviceId)}/${encodeURIComponent(startTime)}/${encodeURIComponent(endTime)}`;

        const headers = {
            ...getApiHeaders(apiKey),
            [authHeaderName]: authScheme ? (apiKey.startsWith(`${authScheme} `) ? apiKey : `${authScheme} ${apiKey}`) : apiKey
        };

        const response = await fetch(url, {
            headers
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API error:', response.status, response.statusText, errorBody);

            if (response.status === 401) {
                return res.status(401).json({
                    error: 'Unauthorized from external API',
                    hint: 'Verify API_KEY and auth settings (API_AUTH_HEADER/API_AUTH_SCHEME).',
                    upstream: errorBody
                });
            }

            return res.status(response.status).json({ error: 'Error fetching data from API', upstream: errorBody });
        }

        const data = await response.json();
        const routes = Array.isArray(data) ? data : Array.isArray(data.routes) ? data.routes : Array.isArray(data.data) ? data.data : [];

        const simplified = routes.map(route => ({
            deviceId: route.deviceId,
            routeStartPosition: {
                houseno: route.routeStartPosition?.houseno,
                street: route.routeStartPosition?.street,
                city: route.routeStartPosition?.city
            },
            routeStopPosition: {
                houseno: route.routeStopPosition?.houseno,
                street: route.routeStopPosition?.street,
                city: route.routeStopPosition?.city
            },
            points: Array.isArray(route.points)
                ? route.points.map(point => ({
                    lat: point.lat,
                    lon: point.lon,
                    timestamp: point.timestamp,
                    timest: point.timest
                }))
                : [],
            driveStartTimest: route.driveStartTimest,
            driveStopTimest: route.driveStopTimest
        }));

        res.json(simplified);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
// SERVER START
// ------------
app.listen(PORT)
console.log(`Server started on port ${PORT}`)