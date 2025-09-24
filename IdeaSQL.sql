-- Select all vehicles and set status to vapaana (available)
SELECT auto.rekisterinumero,
	auto.merkki,
	auto.malli,
	auto.henkilomaara,
	auto.automaatti,
	text 'vapaana' AS status
FROM public.auto
WHERE auto.kaytettavissa = TRUE

-- Use set theory's except operation to remove vehicles in use but set status also to vapaana(available)
-- to get correct result set
EXCEPT 
SELECT auto.rekisterinumero,
	auto.merkki,
	auto.malli,
	auto.henkilomaara,
	auto.automaatti,
	text 'vapaana' AS status
FROM public.auto INNER JOIN public.lainaus ON auto.rekisterinumero = lainaus.rekisterinumero
WHERE auto.kaytettavissa = TRUE AND lainaus.palautusaika IS NULL

-- Add vehicles in use using set theory's union operation and set status to ajossa (in use)
UNION
SELECT auto.rekisterinumero,
	auto.merkki,
	auto.malli,
	auto.henkilomaara,
	auto.automaatti,
	text 'ajossa' AS status
FROM public.auto INNER JOIN public.lainaus ON auto.rekisterinumero = lainaus.rekisterinumero
WHERE auto.kaytettavissa = TRUE AND lainaus.palautusaika IS NULL;