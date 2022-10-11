import {z} from "zod";
import {DateOrStringValidator} from "@/types/zod";

export const LezioneToGenerateValidator = z.object({
  alunniIds: z.number().array(),
  docenteId: z.number(),
  orario: DateOrStringValidator,
  durataInMin: z.number(),
  solfeggio: z.boolean(),
});
export type LezioneToGenerate = z.infer<typeof LezioneToGenerateValidator>;

export const OverlapErrorValidator = z.object({
  type: z.literal("overlap"),
  count: z.number(),
  first: z.object({
    docenteId: z.number(),
    orarioDiInizio: DateOrStringValidator,
    orarioDiFine: DateOrStringValidator,
  }),
});
export type OverlapError = z.infer<typeof OverlapErrorValidator>;

export function isOverlapError(err: any): err is OverlapError {
  return err && (err as OverlapError).type === "overlap";
}

export namespace Post {
  export const RequestValidator = LezioneToGenerateValidator.array();
  export const ResponseValidator = z.object({
    err: OverlapErrorValidator.optional(),
  });
}

export namespace Delete {
  export const RequestValidator = z.number().array();
  export const ResponseValidator = z.void();
}
