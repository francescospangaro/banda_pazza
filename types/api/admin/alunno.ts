export type AlunnoToGenerate = {
  nome: string,
  cognome: string,
  email: string,
  cf: string,
  docenteId: number,
}

export type Alunno = {
  id: number,
  nome: string,
  cognome: string,
  email: string,
  cf: string,
  docenteId: number,
}

export namespace Get {
  export type Request = void;
  export type Response = Alunno[];
}

export namespace Post {
  export type Request = AlunnoToGenerate;
  export type Response = Alunno;
}

export namespace Put {
  export type Request = Partial<Alunno> & {id: number};
  export type Response = Alunno;
}
