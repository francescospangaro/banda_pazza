import { z } from "zod";
import {DateOrStringValidator} from "@/types/zod";

export namespace Post {
  export const RequestValidator = z.object({
    docenteId: z.number(),
    dataInizio: DateOrStringValidator,
    dataFine: DateOrStringValidator,
  });
  export const ResponseValidator = z.void();
}
