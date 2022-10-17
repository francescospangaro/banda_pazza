import { z } from "zod";

export const DocenteToGenerateValidator = z.object({
  nome: z.string(),
  cognome: z.string(),
  email: z.string().email(),
  cf: z.string(),
  password: z.string(),
  stipendioOrario: z.number(),
});
export type DocenteToGenerate = z.infer<typeof DocenteToGenerateValidator>;

export const DocenteValidator = z.object({
  id: z.number(),
  nome: z.string(),
  cognome: z.string(),
  email: z.string(),
  cf: z.string(),
  stipendioOrario: z.number(),
});
export type Docente = z.infer<typeof DocenteValidator>;

export namespace Get {
  export const ResponseValidator = DocenteValidator.array();
}

export namespace Post {
  export const RequestValidator = DocenteToGenerateValidator;
  export const ResponseValidator = DocenteValidator;
}

export namespace Put {
  export const RequestValidator = DocenteValidator.merge(
    z.object({ password: z.string() })
  )
    .partial()
    .omit({ id: true })
    .merge(z.object({ id: z.number() }));
  export const ResponseValidator = DocenteValidator;
}
