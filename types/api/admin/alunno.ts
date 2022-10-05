import {z} from "zod"

export const AlunnoToGenerateValidator = z.object({
  nome: z.string(),
  cognome: z.string(),
  email: z.string(),
  cf: z.string(),
  docenteId: z.number(),
});
export type AlunnoToGenerate = z.infer<typeof AlunnoToGenerateValidator>

export const AlunnoValidator = z.object({
  id: z.number(),
  nome: z.string(),
  cognome: z.string(),
  email: z.string(),
  cf: z.string(),
  docenteId: z.number(),
});
export type Alunno = z.infer<typeof AlunnoValidator>

export namespace Get {
  export const ResponseValidator = z.array(AlunnoValidator);
}

export namespace Post {
  export const RequestValidator = AlunnoToGenerateValidator;
  export const ResponseValidator = AlunnoValidator;
}

export namespace Put {
  export const RequestValidator = AlunnoValidator.partial()
    .omit({id: true})
    .merge(z.object({ id: z.number() }));
  export const ResponseValidator = AlunnoValidator;
}
