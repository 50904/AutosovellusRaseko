// MODULE FOR HANDLING POSTGRESQL DATABASE QUERIES
// ===============================================

// LIBRARIES AND MODULES
// ---------------------

// EXTERNAL LIBRARIES

// Pg-pool 
const Pool = require('pg').Pool;

// Enviroment variables handling
const dotenv = require('dotenv')

// LOCAL LIBRARIES AND MODULES

// DEFINITIONS
// -----------

// Intialize enviroment
dotenv.config();

// Read enviroment variables
const currentEnv = process.env

// Connection settings
const connection = {host: currentEnv.HOST,
    port: currentEnv.DB_PORT,
    database: currentEnv.DB,
    user: currentEnv.APP_USER,
    password: currentEnv.APP_PASSWORD
};

// Create pool object for transactions
const pool = new Pool(connection);

// CRUD FUNCTIONS

/** 
* A function to insert data into database.
* @summary Allows you to insert data into database with SQL statement and values.
* @async
* @param {string} sqlstatement - SQL statement for inserting data. 
* @param {Array} values - Array of values to be inserted.
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const insertQuery = async (sqlstatement, values) => {
    let resultset = await pool.query(sqlstatement, values);
    return resultset;
} 

/** 
* Select data from database.
* @summary Runs a select query with given SQL statement.
* @async    
* @param {string} sqlstatement - SQL statement for selecting data.
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const selectQuery = async (sqlstatement) => {
    let resultset = await pool.query(sqlstatement);
    return resultset;
}


// TODO: Update data with SQL statement

// TODO:Delete data with SQL statement

// APP SPECIFIC QUERIES
// --------------------

/** 
* Returns web users data by email address.
* @param {string} values - Users email address
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getWebUserData = async (values) => {
    let sqlstatement = 'SELECT * FROM webuser WHERE email = $1';
    let resulset = await pool.query(sqlstatement, values);
    return resulset;
}
/** 
* Get all current vehicles and their status.
* @summary Reads vehicle information from view web_autojen_tila (vehicle status).
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getVehicleData = async () => {
    let sqlstatement = 'Select * FROM public.web_autojen_tila';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

/** 
* Get free vehicles from database.
* @summary Returns all rows from view vapaana (free vehicles).
* @async
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getFreeVehicles = async () => {
    let sqlstatement = 'SELECT * FROM public.vapaana';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

/** 
* Get vehicles in use from database.
* @summary Returns all rows from view ajossa (vehicles in use).
* @async
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getVehiclesInUse = async () => {
    let sqlstatement = 'SELECT * FROM public.ajossa';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

/** 
* Get vehicle details from database.
* @summary Returns details about a vehicle currently in use
* @async
* @param {Array} values - Array of register numbers to be used in the query.
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getVehicleDetails = async (values) => {
    let sqlstatement = 'SELECT * FROM public.webaktiivinen_ajo WHERE rekisterinumero = $1';
    let resultset = await pool.query(sqlstatement, values);
    return resultset;
}

// Vehicle details page - vehicle in use by register number: SQL + value 2nd method
const query = {
    text: 'SELECT * FROM public.webaktiivinen_ajo WHERE rekisterinumero = $1',
    values: ['XYZ-123']
}
    
/** 
* A generic function to run a query with pre-structured statement and values.
* @summary Executes a SQL query with the provided parameters.
* @param {Object} query - The query object containing SQL clause as text and values as an array of values.
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const runQueryWithValues = async (query) => {
    let resultset = await pool.query(query);
    return resultset;
}
/** 
* Get vehicle diaries from database.
* @summary Returns all rows from view ajopaivakirja (diary).
* @async
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getDiary = async () => { 
    let sqlstatement = 'SELECT * from public.webajopaivakirja';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

/** 
* Get vehicle diaries from database.
* @summary Returns all rows from view ajopaivakirja_verottaja (diary).
* @async
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getTaxDiary = async () => { 
    let sqlstatement = 'SELECT * from public.ajopaivakirja_verottaja';
    let resultset = await pool.query(sqlstatement);
    return resultset;
}

/** 
* Get diary by register number.
* @summary Returns diary of a vehicle identified by it's register numger.
* @param {Array} register Registernumber in string array format .
* @return {Promise} Rows from ajopaivakirja view (diary)
*/

const getVehicleDiary = async (register) => {
    let sqlstatement = 'SELECT * from public.webajopaivakirja WHERE rekisterinumero = $1'
    let resultset = await pool.query(sqlstatement, register);
    return resultset;

}
// Location page - location by register number -> create a view for this

/** 
* Get vehicle location from database.
* @summary Returns all rows from view sijainti (location).
* @async
* @param {Array} values - Array of register numbers to be used in the query.
* @return {Promise} Returns a promise that resolves to the result set of the query.
*/

const getLocationByReg = async (values) => {
    let sqlstatement = 'SELECT * FROM public.sijainti WHERE rekisterinumero = $1';
    let resultset = await pool.query(sqlstatement, values);
    return resultset;
}

/** 
* Converts PostgreSQL timestamp to user friendly string format.
* @param {timestamp} timestamp - Timestamp to be converted to string format
* @return {object} Object containing date and time as string.
*/

const convertToDateTimeObject = (timestamp) => {
    let isoTimestamp = timestamp.toISOString();
    let splittedISOTimestamp = isoTimestamp.split('T');
    let splittedTime = splittedISOTimestamp[1].split('.')
    let result = {date: splittedISOTimestamp[0],
        time: splittedTime[0]
    };
    return result;
}
/*selectQuery('SELECT * FROM jest_test').then((resultset) => {
    console.log(resultset.rows)
})
*/
// EXPORT FUNCTIONS
// ----------------

// TODO: Export all functions and the pool itself. Jest needs the pool to run tests
module.exports = {pool, insertQuery, selectQuery, getFreeVehicles, getVehiclesInUse, getVehicleDetails, getDiary, getTaxDiary,getVehicleDiary, runQueryWithValues, getLocationByReg, getVehicleData,  convertToDateTimeObject, getWebUserData};