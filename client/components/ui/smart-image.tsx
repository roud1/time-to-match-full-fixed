"use client"

import NextImage, { type ImageProps } from "next/image"

/**
 * Drop-in for `next/image`. Profile photos served by our own API (`/api/photos/...`, signed-in
 * only) and inline `data:` / `blob:` previews skip the built-in optimizer: it fetches images
 * without the viewer's cookies, so it could only ever get a 401 for them (an empty card).
 */
export default function Image(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : ""
  const direct = src.startsWith("/api/") || src.startsWith("data:") || src.startsWith("blob:")
  return <NextImage {...props} unoptimized={props.unoptimized || direct} />
}
