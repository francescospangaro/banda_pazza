import { Libretto } from "@/types/api/lezioni";

export type Lezione = {
  id: number,
  alunni: {
    id: number,
    nome: string,
    cognome: string,
  }[],
  docente: {
    id: number,
    nome: string,
    cognome: string,
  },
  orarioDiInizio: Date,
  orarioDiFine: Date,
  libretto?: Libretto | null,
  recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
  recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
}

export namespace Post {
  export type Request = {
    docente: {
      nome?: string,
      cognome?: string,
    },
    alunno: {
      nome?: string,
      cognome?: string,
    },
    startDate: Date,
    endDate?: Date
  };
  export type Response = Lezione[];
}
