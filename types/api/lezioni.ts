export const Libretto = {
  PRESENTE: 'PRESENTE',
  ASSENTE_GIUSTIFICATO: 'ASSENTE_GIUSTIFICATO',
  ASSENTE_NON_GIUSTIFICATO: 'ASSENTE_NON_GIUSTIFICATO',
  LEZIONE_SALTATA: 'LEZIONE_SALTATA'
};

export type Libretto = 'PRESENTE' | 'ASSENTE_GIUSTIFICATO' | 'ASSENTE_NON_GIUSTIFICATO' | 'LEZIONE_SALTATA';
export type Lezione = {
  id: number,
  alunni: {
    nome: string;
    cognome: string;
  }[],
  orarioDiInizio: Date,
  orarioDiFine: Date,
  libretto?: Libretto | null,
  recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
  recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
}

export namespace Post {
  export type Request = {from: Date, to: Date};
  export type Response = Lezione[];
}

export namespace Put {
  export type Request = {id: number, libretto: Libretto}
  export type Response = void;
}
