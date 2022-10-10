import {z} from "zod";
import {LezioneValidator} from "@/types/api/lezioni";
import {OverlapErrorValidator} from "@/types/api/admin/lezione";

export const CompilazioneValidator = z.object({
    idDaCompilare: z.number(),
});
export type LezioneDaCompilare = z.infer<typeof CompilazioneValidator>;

export namespace Get {
    export const ResponseValidator = LezioneValidator.array();
}
