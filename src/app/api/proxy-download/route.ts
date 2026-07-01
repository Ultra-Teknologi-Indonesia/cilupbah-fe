import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Only HTTPS URLs allowed" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return new NextResponse(null, { status: response.status, statusText: response.statusText })
    }

    const headers = new Headers()
    const ct = response.headers.get("content-type")
    if (ct) headers.set("content-type", ct)
    const cd = response.headers.get("content-disposition")
    if (cd) headers.set("content-disposition", cd)
    const cl = response.headers.get("content-length")
    if (cl) headers.set("content-length", cl)

    return new NextResponse(response.body, { status: 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Proxy download error:", url, message)
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 502 })
  }
}
