export type DocenteToGenerate = {
  nome: string,
  cognome: string,
  email: string,
  cf: string,
  password: string,
}

export type Docente = {
  id: number,
  nome: string,
  cognome: string,
  email: string,
  cf: string,
}

export namespace Get {
  export type Request = void;
  export type Response = Docente[];
}

export namespace Post {
  export type Request = DocenteToGenerate;
  export type Response = Docente;
}

export namespace Put {
  export type Request = Partial<Docente & { password: string }> & {id: number};
  export type Response = Docente;
}
