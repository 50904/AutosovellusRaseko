// MODULE FOR HANDLING POSTGRESSQL DATABASE QUERIES
// ================================================

// LIBARIES AND MODULES
// --------------------

// EXTERNAL LIBARIES

// Pg-pool
const Pool = require('pg').Pool;

// LOCAL LIBARIES AND MODULES

// DEFINITIONS
// -----------

// Connection settings
const connection = {host: '127.0.0.1',
    port: '5432',
    database: 'autolainaus',
    user: 'websovellus',
    password: 'Q2werty7'
}

// Create pool object for transactions
const pool = new Pool(connection);

// CRUD FUNCTIONS

// Create data with SQL statement and get results
const insertQuery = async (sqlstatement, values) => {
    let resultset = await pool.query(sqlstatement, values);
    return resultset;
}

// Read data with SQL statement 
const selectQuery = async (sqlstatement) => {
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

// Update data with SQL statement

// Delete data with SQL statement

// APP SPECIFIC QUERIES

// Home page

// Vehicle list page - Get free vehicles
const getFreeVehicles = async () => {
    let sqlstatements =('SELECT * FROM public.vapaana');
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

// Vehicle list page - Get vehicles in use
const getVehicleInUse = async () => {
    let sqlstatements = 'SELECT * FROM public.ajossa';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

// Vehicle details page - vehicle in use by register number
const getVehicleDetails = async (vehicleId) => {
    let sqlstatements = "SELECT * FROM public.ajopaivakirja WHERE rekisterinumero = 'XYZ-123'";
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

// Vehicle details page - vehicle in use by register number: SQL + value
const getVehicleDetails2 = async (values) => {
    let sqlstatement = "SELECT * FROM public.ajopaivakirja WHERE rekisterinumero = $1";
    let resultset = await pool.query(sqlstatement, values);
    return resultset;
}

// Vehicle details page - vehicle in use by register number: SQL + value 2nd method
const query = {
    text: "SELECT * FROM public.ajopaivakirja WHERE rekisterinumero = $1",
    values: ['XYZ-123']
}

const getVehicleDetails3 = async (query) => {
    let resultset = await pool.query(query);
    return resultset;
}

// Diary page - all vehicles
const getDiary = async () => {
    let sqlstatements = 'SELECT * FROM public.ajopaivakirja';
    let resultset = await pool.query(sqlstatements);
    return resultset;
}
// Location page - location by register number

getVehicleDetails2(['XYZ-123']);
// EXPORT FUNCTIONS
// ----------------
module.exports = {insertQuery, selectQuery, getFreeVehicles, getVehicleInUse, getVehicleDetails, getDiary};