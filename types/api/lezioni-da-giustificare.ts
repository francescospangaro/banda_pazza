import { Lezione } from "@/types/api/lezioni";
import { OverlapError } from "@/types/api/admin/lezione";

export type LezioneDiRecupero = {
  idDaRecuperare: number,
  orarioDiInizio: Date,
}

export namespace Get {
  export type Request = void
  export type Response = Lezione[]
}

export namespace Post {
  export type Request = LezioneDiRecupero
  export type Response = {err?: OverlapError}
}
