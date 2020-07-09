import { Configuration, StereoClient } from "./library";
import { PrismaClient } from "@prisma/client";

(global as any).prisma = new PrismaClient();
(global as any).config = Configuration.getInstance();

import "./library/extensions/StereoMessage";
import "./library/extensions/StereoMember";
import "./library/extensions/StereoPlayer";
import "./library/classes/general/Formatter";

const bot = new StereoClient({
  owners: config.get("bot.owners"),
  token: config.get("bot.tokens.discord"),
  builtDirectory: "dist",
});

(async () => {
  await prisma.connect().catch((err) => bot.logger.error(err));

  await bot.start().catch((err) => bot.logger.error(err));
})();
