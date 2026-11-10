import { getAllResearch } from "@/lib/content/research";
import { toSearchEntry } from "@/lib/search";

/**
 * The search dialog's index: research metadata only, newest first. It reads
 * nothing but cached content, so Cache Components prerenders it as a static
 * file.
 */
export async function GET() {
  const research = await getAllResearch();
  return Response.json(research.map(toSearchEntry));
}
