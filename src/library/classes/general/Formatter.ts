import {
  Color,
  DefaultFormatter,
  DefaultFormatterColor,
  Logger,
} from "@ayanaware/logger";

Logger.setFormatter(
  new DefaultFormatter({
    colorMap: new Map([
      [DefaultFormatterColor.LOG_TIMESTAMP, Color.GRAY],
      [DefaultFormatterColor.LOG_PACKAGE_PATH, Color.BLUE],
      [DefaultFormatterColor.LOG_PACKAGE_NAME, Color.MAGENTA],
      [DefaultFormatterColor.LOG_UNIQUE_MARKER, Color.GRAY],
    ]),
    dateFormat: "hh:mm:ss YYYY/MM/DD",
  })
);
