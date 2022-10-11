import { z } from "zod";

export const UserValidator = z.object({
  email: z.string(),
  id: z.number(),
  admin: z.boolean(),
  isLoggedIn: z.boolean(),
  oreRecuperare: z.number(),
});
export type User = z.infer<typeof UserValidator>;

export namespace Get {
  export const ResponseValidator = UserValidator;
}
