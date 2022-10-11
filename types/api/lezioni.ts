import {z} from "zod";
import {DateOrStringValidator} from "@/types/zod";

export const Libretto = {
  PRESENTE: 'PRESENTE',
  ASSENTE_GIUSTIFICATO: 'ASSENTE_GIUSTIFICATO',
  ASSENTE_NON_GIUSTIFICATO: 'ASSENTE_NON_GIUSTIFICATO',
  LEZIONE_SALTATA: 'LEZIONE_SALTATA'
};

export const LibrettoValidator = z.enum([ 'PRESENTE', 'ASSENTE_GIUSTIFICATO', 'ASSENTE_NON_GIUSTIFICATO', 'LEZIONE_SALTATA' ]);
export type Libretto = z.infer<typeof LibrettoValidator>;

export const TipoLezione = {
  NORMALE: 'NORMALE',
  SOLFEGGIO: 'SOLFEGGIO',
  TIPPETE: 'TIPPETE',
  KOALA: 'KOALA'
  //add
};

export const TipoLezioneValidator = z.enum([ 'NORMALE', 'SOLFEGGIO', 'TIPPETE', 'KOALA' ]);
export type TipoLezione = z.infer<typeof TipoLezioneValidator>;


export const LezioneValidator = z.object({
  id: z.number(),
  alunni: z.object({
    nome: z.string(),
    cognome: z.string(),
  }).array(),
  orarioDiInizio: DateOrStringValidator,
  orarioDiFine: DateOrStringValidator,
  libretto: LibrettoValidator.optional(),
  recuperataDa: z.object({id: z.number(), orarioDiInizio: DateOrStringValidator, orarioDiFine: DateOrStringValidator}).optional(),
  recuperoDi: z.object({id: z.number(), orarioDiInizio: DateOrStringValidator, orarioDiFine: DateOrStringValidator}).optional(),
  tipoLezione: TipoLezioneValidator,
});
export type Lezione = z.infer<typeof LezioneValidator>;

export namespace Post {
  export const RequestValidator = z.object({from: DateOrStringValidator, to: DateOrStringValidator});
  export const ResponseValidator = LezioneValidator.array();
}

export namespace Put {
  export const RequestValidator = z.object({id: z.number(), libretto: LibrettoValidator.optional().nullable()});
  export const ResponseValidator = z.void();
}
