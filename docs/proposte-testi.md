# Proposte di testo per le descrizioni senza numero (1.14.2) — da approvare

Raccolta delle descrizioni di carte (S/C/L/K di `PLAYER_DEF.ups` e `TURRETS[…].ups`) che non riportano il numero principale dell’effetto.
I valori sono letti da `app/index.html` (righe del file attuale, non ancora modificato). Le proposte sono misurate con lo stesso metodo di
`tests/testi.js` (12 px, peso 500, limite 260 px): tutte stanno sotto il limite; tra parentesi la larghezza in px quando è vicina al limite.

Fuori da queste tabelle, perché già con i numeri o senza descrizione propria:
- **Albero dei Sigilli** (`TREE`, `buildTree`, `lvNode`): i nodi a livelli hanno già il valore in `fx`; i nodi di sblocco mostrano nome e voce della carta,
  non una descrizione propria (prendono il testo della carta, quindi si sistemano con le tabelle sotto); “Sblocco permanente” non ha un numero da riportare.
- **Moduli** (`MOD`): tutti i 30 testi riportano già il valore per rarità.
- **Abilità della barriera** (`ABILITIES`): già aggiornate nella 1.14.2, saltate.

Valori comuni usati sotto: rallentamento = velocità −50% (riga 2387); indebolimento = il nemico infligge −35% (riga 1035); vulnerabilità = +25% di danni subiti
(riga 1058). Tutte le durate degli stati sono moltiplicate per il nodo “Durata degli stati” dell’albero (`statDur`, righe 1031-1036); i boss hanno `statRes`
che riduce rallentamento e vulnerabilità.

## Guardiano

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Guardiano | Frenesia (`frenzy1`) | Barra carica → fuoco e danno maggiori | carica 30 s, dura 8 s, cadenza ×1,8, danno ×1,35 (`FRENZY`, 1872; `frenzyK`, 470) | Ogni 30 s: 8 s di fuoco ×1,8, danno ×1,35 (258 px) |
| Guardiano | Più esplosioni (`boomP`) | Probabilità di esplosione maggiore | probabilità +10%: dal 10% al 20% (1947) | Probabilità di esplosione: dal 10% al 20% (253 px) |
| Guardiano | Esplosioni potenziate (`boom3`) | Più probabilità e più raggio | probabilità +10% (al 30%), raggio +30% (1947-1948) | Esplosione al 30% e raggio +30% |
| Guardiano | Ventaglio (`fan`) | Proiettili secondari a ventaglio | 4 secondari (`fanOffsets`, 1937) al 30% del danno (`fanK(0)`, 470; 1916-1917) | 4 proiettili a ventaglio al 30% del danno |
| Guardiano | Colpo pesante (`punch`) | Molto più danno, lieve knockback | danno ×1,6 (1908); knockback 1,5 px, 4,5 in frenesia (1949) | Danno +60%, lieve knockback |
| Guardiano | Rimbalzo (`ricochet`) | I proiettili rimbalzano | 1 rimbalzo su un nemico entro 180 px (1946, 1985) | I proiettili rimbalzano su 1 nemico |

## Sky Guard

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Sky Guard | Missili incendiari (`burn1`) | I missili principali bruciano i colpiti | bruciatura 3 s, 6 danni/s × danno della torre (1193) | I missili bruciano i colpiti per 3 s |
| Sky Guard | Combustione (`burn3`) | Chi muore bruciato esplode ad area | esplosione di 40 px al 60% del danno del missile (1209-1210) | Chi muore bruciato esplode al 60% |
| Sky Guard | Impatto devastante (`impact`) | Danno da impatto molto più alto | danno del missile ×1,8 (1160) | Danno da impatto +80% |
| Sky Guard | Scia incendiaria (`pass`) | I missili bruciano chi attraversano | bruciatura 3 s, 5 danni/s × danno della torre (1180-1181) | I missili bruciano per 3 s chi attraversano |
| Sky Guard | Doppio impatto (`again`) | Seconda esplosione dopo l’impatto | dopo 0,5 s, al 60% del danno (1190, 1201) | Dopo 0,5 s seconda esplosione al 60% |

