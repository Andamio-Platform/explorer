"use client";

import { DataTable } from "@/components/data-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { columns } from "./columns";

interface SSEMessage {
  message: string;
  timestamp: number;
  [key: string]: any;
}

export default function Aliases() {
  const [message, setMessage] = useState<SSEMessage | undefined>(undefined);
  const [status, setStatus] = useState<string>("Disconnected");

  useEffect(() => {
    const eventSource = new EventSource("/api/instances");

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
          Total Courses:
          {message?.["instances"] ? message["instances"].courses.length : "N/A"}
        </div>
        <div className="text-sm font-bold">
          Total Projects:
          {message?.["instances"]
            ? message["instances"].projects.length
            : "N/A"}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">Courses</h2>
            <DataTable
              columns={columns}
              data={
                message && message["instances"]
                  ? message["instances"].courses.map(
                      (policy: string, index: number) => ({
                        id: index + 1,
                        policy: policy,
                      })
                    )
                  : []
              }
            />
          </div>
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <DataTable
              columns={columns}
              data={
                message && message["instances"]
                  ? message["instances"].projects.map(
                      (policy: string, index: number) => ({
                        id: index + 1,
                        policy: policy,
                      })
                    )
                  : []
              }
            />
          </div>
        </div>
        {/* <Table>
          <TableCaption>A list of your recent aliases.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Alias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {message &&
              message["instances"]?.courses.map((alias: string) => (
                <TableRow key={alias}>
                  <TableCell className="font-medium">{alias}</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>API</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Table>
          <TableCaption>A list of your recent aliases.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Alias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {message &&
              message["instances"]?.projects.map((alias: string) => (
                <TableRow key={alias}>
                  <TableCell className="font-medium">{alias}</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>API</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table> */}
      </main>
    </div>
  );
}
