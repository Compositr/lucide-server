import { z } from "zod";

const hexCode = z
  .string()
  .regex(/^([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/g);

export const queryParams = z
  .object({
    size: z.coerce.number().int().min(24).max(512),
    stroke: hexCode,
    background: hexCode,
    background_alpha: z.coerce.number().min(0).max(1),
    stroke_width: z.preprocess(
      (arg) => parseFloat(z.string().parse(arg)),
      z.number().min(0.1).max(4)
    ),
    // check if arg exists (is in object), if yes the user has provided ?discord_compatibility
    discord_compatibility: z.preprocess(() => true, z.boolean()),
  })
  .partial()
  .refine(
    (data) =>
      !(data.background_alpha !== undefined && data.background === undefined),
    {
      message: "background is required when background_alpha is present",
      path: ["background"],
    }
  );

export const iconName = z.string().regex(/^([a-z]-?)+(\.png)?$/g);