## Laser

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Laser | Raggi multipli (`multi1`) | +2 mini-raggi fissi, danno minore | mini-raggi al 40% del danno (1233) | +2 mini-raggi fissi al 40% del danno |
| Laser | Raggi debilitanti (`multiW`) | Raggio e mini-raggi indeboliscono | indebolimento (−35%) per 2,5 s (1222, 1035) | Raggi: i colpiti infliggono −35% per 2,5 s |
| Laser | Mini-raggi potenziati (`multiD`) | Danno dei mini-raggi maggiore | dal 40% al 70% del danno (1233) | Mini-raggi dal 40% al 70% del danno |
| Laser | Raggio spazzante (`sweep1`) | Un raggio attraversa lo schermo | spazzata di 3 s (1246), 18 danni/s × danno della torre (1252) | Un raggio spazza lo schermo in 3 s |
| Laser | Spazzata rallentante (`sweep2`) | Il raggio rallenta i colpiti | rallentamento (−50%) per 1,5 s (1252) | La spazzata rallenta del 50% per 1,5 s |
| Laser | Raggio persistente (`longer`) | Durata dei raggi molto maggiore | durata ×1,7 (1228) | Durata dei raggi +70% |
| Laser | Sfruttare i debuff (`exploit`) | Più danno a chi ha un debuff | danno ×1,5 (1218) | +50% di danno a chi ha un debuff |
| Laser | Debuff prolungati (`debuffdur`) | I debuff durano di più | durata dei debuff del laser ×1,5 (1229) | I debuff dei raggi durano +50% |

## Disruption Drone

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Disruption Drone | Teletrasporto (`tp1`) | 5%: il colpito viene spinto indietro | spinta di 90 px (1311) | 5%: il colpito torna indietro di 90 px |
| Disruption Drone | Teletrasporto letale (`tp3`) | Il teletrasporto danneggia in % la vita | 20% della vita attuale (1313) | Teletrasportato: −20% della vita attuale |
| Disruption Drone | Scarica distruttiva (`dstB`) | A stack massimo: scarica di danno | scarica pari a 3 volte il danno del campo (1304) | A stack massimo: scarica ×3 del danno |
| Disruption Drone | Ricarica rapida (`reload`) | Ricarica leggermente ridotta | ricarica ×0,85 (1013) | Ricarica −15% |
| Disruption Drone | Esplosione finale (`blast`) | A fine durata il campo esplode | 3 volte il danno del campo (1274) | A fine durata esplode: danno ×3 |
| Disruption Drone | Campo destabilizzante (`amp`) | Più danni dalle altre torri nel campo | danni delle altre fonti ×1,25 (1280, 1060) | Nel campo: +25% danni dalle altre torri |
| Disruption Drone | Pulsazione rapida (`tick`) | Il campo danneggia più spesso | un colpo ogni 0,6 s invece di 1 (1269) | Il campo colpisce ogni 0,6 s invece di 1 |
| Disruption Drone | Campo attrattivo (`grip`) | Più danno, attira verso il centro | danno ×1,4 (1293); a ogni colpo metà della distanza dal centro (1284) | Danno +40%, attira verso il centro |

## Aeroblast

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Aeroblast | Schegge d’urto (`salvoK`) | Le schegge causano knockback | spinta di 10 px (1358) | Le schegge spingono indietro di 10 px |
| Aeroblast | Mine d’urto (`mineK`) | Le mine causano knockback | spinta di 14 px (1376) | Le mine spingono indietro di 14 px |
| Aeroblast | Mine potenziate (`mineD`) | Le mine fanno più danno | danno delle mine ×1,6 (1369) | Le mine fanno +60% di danno |
| Aeroblast | Spinta maggiore (`knock`) | Knockback molto più forte | da 14 a 30 px (1318) | Knockback da 14 a 30 px |

