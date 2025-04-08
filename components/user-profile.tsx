"use client";

import { useEffect, useState } from "react";
import { Calendar, ExternalLink, GitFork, Star } from "lucide-react";
import { Badge } from "./ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui//avatar";

import { CommitsChart } from "@/components/commits-chart";

interface UserProfileProps {
  username: string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface UserData {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

export function UserProfile({
  username,
  setIsLoading,
  setError,
}: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadingRepos(true);

        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok)
          throw new Error(
            userRes.status === 404
              ? `User '${username}' not found`
              : "Failed to fetch user"
          );

        const user = await userRes.json();
        setUserData(user);

        const repoRes = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
        );
        if (!repoRes.ok) throw new Error("Failed to fetch repositories");

        const repos = await repoRes.json();
        setRepositories(repos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
        setLoadingRepos(false);
      }
    };

    fetchData();
  }, [username, setIsLoading, setError]);

  return (
    <div className="mt-6 space-y-6">
      {userData ? (
        <Card>
          <CardHeader className="flex gap-4 items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback>
                {userData.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{userData.name || userData.login}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-sm">
                <a
                  href={userData.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  @{userData.login} <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
              {userData.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.bio}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap text-sm">
                <Badge variant="secondary">{userData.public_repos} Repos</Badge>
                <Badge variant="secondary">
                  {userData.followers} Followers
                </Badge>
                <Badge variant="secondary">
                  {userData.following} Following
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Skeleton className="h-32 rounded-md w-full" />
      )}

      <Tabs defaultValue="repositories">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories">
          {loadingRepos ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
              ))}
            </div>
          ) : repositories.length ? (
            <div className="space-y-4">
              {repositories.map((repo) => (
                <Card key={repo.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        {repo.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardTitle>
                    {repo.description && (
                      <CardDescription>{repo.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 text-sm">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {repo.forks_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center text-muted-foreground py-4">
                No repositories found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          {userData && <CommitsChart username={username} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
