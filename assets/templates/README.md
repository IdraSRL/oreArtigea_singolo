# Template Excel

Questa cartella contiene i template Excel utilizzati per l'esportazione dei dati.

## File richiesti:

- `template_ore.xlsx` - Template principale per l'esportazione delle ore dipendenti

## Struttura template consigliata:

Il template dovrebbe contenere:
1. **Cella Nome Dipendente**: Una cella con etichetta "Nome" o "Dipendente" 
2. **Cella Periodo**: Una cella con etichetta "Mese" o "Periodo"
3. **Tabella Giorni**: 
   - Intestazioni per i giorni del mese (1, 2, 3, ...)
   - Colonne per "Ferie", "Malattia", "Ore"
   - Righe per ogni giorno del mese
4. **Celle Totali**: Per i totali delle ore lavorate

## Note:
- Il sistema cercherà automaticamente le celle chiave usando pattern di testo
- La formattazione originale del template verrà mantenuta
- Se il template non viene trovato, il sistema userà un'esportazione semplificata