## Thunderbolt

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Thunderbolt | Ramificazioni debilitanti (`forkW`) | Indeboliscono e fanno più danno | ramificazioni dal 50% al 75% del danno, indebolimento 3 s (1421-1422) | Ramificazioni al 75%, indeboliscono 3 s |
| Thunderbolt | Scossa continua (`paraD`) | Danno elettrico ai paralizzati | 25% del danno del fulmine ogni 0,3 s finché dura la paralisi (1417, 2384) | Paralizzati: 25% del danno ogni 0,3 s |
| Thunderbolt | Fulmini larghi (`wide`) | Larghezza dei fulmini maggiore | larghezza ×1,8 (1436) | Larghezza dei fulmini +80% |
| Thunderbolt | Sfera sul campo (`orb`) | I fulmini possono creare una sfera | 30% per fulmine (1454); la sfera dura 4 s (1458) | 30%: il fulmine crea una sfera per 4 s |
| Thunderbolt | Fulmini corrosivi (`vuln`) | I fulmini rendono vulnerabili | vulnerabilità (+25%) a tutti i tipi per 2,5 s (1443, 1058) | Fulmini: +25% danni subiti per 2,5 s |
| Thunderbolt | Sfere pungenti (`aura`) | Danni a chi è vicino alle sfere | ogni 0,6 s, entro 60 px, 6 × danno della torre (1403-1404) | Danni ogni 0,6 s entro 60 px dalle sfere |

## Beam

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Beam | Attrazione (`pull`) | I bersagli si avvicinano al primo | ogni secondo i ramificati coprono circa il 60% della distanza dal primo (fattore 0,9·dt per fotogramma, 1512) | Ramificati attratti verso il primo (dubbio: vedi sotto) |
| Beam | Base esplosiva (`forkX`) | Esplosioni ripetute sul primo bersaglio | ogni 0,5 s, 40 px, al 50% del danno al secondo (1514-1516) | Ogni 0,5 s esplosione sul primo bersaglio |
| Beam | Vulnerabilità (`vuln`) | Il raggio rende i nemici vulnerabili | vulnerabilità (+25%) a tutti i tipi per 2 s (1506, 1058) | Bersagli: +25% danni subiti per 2 s |
| Beam | Ritmo accelerato (`pace`) | Il danno del raggio è più rapido | danno al secondo ×1,4 (1479) | Danno del raggio +40% |
| Beam | Cacciatore di boss (`boss`) | Più danno a mini-boss e boss | danno ×1,5 (1505) | +50% di danno a mini-boss e boss |

## Firewheel Drone

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Firewheel Drone | Mini-droni incendiari (`miniB`) | I mini-droni bruciano i nemici | bruciatura 2 s, 5 danni/s (1551) | I mini-droni bruciano i nemici per 2 s |
| Firewheel Drone | Mini-droni potenziati (`miniD`) | I mini-droni fanno più danno | danno ×1,6 (1536) | Mini-droni: danno +60% |
| Firewheel Drone | Scatto (`dash`) | Più veloce quando non colpisce | velocità ×1,8 (1565) | Velocità ×1,8 quando non colpisce |

## Hive

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Hive | Onda iniziale (`wave1`) | Il primo colpo è un’onda d’urto in avanti | onda lunga 130 px al 90% del danno, spinta 16 px (1629-1636) | 1° colpo: onda d’urto in avanti al 90% |
| Hive | Onda ampia (`waveR`) | L’onda arriva più lontano | lunghezza ×1,4: da 130 a 182 px (1629) | L’onda arriva il 40% più lontano |
| Hive | Onda rallentante (`wave2`) | L’onda rallenta i nemici | rallentamento (−50%) per 2 s (1639) | L’onda rallenta del 50% per 2 s |
| Hive | Colpi di forza (`push`) | I colpi dei droni spingono indietro | spinta di 8 px (1659) | I colpi spingono indietro di 8 px |
| Hive | Droni kamikaze (`kami`) | Finiti i colpi, il drone si lancia ed esplode | esplosione di 40 px al doppio del danno di un colpo (1677) | Finiti i colpi, si lancia: esplosione ×2 |

