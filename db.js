const { Pool } = require('pg');

// Poolin konfiguraatio (muokkaa tarvittaessa omilla arvoilla)
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

// Yleinen kyselyfunktio
async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// Esimerkki: hae kaikki rivit taulusta
async function getAll(table) {
  const res = await pool.query(`SELECT * FROM ${table}`);
  return res.rows;
}

// Esimerkki: lisää rivi tauluun
async function insert(table, columns, values) {
  const cols = columns.join(', ');
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const text = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
  const res = await pool.query(text, values);
  return res.rows[0];
}

module.exports = {
  query,
  getAll,
  insert,
  pool,
};
