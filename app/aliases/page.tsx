"use client";

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { useEffect, useState } from "react";

interface SSEMessage {
  message: string;
  timestamp: number;
  [key: string]: any;
}

export default function Aliases() {
  const [message, setMessage] = useState<SSEMessage | undefined>(undefined);
  const [status, setStatus] = useState<string>("Disconnected");

  useEffect(() => {
    const eventSource = new EventSource("/api/aliases");

    eventSource.onopen = () => {
      setStatus("Connected");
    };

    eventSource.addEventListener("open", (e: MessageEvent) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        setStatus(`Connected: ${data.message}`);
      }
    });

    eventSource.addEventListener("update", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log(data);
      setMessage(data); // Sets the message but does not immediately update
    });

    eventSource.addEventListener("error", (e: MessageEvent) => {
      const data = e.data ? JSON.parse(e.data) : { error: "Connection error" };
      setStatus(`Error: ${data.error}`);
      eventSource.close();
    });

    return () => {
      eventSource.close();
      setStatus("Disconnected");
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-xl font-bold">Status: {status}</div>
        <div className="text-sm font-bold">
          Last Updated:
          {message?.timestamp
            ? new Date(message.timestamp).toLocaleString()
            : "N/A"}
        </div>
        <div className="text-sm font-bold">
          Total Access Tokens:
          {message?.["aliases"] ? message["aliases"].length : "N/A"}
        </div>
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={
              message && message["aliases"]
                ? message["aliases"].map((alias: string, index: number) => ({
                    id: index + 1,
                    alias: alias,
                  }))
                : []
            }
          />
        </div>
      </main>
    </div>
  );
}
