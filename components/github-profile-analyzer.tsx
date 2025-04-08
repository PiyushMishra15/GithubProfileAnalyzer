"use client";

import { useState, FormEvent } from "react";
import { Github, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/user-profile";

export function GithubProfileAnalyzer() {
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchedUsername(username);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading || !username.trim()}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Analyze
              </div>
            )}
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="p-4 text-destructive bg-destructive/10">{error}</Card>
      )}

      {searchedUsername && !error && (
        <UserProfile
          username={searchedUsername}
          setIsLoading={setIsLoading}
          setError={setError}
        />
      )}
    </div>
  );
}
