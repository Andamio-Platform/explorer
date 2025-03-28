"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Alias = {
  id: string;
  alias: string;
};

export const columns: ColumnDef<Alias>[] = [
  {
    accessorKey: "alias",
    header: "Alias",
  },
];
