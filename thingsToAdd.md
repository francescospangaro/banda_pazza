docenti:
- vedono dal calendario le lezioni che hanno
- inserire lezioni nei tempi giusti (se ho lezione di 30min alle 15, non posso avere un'altra lezione prima delle 15.30)
- se AG e LS confermano il flag del recupero, deve contare come lezione da pagare
- se ci sono lezioni con flag non recuperate, notifica in basso a dx rossa che li ricorda il giorno che devono recuperare
- per ogni casella non flaggata i++, e cerca nel db finche' non trova tutte le lezioni da recuperare, una volta flaggata la casella, i--; ad i=0, nesssuna lezione da 
recuperare


alunni:
- possono avere lezioni da 30min o 45min (da mettere nel db)

Admin:
- bottone per calcolo conto, quando premuto si gira tutto il db docenti e vede tutte le lezioni da pagare, quindi presente, ANG, AG flaggato e LS flaggata
- quando cliccato conta tutte le lezioni non pagate, ma effettuate (presente, ANG)

lezioni:
- flag di controllo se pagata o meno
- puo' inserire recuperi quando vuole, se in quella data e ora e' gia' presente una lezione dello stesso docente, puo' inserire un recupero se la lezione 
prenotata risulta assente giustificato o non giustificato- aggiungo flag vuoto, cosi' da costringere insegnante a segnare la presenza