import { z } from "zod";
import { LibrettoValidator } from "@/types/api/lezioni";
import {DateOrStringValidator} from "@/types/zod";

export const AlunnoValidator = z.object({
  oreTotali: z.number(),
  oreFatte: z.number(),
  oreMancanti: z.number(),
  lezioni: z.object({ data: DateOrStringValidator, risultato: LibrettoValidator.nullable(), recuperata: z.boolean() }).array(),
});
export type Alunno = z.infer<typeof AlunnoValidator>;

export namespace Post {
  export const ResponseValidator = AlunnoValidator;
  export const RequestValidator = z.object({
    id: z.number(),
  });
}
