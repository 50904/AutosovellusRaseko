// TEST FOR MODULE POSTGRES-TOOLS
// ==============================

/* IMPORT MODULES TO BE TESTED PREFER ONE PER TEST FILE
  keep in mind that test module needs pool object to exported 
  in accordance to make tests to work correctly!
*/ 

// Import functions and the pool from postgres-tools module
const pgTools = require('./postgres-tools');


// Testing the selectQuery using test table 
test('Select all rows from test table', () => {

    // Define a SQL statement to be used
    let sqlstatement = 'SELECT * FROM jest_test';

    // Define a lists of objects with correct properties
    let correctResultSet = [
  { 
    id: 1,
    nimi: 'Jakke Jäynä',
    palkka: 2388.5,
    koodari: true,
    aikaleima: '2025-09-29T08:18:08.077Z'
  },
  {
    id: 2,
    nimi: 'Calle Keckelberg',
    palkka: 7650,
    koodari: false,
    aikaleima: '2025-09-29T08:19:08.101Z'
  }
];
    // Run the query and wait for the results
    pgTools.selectQuery(sqlstatement).then((resultset) => {

        // Because rows are objects use toEqual for comparison: properties
        // are the same, but objects are different objects
        expect(resultset.rows).toEqual(correctResultSet);
    });

})

