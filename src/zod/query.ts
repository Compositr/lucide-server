import { z } from "zod";

const hexCode = z
  .string()
  .regex(/^([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/g);

export const queryParams = z
  .object({
    size: z.preprocess(
      (arg) => parseInt(z.string().parse(arg), 10),
      z.number().int().min(24).max(512)
    ),
    stroke: hexCode,
    background: hexCode,
    strokeWidth: z.preprocess(
      (arg) => parseFloat(z.string().parse(arg)),
      z.number().min(0.1).max(4)
    ),
  })
  .partial();

export const iconName = z.string().regex(/^([a-z]-?)+(\.png)?$/g);
