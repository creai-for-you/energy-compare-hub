# Energy Compare Hub
 Cloudflare Pages + Supabase
Gratuito per partire.
Hai:

✅ Frontend web
✅ Database PostgreSQL
✅ Login amministratore
✅ Hosting gratuito
✅ HTTPS
✅ Dominio personalizzato Aruba

## Stato attuale

### Completato ✅

#### Database
- repository_drive
- offerte
- offerte_pdf
- offerte_prezzi
- scansioni_drive

#### Drive Scanner
- Lettura Google Drive
- Scansione ricorsiva cartelle
- Parsing filename
- Upsert repository_drive
- Deploy Cloudflare

#### Naming offerte
Formato:

DOM FIX SICURA
DOM PSV AGILE FLEX
DOM PSV AGILE PREMIUM
BUS FIX SMART
BUS PSV SMART
CON PUN CONDOMINIO GREEN PLUS

### Verifiche effettuate ✅

repository_drive
- 38 PDF attivi

offerte_pdf
- 0 record

offerte_prezzi
- 4 record

scansioni_drive
- vuota

### Decisioni architetturali

Fonte della verità:

Google Drive

Pipeline attuale:

Google Drive
↓
drive-scanner
↓
repository_drive

Pipeline da realizzare:

repository_drive
↓
pdf-parser
↓
offerte_pdf

offerte_pdf
↓
offerte_prezzi

### Da fare ⏳

#### Fase 1
Creazione worker:

workers/pdf-parser.js

Responsabilità:
- leggere repository_drive
- scaricare PDF tramite google_file_id
- estrarre dati
- popolare offerte_pdf

#### Fase 2
Popolamento automatico offerte_prezzi

Campi:
- prezzo_fisso
- spread
- quota_fissa_annua
- cap
- durata_mesi
- sconti

### Note

I nomi file NON sono affidabili nel lungo periodo.

Devono essere considerati metadati.

Le informazioni economiche definitive devono provenire dal contenuto PDF.

### Ultimo aggiornamento

2026-07-17

Stato:
Drive Scanner completato.
Inizio sviluppo PDF Parser.
## Stato verificato 2026-07-17

repository_drive:
38 record

offerte_pdf:
0 record

offerte_prezzi:
4 record

scansioni_drive:
0 record

Conclusione:

Il Drive Scanner è completato e funzionante.

Non esiste ancora alcun parser PDF nel repository.

Verifiche eseguite:

grep -R "offerte_pdf" .
→ nessun risultato

grep -R "pdf-parse" .
→ nessun risultato

grep -R "pdfjs" .
→ nessun risultato

find . -type f | grep -i pdf
→ nessun parser PDF presente

Prossima attività:

Creazione worker dedicato:

workers/pdf-parser.js
## Fase PDF Parser

2026-07-17

Installazione libreria PDF:

npm install pdf-parse

Obiettivo:

repository_drive
↓
pdf-parser
↓
offerte_pdf

Stato:

⏳ In sviluppo
## Stato verificato 2026-07-17

repository_drive:
38 record

offerte_pdf:
0 record

offerte_prezzi:
4 record

Parser PDF:
Installato

Libreria:
pdf-parse

Prossimo sviluppo:
workers/pdf-parser.js
## Verifica PDF Parser

Data: 2026-07-17

Libreria installata:

pdf-parse@2.4.5

Esito:

Installazione completata.

Da verificare compatibilità con Cloudflare Workers.

Decisione:

Creare prima un prototipo minimo che:

1. legge un PDF dal Drive
2. estrae il testo
3. stampa il risultato

Solo dopo implementare il parser completo.

## Test pdf-parse

Data: 2026-07-17

Esito:

❌ NON compatibile con Cloudflare Worker

Errore:

No matching export for import "default"

Decisione:

Non utilizzare pdf-parse nel runtime Cloudflare.

Valutare parser PDF esterno oppure funzione server dedicata.

## Verifica PDF Parser

Data: 2026-07-17

### Test eseguito

PDF testato:

47432_SEGNOVERDE_DOM_FIX_SICURA_GAS_726_Q32026.pdf

Risultato:

✅ PDF leggibile correttamente

Tecnologia:

