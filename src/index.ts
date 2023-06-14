import express from "express";
import { iconName, queryParams } from "./zod/query";
import { zodResponse } from "./zod/zod";
import fs from "node:fs/promises";
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
    const file = await fs.readFile(
      `${process.env.ICONS_PATH}/${parsedIcon.data.replace(".png", "")}.svg`,
      "utf-8"
    );

    const { size, stroke, background, strokeWidth } = query.data;

    const transformer = sharp(
      Buffer.from(
        file
          .replace('stroke="currentColor"', `stroke="#${stroke ?? "000000"}"`)
          .replace('stroke-width="2"', `stroke-width="${strokeWidth ?? "2"}"`)
      )
    )
      .resize(size ?? 64, size ?? 64)
      .png()
      .flatten(
        background
          ? {
              background: {
                alpha: 1,
                ...hexToRgb(background),
              },
            }
          : false
      );

    const buffer = await transformer.toBuffer();
    res.status(200).setHeader("Content-Type", "image/png").send(buffer);

    console.log(
      `Processed ${icon} with size ${size}, stroke ${stroke}, background ${background}`
    );
  } catch (err) {
    console.error(err);
    return res.status(404).send({
      error: "Icon not found",
    });
  }
});

app.use("/icons", express.static(process.env.ICONS_PATH!));

app.listen(1300);
