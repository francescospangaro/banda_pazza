import { z } from "zod";

export namespace Post {
  export const RequestValidator = z.object({
    docenteId: z.number(),
  });
  export const ResponseValidator = z.void();
}
