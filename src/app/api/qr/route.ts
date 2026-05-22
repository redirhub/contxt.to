import { NextRequest, NextResponse } from "next/server"
import * as QRCode from "qrcode"
import { withRateLimit } from "@/lib/rate-limit"

const MAX_URL_LENGTH = 2048

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per 60 seconds per IP
  const rateLimited = withRateLimit(request, null, { max: 30, windowSeconds: 60 })
  if (rateLimited.status === 429) return rateLimited

  const urlParam = request.nextUrl.searchParams.get("url")

  if (!urlParam || typeof urlParam !== "string") {
    return NextResponse.json({ error: "Missing required query parameter: url" }, { status: 400 })
  }

  const trimmed = urlParam.trim()

  if (trimmed.length === 0) {
    return NextResponse.json({ error: "url query parameter must not be empty" }, { status: 400 })
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return NextResponse.json({ error: "url exceeds maximum length of 2048 characters" }, { status: 400 })
  }

  // Basic URL validation — must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return NextResponse.json({ error: "url must start with http:// or https://" }, { status: 400 })
  }

  let pngBytes: ArrayBuffer
  try {
    const buf = await QRCode.toBuffer(trimmed, {
      type: "png",
      width: 400,
      margin: 2,
      color: {
        dark: "#16163D",
        light: "#FCF9F2",
      },
    })
    pngBytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
  } catch (err) {
    console.error("QR code generation error:", err)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }

  return new Response(pngBytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(pngBytes.byteLength),
      "Cache-Control": "public, max-age=86400, immutable",
    },
  })
}
