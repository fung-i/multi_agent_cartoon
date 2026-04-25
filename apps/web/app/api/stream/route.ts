import { runDebate } from "@theatre/orchestrator";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic")?.trim();
  if (!topic) {
    return new Response("Missing `topic` query parameter", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      };

      try {
        for await (const event of runDebate(topic)) {
          write(`data: ${JSON.stringify(event)}\n\n`);
        }
        write("event: done\ndata: {}\n\n");
      } catch (err) {
        const message = (err as Error).message ?? "unknown error";
        write(
          `event: error\ndata: ${JSON.stringify({ message })}\n\n`,
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
