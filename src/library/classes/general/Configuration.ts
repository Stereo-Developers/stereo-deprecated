import { readFileSync, existsSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";
import Logger from "@ayanaware/logger";
import dotprop from "dot-prop";
import { join } from "path";

type node_env = "production" | "development";
type EnvDependant<T> = Record<node_env, T>;

const logger = Logger.get("Config");

export class Configuration {
  private static _instance: Configuration;

  public parsed: Record<string, any>;
  private readonly nodeEnv = Configuration.determineNodeEnv();
  private readonly path = join(process.cwd(), "config.yml");

  private constructor() {
    this.parse();
  }

  public parse(): void {
    if (!existsSync(this.path)) {
      logger.error("Please create a 'config.yml'");

      return process.exit(1);
    }

    const data = readFileSync(this.path, { encoding: "utf8" });
    this.parsed = parse(data);
  }

  public get<T>(path: string): T {
    return dotprop.get(this.parsed, path);
  }

  public getEnv<T>(path: string): T {
    const found = dotprop.get<EnvDependant<T>>(this.parsed, path);

    return found[this.nodeEnv];
  }

  public set(path: string, value: any): void {
    dotprop.set(this.parsed, path, value);
    writeFileSync(this.path, stringify(this.parsed), {
      encoding: "utf8",
    });

    this.parse();
  }

  public delete(path: string): void {
    dotprop.delete(this.parsed, path);
    writeFileSync(this.path, stringify(this.parsed), {
      encoding: "utf8",
    });

    this.parse();
  }

  public static getInstance(): Configuration {
    if (!Configuration._instance) {
      Configuration._instance = new Configuration();

      return Configuration._instance;
    }

    return Configuration._instance;
  }

  public static determineNodeEnv(): node_env {
    if (process.env.NODE_ENV) return process.env.NODE_ENV as node_env;

    const flag = ["development", "production"].find((f) =>
      process.argv.includes(`--${f}`)
    );
    if (flag) return flag as node_env;

    return "production";
  }
}
