import { ZodTypeAny } from "zod";

export async function zodFetch<
  RequestValidator extends ZodTypeAny,
  ResultValidator extends ZodTypeAny
>(
  input: URL | string,
  init: Omit<RequestInit, "body"> & {
    body?: {
      value: RequestValidator["_output"];
      validator: RequestValidator;
    };
    responseValidator: ResultValidator;
  }
): Promise<{
  res: Response;
  parser: () => Promise<ResultValidator["_output"]>;
}> {
  const validatedBody = init.body
    ? (() => {
        const raw = init.body.value;
        const parsed = init.body.validator.safeParse(raw);
        if (!parsed.success) {
          console.error(
            "Zod failed to parse request for",
            input,
            ". Request ",
            raw,
            ". Reason",
            parsed.error
          );
          return raw;
        }
        return parsed.data;
      })()
    : undefined;

  const res = await fetch(input, {
    ...init,
    body: JSON.stringify(validatedBody),
    headers: init.body
      ? {
          ...init.headers,
          "Content-Type": "application/json",
        }
      : init.headers,
  });

  return {
    res,
    parser: async (): Promise<ResultValidator["_output"]> => {
      const raw = await res.json();
      const parsed = init.responseValidator.safeParse(raw);
      if (!parsed.success) {
        console.error(
          "Zod failed to parse response for",
          input,
          ". Response ",
          raw,
          ". Reason",
          parsed.error
        );
        return raw;
      }

      return parsed.data;
    },
  };
}
