import { readdirSync, lstatSync, readFileSync } from "fs";
import { AkairoClient } from "discord-akairo";
import { parse, stringify } from "yaml";
import { Collection } from "discord.js";
import { EventEmitter } from "events";
import dotprop from "dot-prop";
import { join } from "path";

export default class LanguageHandler extends EventEmitter {
  public languages = new Collection<string, string>();
  private parsed: any;

  public constructor(public client: AkairoClient, public dir: string) {
    super();
  }

  public loadAll() {
    for (const file of this.read(this.dir)) {
      this.languages.set(
        file.split("/")[file.split("/").length - 1].split(".")[0],
        `${process.cwd()}/${file}`
      );
    }
  }

  public get(language: string, path: string, vars: Record<string, any> = {}) {
    const lang = this.languages.get(language);

    this.parse(lang);

    let data = dotprop.get(this.parsed, path);
    if (typeof data === "string")
      Object.keys(vars).forEach(
        (key) => (data = (data as string).replace(`{{${key}}}`, vars[key]))
      );

    return data;
  }

  private parse(lang: string) {
    const data = readFileSync(lang, { encoding: "utf8" });
    this.parsed = parse(data);
  }

  private read(dir: string, files = []): string[] {
    for (const file of readdirSync(dir)) {
      const path = join(dir, file);
      if (lstatSync(path).isDirectory()) files.concat(this.read(path, files));
      else files.push(path);
    }
    return files;
  }
}
