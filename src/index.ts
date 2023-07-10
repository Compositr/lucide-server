import express from "express";
import { iconName, queryParams } from "./zod/query";
import { zodResponse } from "./zod/zod";
import helmet from "helmet";
import sharp from "sharp";
import { hexToRgb } from "./helpers/colours";

const app = express();

app.use(helmet());

app.get("/custom/:icon", async (req, res) => {
  const { icon } = req.params;

  const query = queryParams.safeParse(req.query);

  if (!query.success) return res.status(400).send(zodResponse(query.error));

  const parsedIcon = iconName.safeParse(icon);

  if (!parsedIcon.success)
    return res.status(400).send(zodResponse(parsedIcon.error));

  try {
    const file = await fetch(
      `https://unpkg.com/lucide-static@latest/icons/${icon.replace(
        ".png",
        ""
      )}.svg`
    ).then((f) => f.text());

    const {
      size,
      stroke,
      background,
      stroke_width,
      background_alpha,
      discord_compatibility,
    } = query.data;

    const transformer = sharp(
      Buffer.from(
        file
          .replace('stroke="currentColor"', `stroke="#${stroke ?? "000000"}"`)
          .replace('stroke-width="2"', `stroke-width="${stroke_width ?? "2"}"`)
      )
    )
      .resize(size ?? 64, size ?? 64)
      .png()
      .flatten(
        background
          ? {
              background: {
                alpha: background_alpha,
                ...hexToRgb(background),
              },
            }
          : false
      )
      .extend(
        discord_compatibility
          ? {
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
              background: {
                alpha: 0,
                r: 0,
                b: 0,
                g: 0,
              },
            }
          : {}
      );

    const buffer = await transformer.toBuffer();
    res.status(200).setHeader("Content-Type", "image/png").send(buffer);

    console.log(
      `Processed ${icon} with size ${size}, stroke ${stroke}, background ${background}, discord_compatibility ${
        discord_compatibility ?? "false"
      }`
    );
  } catch (err) {
    console.error(err);
    return res.status(404).send({
      error: "Icon not found",
    });
  }
});

app.listen(1300);
