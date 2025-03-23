import AndamioSDK from "@andamiojs/sdk";

// app/api/sse/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SSEData {
  message: string;
  timestamp: number;
  [key: string]: any;
}

interface ErrorData {
  error: string;
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Helper function to send SSE messages
      function sendMessage(data: SSEData | ErrorData, eventType: string = 'message'): void {
        const formattedData = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(formattedData));
      }

      // Send initial connection established message
      sendMessage({ message: 'Connection established', timestamp: Date.now() }, 'open');

      try {
        // First async operation
        const firstResult = await fetchDataAsynchronously();
        sendMessage(firstResult);

        // Second async operation
        const secondResult = await processMoreData();
        sendMessage(secondResult);

        // Optional: For continuous updates
        let count = 0;
        const intervalId = setInterval(async () => {
          try {
            if (count >= 5) {
              clearInterval(intervalId);
              controller.close();
              return;
            }
            
            // Perform async operation inside interval
            const data = await getUpdateData(count);
            sendMessage(data, 'update');
            count++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            sendMessage({ error: errorMessage }, 'error');
            clearInterval(intervalId);
            controller.close();
          }
        }, 2000);

        // Handle potential cleanup if request is aborted
        request.signal.addEventListener('abort', () => {
          clearInterval(intervalId);
          controller.close();
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        sendMessage({ error: errorMessage }, 'error');
        controller.close();
      }
    }
  });

  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Example async functions with TypeScript types
async function fetchDataAsynchronously(): Promise<SSEData> {
  const sdk = new AndamioSDK("https://mainnet.utxorpc-v0.demeter.run:443", "Mainnet", "utxorpc1q48kx774238dgf7ats5");
  // const sdk = new AndamioSDK("https://preprod.utxorpc-v0.demeter.run:443", "Preprod", "dmtr_utxorpc15dnupstcsym5xjd7yha0eccta5x6s353");

  const instances = await sdk.provider.core.network.aliasIndex.getUtxos();
  return { 
    message: "Initial data loaded", 
    timestamp: Date.now(),
    count: instances.length
  };
}

async function processMoreData(): Promise<SSEData> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { 
    message: "Secondary data processed", 
    timestamp: Date.now() 
  };
}

async function getUpdateData(iteration: number): Promise<SSEData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    message: `Update ${iteration}`, 
    timestamp: Date.now(),
    iteration 
  };
}