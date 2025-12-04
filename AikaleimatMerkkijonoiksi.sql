SELECT rekisterinumero,
    tarkoitus,
    (sukunimi::text || ' '::text) || etunimi::text AS nimi,
    to_char(otto, 'YYYY-MM-DD') AS ottopvm,
	to_char(otto, 'HH24:MI:SS') AS ottokello,
	to_char(otto, 'YYYY-MM-DD HH24:MI:SS' ) AS ottoaika,
    (palautus AT TIME ZONE 'Europe/Helsinki'::text) AS palautettu
   FROM ajopaivakirja
  ORDER BY rekisterinumero, otto DESC;