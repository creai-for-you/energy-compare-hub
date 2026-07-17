# Energy Compare Hub

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