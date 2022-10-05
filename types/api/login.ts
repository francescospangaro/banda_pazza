import {z} from "zod";
import {UserValidator} from "@/types/api/user";

export namespace Post {
  export const RequestValidator = z.object({email: z.string(), password: z.string()});
  export const ResponseValidator = UserValidator;
}
