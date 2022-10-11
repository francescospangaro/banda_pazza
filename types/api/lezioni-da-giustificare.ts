import { z } from "zod";
import { LezioneValidator } from "@/types/api/lezioni";
import { OverlapErrorValidator } from "@/types/api/admin/lezione";
import { DateOrStringValidator } from "@/types/zod";

export const LezioneDiRecuperoValidator = z.object({
  idDaRecuperare: z.number(),
  orarioDiInizio: DateOrStringValidator,
});
export type LezioneDiRecupero = z.infer<typeof LezioneDiRecuperoValidator>;

export namespace Get {
  export const ResponseValidator = LezioneValidator.omit({
    libretto: true,
    recuperataDa: true,
    recuperoDi: true,
  }).array();
}

export namespace Post {
  export const RequestValidator = LezioneDiRecuperoValidator;
  export const ResponseValidator = z.object({
    err: OverlapErrorValidator.optional(),
  });
}