pdf-parse v2.4.5

Utilizzo corretto:

```js
import { PDFParse } from "pdf-parse";

const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
# Milestone 2026-07-17 - PDF Parser V1

## Obiettivo raggiunto

Implementato parser PDF Segnoverde funzionante.

## Test effettuato

PDF:
47432_SEGNOVERDE_DOM_FIX_SICURA_GAS_726_Q32026.pdf

## Risultato

Estrazione corretta dei seguenti campi:

- codice_listino
- codice_offerta
- nome_offerta
- quota_fissa_annua
- prezzo_fisso
- sconto_annuo
- sconto_sdd
- sconto_mail

## Database

Tabella:
offerte_pdf

Inserimento record verificato con successo.

## Dati salvati

- codice_listino: 47432
- nome_offerta: Sicura
- commodity: GAS
- mercato: LIBERO
- tipo_prezzo: FISSO

## Note architetturali

pdf-parse funziona correttamente in Node.js.

Non utilizzare all'interno dei Cloudflare Worker.

Architettura approvata:

Google Drive
↓
repository_drive
↓
pdf-parser (Node)
↓
offerte_pdf
↓
offerte_prezzi

## Prossimo step

Import automatico PDF da repository_drive.
# Milestone PDF Parser V1 (17/07/2026)

## Stato

COMPLETATA ✅

## Obiettivo

Verificare la possibilità di estrarre automaticamente i dati dalle Condizioni Economiche PDF di Segnoverde e salvarli in Supabase.

## Attività completate

- Installazione pdf-parse
- Validazione lettura PDF in ambiente Node.js
- Implementazione parser PDF
- Estrazione campi tramite regex
- Generazione hash SHA256 del file
- Inserimento automatico nella tabella offerte_pdf
- Test completo con PDF Segnoverde

## PDF testato

47432_SEGNOVERDE_DOM_FIX_SICURA_GAS_726_Q32026.pdf

## Dati estratti correttamente

- codice_listino
- codice_offerta
- nome_offerta
- commodity
- mercato
- tipo_prezzo
- prezzo_fisso
- quota_fissa_annua
- sconto_annuo
- sconto_sdd
- sconto_mail

## Output salvato

Tabella:

offerte_pdf

Record inserito con successo.

## Decisioni architetturali

pdf-parse funziona correttamente in Node.js.

Cloudflare Worker non verrà utilizzato per il parsing PDF.

Architettura approvata:

Google Drive
↓
repository_drive
↓
pdf-parser (Node)
↓
offerte_pdf
↓
offerte_prezzi

## Git

Commit:
5679a84

Tag:
pdf-parser-v1

## Prossima milestone

Automazione import PDF dal repository Google Drive.

Flusso previsto:

repository_drive
↓
download automatico PDF
↓
pdf-parser
↓
offerte_pdf

Obiettivo:

eliminare completamente l'utilizzo di PDF locali.

# Milestone PDF Parser V2 (17/07/2026)

## Stato

IN SVILUPPO ⏳

## Obiettivo

Collegare il parser PDF esistente ai documenti presenti in Google Drive tramite repository_drive.

## Attività completate

### Verifica parser esistente

File:

workers/pdf-parser.js

Stato:

✅ individuato

Architettura attuale:

PDF locale
↓
fs.readFileSync()
↓
PDFParse
↓
offerte_pdf

### Verifica accesso Supabase

File:

src/lib/supabase.js

Esito:

✅ connessione funzionante

### Verifica repository_drive

Test eseguito:

select * from repository_drive limit 1

Esito:

✅ lettura corretta

Record verificato:

- google_file_id presente
- nome_file presente
- metadata presenti

PDF test:

47406_SEGNOVERDE_DOM_PUN_PER_NOI_EE_TRIO_726_Q32026.pdf

Google File Id:

1_h7FofpXmr2WEF8JI8puWi-qlDZvmLvj

### Verifica autenticazione Google Drive

Funzione individuata:

getAccessToken()

File:

workers/drive-scanner.js

Esito:

✅ funzione recuperata

Variabili utilizzate:

- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY

### Verifica Cloudflare Secrets

Comando:

npx wrangler secret list

Risultato:

✅ GOOGLE_CLIENT_EMAIL
✅ GOOGLE_PRIVATE_KEY
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_KEY

## Stato attuale del parser

Modifica temporanea applicata:

workers/pdf-parser.js

Inserita lettura repository_drive con:

.select("*")
.limit(1)

Inserito:

return;

subito dopo il test.

Scopo:

evitare esecuzione del parser PDF durante lo sviluppo del collegamento Google Drive.

## Prossimo step

Recuperare le credenziali Google utilizzate dal parser Node e implementare il download del PDF tramite:

repository_drive
↓
google_file_id
↓
Google Drive API
↓
Buffer PDF

Solo dopo:

Buffer PDF
↓
PDFParse
↓
offerte_pdf

### Recupero credenziali Google

Data: 2026-07-17

Service Account identificato:

cloudflare-drive-scanner@energy-compare-hub.iam.gserviceaccount.com

Origine:
Google Cloud Console
→ IAM e amministrazione
→ Account di servizio

Stato:

✅ GOOGLE_CLIENT_EMAIL identificato

Variabile Cloudflare:

GOOGLE_CLIENT_EMAIL

### Recupero credenziali Google completato

Data: 2026-07-17

Service Account:

cloudflare-drive-scanner@energy-compare-hub.iam.gserviceaccount.com

Chiave privata:

private-key.pem

Formato verificato:

-----BEGIN PRIVATE KEY-----

Stato:

✅ GOOGLE_CLIENT_EMAIL identificato
✅ GOOGLE_PRIVATE_KEY disponibile
✅ Credenziali sufficienti per autenticazione Google Drive da Node.js
### Verifica dipendenze Node

Data: 2026-07-17

Libreria:

jose@6.2.3

Comando:

npm list jose

Esito:

✅ installata

Utilizzo previsto:

- generazione JWT Google
- autenticazione Service Account
- ottenimento access token Drive

Stato:

✅ prerequisiti completati per download PDF da Google Drive
### Verifica ambiente Node

Data: 2026-07-17

package.json verificato.

Configurazione:

"type": "module"

Dipendenze disponibili:

- jose 6.2.3
- pdf-parse 2.4.5
- @supabase/supabase-js 2.110.4

Esito:

✅ compatibile con import ESM

Stato:

pronto per implementazione autenticazione Google Drive da Node.js
## Milestone PDF Parser V2 - Google Authentication

Data: 2026-07-17

Stato:

COMPLETATA ✅

Attività:

- Recuperato GOOGLE_CLIENT_EMAIL
- Recuperata chiave privata Service Account
- Portata funzione getAccessToken() da Cloudflare a Node.js
- Generato JWT Google
- Ottenuto access_token valido

Service Account:

cloudflare-drive-scanner@energy-compare-hub.iam.gserviceaccount.com

Test eseguito:

node workers/pdf-parser.js

Risultato:

✅ access_token ottenuto

Durata token:

3599 secondi

Conclusione:

Il parser Node è ora autenticato verso Google Drive.

Prossimo step:

download PDF tramite google_file_id.
## Milestone PDF Parser V2 - Download Google Drive

Data: 2026-07-17

Stato:

COMPLETATA ✅

Attività completate:

- lettura repository_drive
- recupero google_file_id
- autenticazione Google Service Account
- generazione access token
- download PDF da Google Drive

PDF testato:

47406_SEGNOVERDE_DOM_PUN_PER_NOI_EE_TRIO_726_Q32026.pdf

Google File ID:

1_h7FofpXmr2WEF8JI8puWi-qlDZvmLvj

Risultato:

DOWNLOAD STATUS: 200

Dimensione PDF:

771940 byte

Conclusione:

Il parser Node è in grado di scaricare direttamente i PDF da Google Drive senza utilizzare file locali.

Pipeline verificata:

repository_drive
↓
google_file_id
↓
Google Drive API
↓
PDF Buffer
## Milestone PDF Parser V2 - Parsing PDF da Google Drive

Data: 2026-07-17

Stato:

COMPLETATA ✅

Attività:

- download PDF da Google Drive
- conversione in Buffer
- parsing PDF tramite PDFParse
- estrazione testo

PDF testato:

47406_SEGNOVERDE_DOM_PUN_PER_NOI_EE_TRIO_726_Q32026.pdf

Risultati:

DOWNLOAD STATUS: 200

PDF BUFFER SIZE:
771940

LUNGHEZZA TESTO:
28433

Campi verificati nel testo:

✅ CODICE LISTINO
✅ CODICE OFFERTA
✅ Prodotto Partner
✅ CLIENTE DOMESTICO
✅ OFFERTA A PREZZO VARIABILE

Conclusione:

Non è più necessario utilizzare file PDF locali.

Pipeline validata:

Google Drive
↓
repository_drive
↓
google_file_id
↓
download PDF
↓
PDFParse
↓
testo PDF

## Milestone PDF Parser V2 - Estrazione dati da PDF Drive

Data: 2026-07-17

Stato:

COMPLETATA ✅

Attività:

- download PDF da Google Drive
- parsing PDF tramite PDFParse
- estrazione dati tramite regex

PDF:

47406_SEGNOVERDE_DOM_PUN_PER_NOI_EE_TRIO_726_Q32026.pdf

Dati estratti:

- codiceListino
- codiceOfferta
- prodotto
- clienteDomestico
- prezzoVariabile
- prezzoFisso

Output:

{
  "codiceListino": "47406",
  "codiceOfferta": "000453ENVFL01XX47406PERXNOIXXSEV",
  "prodotto": "PER NOI",
  "clienteDomestico": true,
  "prezzoVariabile": true,
  "prezzoFisso": false
}

Conclusione:

Il parser è in grado di leggere un PDF direttamente da Google Drive ed estrarre informazioni strutturate senza utilizzare file locali.
## Milestone PDF Parser V2 - Offerta normalizzata

Data: 2026-07-17

Stato:

COMPLETATA ✅

Risultato:

Primo PDF Google Drive convertito in struttura dati compatibile con offerte_pdf.

Valori verificati:

- codice_listino
- codice_offerta
- nome_offerta
- commodity
- tipologia_cliente
- mercato
- tipo_prezzo
- indice_riferimento
- spread
- quota_fissa_annua

Output:

spread = 0.0077
quota_fissa_annua = 69

Conclusione:

La pipeline Google Drive → PDF → Dati Strutturati è funzionante.

## Milestone PDF Parser V2 - Primo inserimento automatico

Data: 2026-07-17

Stato:

COMPLETATA ✅

Pipeline validata:

Google Drive
↓
Download PDF
↓
PDFParse
↓
Regex
↓
Normalizzazione
↓
offerte_pdf

Risultato:

Record creato con id = 5

Offerta:

PER NOI

Codice listino:

47406

Codice offerta:

000453ENVFL01XX47406PERXNOIXXSEV

Commodity:

EE

Tipo prezzo:

VARIABILE

Indice:

PUN

Spread:

0.0077 €/kWh

Quota fissa annua:

69 €/POD/Anno

Conclusione:

La catena end-to-end è operativa.

# Milestone PDF Parser V2

Data: 2026-07-17

## Obiettivo

Importare automaticamente le offerte commerciali partendo dai PDF presenti su Google Drive.

## Stato

COMPLETATA ✅

## Pipeline realizzata

repository_drive
↓
Google Drive API
↓
Download PDF
↓
PDFParse
↓
Estrazione dati
↓
Normalizzazione
↓
SHA256
↓
UPSERT offerte_pdf

## Risultati ottenuti

- Autenticazione Google Service Account
- Download PDF da Google Drive
- Parsing automatico PDF
- Estrazione campi principali
- Calcolo hash SHA256
- Gestione duplicati tramite upsert
- Import batch di tutti i PDF presenti nel repository
- Normalizzazione offerte
- Classificazione linea_prodotto
- Correzione indice_riferimento EE/GAS

## Dati caricati

Totale PDF repository_drive:

38

Importati:

37

Errore residuo:

1 PDF con errore Google Drive 500

## Classificazione linea_prodotto

- AGILE FLEX
- AGILE PREMIUM
- CONDOMINIO GREEN PLUS
- IMPRESA VERDE SMALL
- OFFERTA SECONDA CASA
- PER NOI
- SEGNO-V GAS
- SEGNO-V GAS FIX
- SEGNO-V GAS RELAX
- SEGNO-V LUCE
- SEGNO-V LUCE FIX
- SICURA
- SMART
- SMART TEMP

## Correzioni effettuate

### AGILE FLEX

47411
47464

### AGILE PREMIUM

47410
47463

### Indice riferimento

Regola adottata:

EE → PUN

GAS → PSV

Verifica finale:

EE  → PUN → 14 record

GAS → PSV → 23 record

## Stato tabella offerte_pdf

Campi popolati:

- codice_listino
- codice_offerta
- nome_offerta
- linea_prodotto
- commodity
- tipologia_cliente
- mercato
- tipo_prezzo
- indice_riferimento
- spread
- quota_fissa_annua
- hash_file
- metadata

## Attività successive

1. Estrazione prezzo_fisso
2. Miglioramento estrazione spread
3. Estrazione sconto_annuo
4. Estrazione sconto_sdd
5. Estrazione sconto_mail
6. Estrazione validita_dal
7. Estrazione validita_al

## Conclusione

Parser V2 operativo end-to-end.

L'infrastruttura di acquisizione PDF da Google Drive, parsing e caricamento su offerte_pdf è completata e funzionante.
# Parser PDF V2 - STABILE

Data: 17/07/2026

## Stato

COMPLETATO ✅

## Risultati

PDF TROVATI: 38
IMPORTATI: 38
ERRORI: 0

## Funzionalità

- Download PDF da Google Drive
- Parsing PDF automatico
- SHA256 hash
- UPSERT Supabase
- Gestione duplicati
- Classificazione offerte
- Classificazione linea_prodotto
- Correzione indice riferimento
  - EE -> PUN
  - GAS -> PSV

## Dati estratti

- codice_listino
- codice_offerta
- nome_offerta
- commodity
- tipologia_cliente
- tipo_prezzo
- indice_riferimento
- spread
- prezzo_fisso
- quota_fissa_annua
- metadata

## Prezzi fissi rilevati

SICURA EE
0.1463 €/kWh

SICURA GAS
0.4690 €/Smc

SEGNO-V GAS FIX
0.5200 €/Smc

SEGNO-V GAS RELAX
0.5300 €/Smc

SMART FIX GAS
0.5530 €/Smc

## KPI

38 PDF importati
0 errori

Parser V2 Stable ✅
Database ✅
Supabase ✅
Cloudflare ✅

Prossimo step:
Frontend + Dashboard

# Roadmap Evolutiva

## Visione del Progetto

Energy Compare Hub non è un semplice comparatore di offerte energetiche.

L'obiettivo è sviluppare una piattaforma in grado di:

- confrontare automaticamente le offerte del mercato
- analizzare bollette e contratti esistenti
- analizzare proposte di rinnovo commerciale
- stimare il risparmio ottenibile
- suggerire le alternative più convenienti

---

# Tipologie Cliente Supportate

## Cliente Domestico

Funzionalità previste:

- caricamento bolletta luce
- caricamento bolletta gas
- caricamento proposta di rinnovo
- simulazione tramite consumi manuali

## Cliente Business

Funzionalità previste:

- analisi bollette business
- confronto offerte dedicate
- valutazione rinnovi commerciali
- gestione multisito

## Condomini

Funzionalità previste:

- confronto offerte condominiali
- analisi proposta di rinnovo
- monitoraggio costi energetici

---

# Analisi Bolletta

## Input

Upload PDF:

```text
bolletta_luce.pdf
bolletta_gas.pdf

# Regole Commerciali e Canali di Vendita

## Obiettivo

Non tutte le offerte presenti nel database possono essere proposte a tutti i clienti.

Prima di generare una classifica o una raccomandazione, il sistema deve applicare le regole di visibilità commerciale.

---

# Classificazione Offerte

## Offerte Standard

Offerte liberamente vendibili dai dealer.

Caratteristiche:

- disponibili al pubblico
- generano gettone dealer
- possono essere mostrate a tutti i clienti compatibili

Esempio:

```text
Sicura
Agile Flex
Agile Premium
Smart
Smart Temp
Impresa Verde
Segno-V
``