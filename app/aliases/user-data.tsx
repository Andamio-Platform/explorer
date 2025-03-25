"use client";

import "dotenv/config";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";

export function UserData({
  isOpen,
  alias,
}: {
  isOpen: boolean;
  alias: string;
}) {
  const [info, setInfo] = useState<string>("");
  const [userData, setUserData] = useState<string>("{}");
  const [loading, setLoading] = useState<boolean>(false); // ✅ Loading state

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true); // ✅ Start loading
        try {
          const response = await fetch(`/api/user-data?alias=${alias}`);
          const data = await response.json();
          setInfo(data.data.info);
          setUserData(JSON.stringify(data.data.data));
        } catch (error) {
          console.error("❌ Error fetching data:", error);
          setInfo("Error fetching data.");
          setUserData("{}");
        } finally {
          setLoading(false); // ✅ Stop loading
        }
      };

      fetchData();
    } else {
      setInfo("");
      setUserData("{}");
    }
  }, [isOpen, alias]);

  return (
    <DrawerContent>
      <div className="max-h-[80vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>User Info</DrawerTitle>
          {loading ? (
            <DrawerDescription>Loading user info...</DrawerDescription>
          ) : (
            <DrawerDescription>{info}</DrawerDescription>
          )}
          <DrawerTitle>User Data</DrawerTitle>
          <DrawerDescription>
            {loading ? (
              <span className="text-sm text-gray-500">Loading data...</span>
            ) : (
              <span className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words">
                {JSON.stringify(JSON.parse(userData), null, 6)}
              </span>
            )}
          </DrawerDescription>
        </DrawerHeader>
      </div>
      <DrawerFooter>
        <DrawerClose>Close</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
}
