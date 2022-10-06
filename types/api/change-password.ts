import {z} from "zod";

export namespace Post {
  export const RequestValidator = z.object({
    oldPassword: z.string(),
    // TODO: check new password requirements
    newPassword: z.string(),
  });
  export const ResponseValidator = z.void();
}
