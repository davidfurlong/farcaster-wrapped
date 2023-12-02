"use client";

import React, { useCallback, useEffect, useState } from "react";
import NextImage, { ImageProps } from "next/image";

const avatarVariants = [48, 96, 144];

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
  return `https://www.discove.xyz/api/img?w=${width}${
    format === "png" || format === "jpg" ? `&f=${format}` : ""
  }&h=${height}&t=${fit}&p=${position}&i=${encodeURIComponent(src)}`;
}

export function Image(
  props: {
    src: string | null | undefined;
    type: "profile" | "cast";
    proxySupportInOrder: Array<"cloudflare" | "next-img-proxy">;
  } & Omit<ImageProps, "src">
) {
  const [didError, setDidError] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    props.src || "https://explorer.farcaster.xyz/avatar.png"
  );

  useEffect(() => {
    if (imgSrc !== (props.src || "https://explorer.farcaster.xyz/avatar.png"))
      setImgSrc(props.src || "https://explorer.farcaster.xyz/avatar.png");
  }, [props.src]);

  const imageProxyLoader = useCallback(
    ({ src, width }: { src: string; width: number }): string => {
      if (props.proxySupportInOrder.length === 0) {
        return src;
      }
      if (src?.endsWith(".gif")) return src;
      if (didError && src?.endsWith(".svg"))
        return "https://explorer.farcaster.xyz/avatar.png";
      if (src?.endsWith(".svg")) return src;

      function getNextImgProxyUrl() {
        return getImageProxyUrl({
          origin: "https://www.discove.xyz",
          src: imgSrc,
          width,
          position: props.type === "profile" ? "center" : "top",
          height: width,
          fit: props.type === "profile" ? "cover" : "inside",
        });
      }
      function getCloudflareProxyUrl() {
        // Cloudflare Images
        let variant_name = `w=${width}${
          props.type === "profile" ? `&h=${width}` : ""
        }`;
        if (props.type === "cast") {
          if (width <= 700) variant_name = `700w`;
        }
        if (props.type === "profile" && avatarVariants.includes(width)) {
          variant_name = `${width}px`;
        }

        // Cloudflare url, should be used only for user profile images and cast images.
        return `https://imagedelivery.net/2KbgqsJLiCfu7ZrZTOYI5w/${encodeURIComponent(
          encodeURIComponent(src)
        )}/${variant_name}`;
      }

      if (!didError) {
        // use first choice proxy
        if (props.proxySupportInOrder[0] === "cloudflare")
          return getCloudflareProxyUrl();
        else if (props.proxySupportInOrder[0] === "next-img-proxy")
          return getNextImgProxyUrl();
      } else {
        // use second choice proxy
        if (props.proxySupportInOrder.length > 1) {
          if (props.proxySupportInOrder[1] === "cloudflare")
            return getCloudflareProxyUrl();
          else if (props.proxySupportInOrder[1] === "next-img-proxy")
            return getNextImgProxyUrl();
        } else {
          // use raw src.
          return imgSrc;
        }
      }

      return imgSrc;
    },
    [props.type, didError, imgSrc]
  );

  const { type, proxySupportInOrder, ...domProps } = props;

  return (
    <NextImage
      loader={imageProxyLoader}
      // onErrorCapture={}
      onError={(e) => {
        if (!didError) setDidError(true);
      }}
      {...domProps}
      style={{
        ...(props.style || {}),
        ...(props.src?.endsWith(".gif")
          ? {
              background: "black",
              width: "100%",
            }
          : {}),
      }}
      src={imgSrc}
    />
  );
}
