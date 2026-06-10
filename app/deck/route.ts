import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "Final_Deck.pdf");
  const fileBuffer = await fs.readFile(filePath);

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=Final_Deck.pdf",
    },
  });
}
