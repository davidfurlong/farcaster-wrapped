export function getImageProxyUrl({
  src,
  width,
  height,
  format,
  position,
  fit,
  // ${process.env.NEXT_PUBLIC_ORIGIN}
  origin,
}: {
  src: string;
  width: number;
  format?: null | "png" | "jpg";
  height: number;
  position: "top" | "center";
  fit: "cover" | "inside";
  origin: string;
}) {
  // keep url short
  return `${origin}/api/img?w=${width}${
    format === "png" || format === "jpg" ? `&f=${format}` : ""
  }&h=${height}&t=${fit}&p=${position}&i=${encodeURIComponent(src)}`;
}
