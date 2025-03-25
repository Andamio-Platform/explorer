import 'dotenv/config';

import AndamioSDK from "@andamiojs/sdk";
import { NextRequest } from "next/server";

// const sdk = new AndamioSDK(
//   "https://preprod.utxorpc-v0.demeter.run:443", 
//   "Preprod", 
//   "dmtr_utxorpc15dnupstcsym5xjd7yha0eccta5x6s353"
// );

const sdk = new AndamioSDK("https://mainnet.utxorpc-v0.demeter.run:443", "Mainnet", process.env.DMTR_API_KEY);


export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`));
      
      try {
        // Get initial data
        const initialUtxos = await sdk.provider.core.network.instance.getUtxos();
        controller.enqueue(
          encoder.encode(`event: initial\ndata: ${JSON.stringify({ 
            count: initialUtxos.length,
            timestamp: Date.now()
          })}\n\n`)
        );

        // Flag to track if a request is in progress
        let requestInProgress = false;

        // Set up interval for updates
        const interval = setInterval(async () => {
          // Skip if previous request is still running
          if (requestInProgress) return;

          try {
            requestInProgress = true;
            const instances = await sdk.provider.network.getAllInstancesList();
            controller.enqueue(
              encoder.encode(`event: update\ndata: ${JSON.stringify({ 
                count: instances.courses.length + instances.projects.length,
                timestamp: Date.now()
              })}\n\n`)
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`)
            );
          } finally {
            requestInProgress = false;
          }
        }, 5000);

        // Clean up on client disconnect
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`)
        );
        controller.close();
      }
    }
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
