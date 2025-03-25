import 'dotenv/config';

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
                const intervalId = setInterval(async () => {
                    try {
                        // Perform async operation inside interval
                        const data = await getUpdateData();
                        sendMessage(data, 'update');
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        sendMessage({ error: errorMessage }, 'error');
                        // Don't close the connection on error, just log it and continue
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

const sdk = new AndamioSDK("https://mainnet.utxorpc-v0.demeter.run:443", "Mainnet", process.env.DMTR_API_KEY);


async function getUpdateData(): Promise<SSEData> {
    const instances = await sdk.provider.network.getAllInstancesList();
    instances.courses.sort((a, b) => {
        return a.localeCompare(b);
    });
    instances.projects.sort((a, b) => {
        return a.localeCompare(b);
    });
    return {
        message: `Update instances`,
        timestamp: Date.now(),
        instances: instances,
    };
}