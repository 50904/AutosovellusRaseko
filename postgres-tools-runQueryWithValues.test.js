// Test for function runQueryWithValues
// ====================================
    
// Import functions and the pool from postgres-tools module
const { Query } = require('pg');
const pgTools = require('./postgres-tools');


test('Select all rows from test table', () => {
    let query = {
        text: 'SELECT * FROM jest_test WHERE id = $1',
        values: [2]
    };

    let correctResultSet = {
        id: 2,
        nimi: 'Calle Keckelberg',
        palkka: 7650,
        koodari: false,
        aikaleima: '2025-09-29T08:19:08.101Z'
    };
    // Run the query and wait for the results
        pgTools.selectQuery(query).then((resultset) => {
    
            // Because rows are objects use toEqual for comparison: properties
            // are the same, but objects are different objects
            expect(resultset.rows[0]).toEqual(correctResultSet);
    });
})
    