"use client";

import { useEffect, useState } from "react";
import { Calendar, Info } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommitsChartProps {
  username: string;
}

interface CommitData {
  date: string;
  count: number;
}

export function CommitsChart({ username }: CommitsChartProps) {
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/events/public`
        );
        if (!res.ok) throw new Error("Could not fetch commit data");

        const events = await res.json();

        const data: Record<string, number> = {};

        events
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((e: any) => e.type === "PushEvent")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .forEach((e: any) => {
            const date = e.created_at.split("T")[0];
            data[date] = (data[date] || 0) + (e.payload.commits?.length || 0);
          });

        const formatted = Object.entries(data)
          .map(([date, count]) => ({ date, count }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(-15);

        setCommitData(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [username]);

  const maxCommits = Math.max(...commitData.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            Commit Activity
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">
                  Based on recent public GitHub activity (limited by GitHub
                  API).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Recent commits by {username}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : commitData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent commit activity
            </p>
          ) : (
            commitData.map((data) => (
              <div key={data.date} className="flex items-center gap-4">
                <span className="w-24 text-sm text-muted-foreground">
                  {new Date(data.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-muted rounded h-4">
                  <div
                    className="bg-primary h-4 rounded"
                    style={{ width: `${(data.count / maxCommits) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {data.count}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
