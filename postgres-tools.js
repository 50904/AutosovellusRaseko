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

// Vehicle list page

const getFreeVehicles = async () => {
    let resultset = await pool.query('SELECT * FROM public.vapaana');
    return resultset;
}
// Vehicle details page

// Diary page

// Esimerkki: näin voit testata selectQuery-funktiota

// EXPORT FUNCTIONS
// ----------------
module.exports = {insertQuery, selectQuery};