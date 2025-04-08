import { GithubProfileAnalyzer } from "@/components/github-profile-analyzer";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        GitHub Profile Analyzer
      </h1>
      <GithubProfileAnalyzer />
    </main>
  );
}
