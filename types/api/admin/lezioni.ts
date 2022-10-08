import {z} from "zod";
import {LibrettoValidator} from "@/types/api/lezioni";
import {DateOrStringValidator} from "@/types/zod";

export const LezioneValidator = z.object({
  id: z.number(),
  alunni: z.object({
    id: z.number(),
    nome: z.string(),
    cognome: z.string(),
  }).array(),
  docente: z.object({
    id: z.number(),
    nome: z.string(),
    cognome: z.string(),
  }),
  orarioDiInizio: DateOrStringValidator,
  orarioDiFine: DateOrStringValidator,
  libretto: LibrettoValidator.optional(),
  recuperataDa: z.object({id: z.number(), orarioDiInizio: DateOrStringValidator, orarioDiFine: DateOrStringValidator}).optional(),
  recuperoDi: z.object({id: z.number(), orarioDiInizio: DateOrStringValidator, orarioDiFine: DateOrStringValidator}).optional(),
});
export type Lezione = z.infer<typeof LezioneValidator>;

export const LezioneFilterValidator = z.object({
  docente: z.object({
    nome: z.string().optional(),
    cognome: z.string().optional(),
  }),
  alunno: z.object({
    nome: z.string().optional(),
    cognome: z.string().optional(),
  }),
  startDate: DateOrStringValidator,
  endDate: DateOrStringValidator.optional().nullable(),
});
export type LezioneFilter = z.infer<typeof LezioneFilterValidator>;

export namespace Post {
  export const RequestValidator = LezioneFilterValidator.merge(z.object({
    pageOnly: z.boolean().optional(),
    page: z.number().int(),
  }));
  export const ResponseValidator = z.object({
    pageCount: z.number().int(),
    pageSize: z.number().int(),
    lezioni: LezioneValidator.array(),
  });
}
