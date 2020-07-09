import { Structures } from "discord.js";
import { AkairoClient } from "discord-akairo";

export default Structures.extend(
  "Message",
  (Message) =>
    class StereoMessage extends Message {
      public get language() {
        if (!this.guild) return "en-US";
        return (this.client as AkairoClient).db.get(
          this.guild.id,
          "config.language",
          "en-US"
        );
      }

      public get prefix(): string[] {
        if (!this.guild) return config.get("bot.prefix");
        return (this.client as AkairoClient).db.get(
          this.guild.id,
          "config.prefix",
          config.get("bot.prefix")
        );
      }

      public translate(path: string, variables?: Record<string, any>): any {
        const data = (this.client as AkairoClient).languages.get(
          this.language,
          path,
          variables
        );

        return (
          data || `\`${path}\` has not been initialized for ${this.language}`
        );
      }
    }
);
