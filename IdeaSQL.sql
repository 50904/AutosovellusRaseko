SELECT auto.rekisterinumero,
	auto.merkki,
	auto.malli,
	auto.henkilomaara,
	auto.automaatti
FROM public.auto
WHERE auto.kaytettavissa = TRUE
EXCEPT 
SELECT auto.rekisterinumero,
	auto.merkki,
	auto.malli,
	auto.henkilomaara,
	auto.automaatti
FROM public.auto INNER JOIN public.lainaus ON auto.rekisterinumero = lainaus.rekisterinumero
WHERE auto.kaytettavissa = TRUE AND lainaus.palautusaika IS NULL;