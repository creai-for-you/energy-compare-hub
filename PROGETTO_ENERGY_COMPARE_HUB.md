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