## Railgun

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Railgun | Slancio (`mass`) | Più danno per ogni nemico attraversato | +15% per ogni nemico già colpito (1726) | +15% di danno per nemico attraversato |
| Railgun | Proiettile esplosivo (`boom1`) | Il primo impatto provoca un’esplosione | 30 px, 50% del danno (1742) | Il primo impatto esplode al 50% del danno (259 px) |
| Railgun | Carica esplosiva (`boomD`) | Più perforazioni: esplosione più forte | +15% per perforazione disponibile (1742) | Esplosione +15% per perforazione rimasta (259 px) |
| Railgun | Deflagrazione (`boomR`) | Più perforazioni: esplosione più ampia | raggio +10% per perforazione disponibile (1742) | Raggio +10% per perforazione rimasta |
| Railgun | Esplosioni a catena (`boom3`) | Anche i colpiti dopo il primo esplodono | colpito n° k: 100% − 20% × (k − 1), cioè 80%, 60%, 40%… (1730) | Esplodono anche i successivi: 80%, 60%… (257 px) |
| Railgun | Impatto (`punch`) | Danno maggiorato + knockback | danno ×1,5, spinta 14 px (1716) | Danno +50%, knockback 14 px |
| Railgun | Penetrazione (`pen`) | Più knockback e perforazione | +2 perforazioni (1712), spinta 28 px (1716) | +2 perforazioni, knockback 28 px |
| Railgun | Vulnerabilità fisica (`vulnP`) | I colpi rendono vulnerabili al fisico | vulnerabilità (+25%) al fisico per 3 s (1727, 1058) | Colpiti: +25% danni fisici per 3 s |
| Railgun | Impatto stordente (`stun`) | Paralizza tutti i colpiti | paralisi 0,8 s, boss immuni (1728) | Paralizza i colpiti per 0,8 s |

## Teslacoil

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Teslacoil | Sfera rallentante (`orbSlow`) | La sfera rallenta i nemici | rallentamento (−50%) di 0,4 s, rinnovato finché si è dentro (1792) | La sfera rallenta del 50% |
| Teslacoil | Sfera carica (`orbD`) | La sfera fa più danno | danno ×1,6 (1792) | Danno della sfera +60% |
| Teslacoil | Sfera persistente (`orbDur`) | La sfera dura più a lungo | 3,5 s invece di 2 (1792) | La sfera dura 3,5 s invece di 2 |
| Teslacoil | Sovraccarico (`over1`) | Carica +0,5 s, esplosione più ampia | raggio +30% per ogni 0,5 s di carica in più: +30% con la sola voce lv1 (1752, 1779-1781) | Carica +0,5 s, raggio esplosione +30% |
| Teslacoil | Carica potenziata (`over2`) | Carica +0,5 s, esplosione più forte | danno +30% per ogni 0,5 s in più; con lv1+lv2 danno e raggio +60% (1780-1781) | Carica +0,5 s: danno e raggio +60% |
| Teslacoil | Carica massima (`over3`) | Carica +1 s: esplosione ancora maggiore | con tutta la chain 2 s di carica in più: danno e raggio +120% (1780-1781) | Carica +1 s: danno e raggio +120% |
| Teslacoil | Esplosione a catena (`chain`) | Colpisce in parte 5 nemici vicini | 5 nemici entro 100 px al 40% del danno (1788-1789) | Colpisce 5 nemici vicini al 40% del danno |
| Teslacoil | Campo di carica (`charge`) | Mentre carica, colpisce chi è sopra | 15 danni/s × danno della torre, colonna larga 120 px e alta 170 (1758) | Mentre carica: 15 danni/s a chi è sopra |

## Gravity Vortex Gun

| Entità | Carta (id) | Testo attuale | Valore nel codice (riga) | Proposta |
|---|---|---|---|---|
| Gravity Vortex Gun | Varco ampio (`wh2`) | L’ingresso del wormhole è più grande | ingresso ×1,6 (da 22 a 35 px, 1844) | Ingresso del wormhole +60% |
| Gravity Vortex Gun | Uscita rallentante (`wh3`) | Chi esce dal 2° varco è rallentato | rallentamento (−50%) per 2 s (1850) | Uscita: rallentati del 50% per 2 s |
| Gravity Vortex Gun | Buco nero statico (`stat1`) | A fine percorso resta fermo e attrae | fermo 2 s (1819, 1825) | A fine percorso resta fermo 2 s e attrae |
| Gravity Vortex Gun | Statico potente (`stat3`) | Il buco nero statico fa più danno | danno da fermo ×1,6 (1819) | Danno del buco nero statico +60% |
| Gravity Vortex Gun | Attrazione forte (`pull`) | Forza attrattiva molto maggiore | ×1,6: da 80 a 128 px/s (1818) | Attrazione +60% (da 80 a 128 px/s) |
| Gravity Vortex Gun | Buco nero lento (`lazy`) | Avanza più piano: resta più sui nemici | velocità da 130 a 80 px/s (1818) | Velocità da 130 a 80 px/s: resta di più |
| Gravity Vortex Gun | Collasso crescente (`grow`) | Danno e attrazione crescono col percorso | fino a ×2 a fine percorso (1827) | Danno e attrazione fino a ×2 col percorso |

