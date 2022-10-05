export type LezioneToGenerate = {
  alunniIds: number[],
  docenteId: number,
  orario: Date,
  durataInMin: number,
}

export type OverlapError = {
  type: "overlap",
  count: number,
  first: {
    docenteId: number,
    orarioDiInizio: Date,
    orarioDiFine: Date,
  },
}

export function isOverlapError(err: any): err is OverlapError {
  return err && (err as OverlapError).type === "overlap";
}

export namespace Post {
  export type Request = LezioneToGenerate[];
  export type Response = {err: OverlapError} | void;
}

export namespace Delete {
  export type Request = number[];
  export type Response = void;
}
