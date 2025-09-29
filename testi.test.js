// TESTS FOR MODULE POSTGRES-TOOLS IN A SINGLE FILE
// ================================================

// IMPORT THE MODULE TO BE TESTED
// ------------------------------

// Custom mnodule to make queries from PostgreSQL databases
const pgTools = require('./postgres-tools');

// Container function to include serveral test functions
describe('postgres-tools funktions testing', () => {

    // 1st test for selectQuery function
    test('selectQuery', () => {

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
    // testaa selectQuery
  });

  // 2nd test for runQueryWithValues function
  test('runQueryWithValues', () => {
    let query = {
            text: 'SELECT * FROM jest_test WHERE id = $1',
            values: [2]
        };

        // Define the properties of an object to compare against
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
    // testaa runQueryWithValues

