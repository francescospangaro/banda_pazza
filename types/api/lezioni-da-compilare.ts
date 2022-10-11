import {LezioneValidator} from "@/types/api/lezioni";

export namespace Get {
    export const ResponseValidator = LezioneValidator.omit({
        libretto: true,
        recuperataDa: true,
        recuperoDi: true,
    }).array();
}