## Casi dubbi

- **Valori che dipendono da più fattori.** Sovraccarico, Carica potenziata e Carica massima (Teslacoil) non hanno un effetto fisso per carta: il codice
  conta i mezzi secondi di carica in più (`extra`, riga 1779) e la voce lv1 dà il raggio, la lv2 il danno, entrambi +30% per ogni 0,5 s. Il valore del
  lv1 cambia quando si prendono i successivi (+30% → +60% → +120%): le proposte riportano il totale dopo la carta, che è giusto solo perché la chain è
  in sequenza obbligata. Frenesia: carica, durata e moltiplicatore del danno cambiano con Carica rapida, Frenesia prolungata, Frenesia furiosa e con il nodo
  “Frenesia potenziata” dell’albero (+2 s di carica per livello, danno fino a ×3): il testo riporta i valori base. Esplosioni potenziate del guardiano:
  il 30% vale perché Più esplosioni è l’unica voce lv2 della sua chain. Esplosioni a catena (Railgun): la probabilità scende del 20% per ogni colpito, il testo
  mostra solo i primi due valori.
- **Attrazione del Beam** (`pull`): il codice sposta i ramificati di 0,9·dt della distanza a ogni fotogramma (decadimento esponenziale, circa −60% di
  distanza al secondo); un numero chiaro in 38 caratteri non c’è (“−60%/s” sarebbe oscuro, e il testo con il numero supera i 260 px). Propongo di
  correggere solo il soggetto (sono i ramificati, non tutti i bersagli) e lasciarlo senza numero, oppure di decidere un valore più leggibile.
- **Danni assoluti** (Missili incendiari, Scia incendiaria, Mini-droni incendiari, Sfere pungenti, Campo di carica): il codice usa danni al secondo fissi
  moltiplicati per il danno della torre (`dmgM`), quindi un numero assoluto cambia con le carte “Danno maggiorato” e con l’albero. Per le bruciature ho
  messo la durata; per Campo di carica “15 danni/s” è il valore base e potrebbe trarre in inganno (in alternativa: “Mentre carica, colpisce chi è sopra”
  com’è ora). Anche Combustione (60% del danno) e Base esplosiva lasciano fuori il raggio (40 px) per stare nei 260 px.
- **Stati ridotti dai boss e dall’albero**: rallentamento −50% e vulnerabilità +25% sono ridotti da `statRes` sul boss finale; tutte le durate degli stati
  crescono con il nodo “Durata degli stati”. I testi riportano i valori base.
- **Testi al limite** (oltre 250 px su 260): Frenesia (258), Proiettile esplosivo e Carica esplosiva (259), Esplosioni a catena (257), Probabilità di
  esplosione (253). Stanno nel limite di `tests/testi.js` sul font usato qui; con un font di sistema diverso sul telefono potrebbero toccare il bordo.
  Scartate perché oltre il limite: “+15% di danno per ogni nemico attraversato” (273), “Chi muore bruciato esplode: 60% del danno” (267),
  “Ogni 30 s: 8 s di cadenza ×1,8, danno ×1,35” (275).
- **Colpo pesante**: il knockback (1,5 px, 4,5 in frenesia) è troppo piccolo per essere un numero utile; resta “lieve knockback”.
- **Teletrasporto letale**: il 20% è della vita attuale, non massima (`e.hp * 0.2`, riga 1313); il testo lo dice.
- Carte rimaste senza numero di proposito perché l’effetto è un conteggio già nel nome o qualitativo: Secondo laser (Beam), Secondo buco nero (Vortex),
  Doppia spazzata e Mini-raggi rimbalzanti (Laser), Doppia scarica (Disruption, stessa scarica ×3 dopo 0,4 s), Sciame II/III (Hive), Mine (Aeroblast).
  Doppia esplosione dell’Aeroblast ha la durata (1 s) ma non il danno (60%, riga 1346): se si vuole, “I colpi riesplodono dopo 1 s al 60%”.
