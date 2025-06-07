"use client";
import { useState } from "react";
import Image from "next/image";
import Chat from './components/Chat';

interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'problems' | 'chat'>('problems');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedEndDifficulty, setSelectedEndDifficulty] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [randomProblems, setRandomProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDifficulty || !selectedEndDifficulty) {
      alert("Please select both starting and ending difficulty levels.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const tagQuery = tags.length > 0 ? (tags.map(tag => tag.replace(/ /g, "+")).join(";")) : "";
      const response = await fetch(
        `https://codeforces.com/api/problemset.problems?tags=${tagQuery}`
      );

      const data = await response.json();

      if (data.status === "OK") {
        const filteredProblems = data.result.problems.filter(
          (problem: Problem) =>
            problem.rating >= selectedDifficulty &&
            problem.rating <= selectedEndDifficulty
        );

        if (filteredProblems.length > 0) {
          const selectedProblems: Problem[] = [];
          const problemSet = new Set();

          while (
            selectedProblems.length < 5 &&
            problemSet.size < filteredProblems.length
          ) {
            const randomIndex = Math.floor(
              Math.random() * filteredProblems.length
            );
            const randomProblem = filteredProblems[randomIndex];

            if (!problemSet.has(randomIndex)) {
              selectedProblems.push(randomProblem);
              problemSet.add(randomIndex);
            }
          }

          setRandomProblems(selectedProblems);
        } else {
          alert("No problems found for the selected difficulty range.");
        }
      } else {
        setError("Failed to fetch problems data");
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      setError("There was an error fetching the problems.");
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    isEndRange = false
  ) => {
    const value = parseInt(event.target.value, 10);
    isEndRange ? setSelectedEndDifficulty(value) : setSelectedDifficulty(value);
  };

  const handleTagToggle = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    const changedOption = selectedOptions.find(option => !tags.includes(option)) || 
                         tags.find(tag => !selectedOptions.includes(tag));    
    if (changedOption) {
      setTags(currentTags => {
        if (currentTags.includes(changedOption)) {
          return currentTags.filter(t => t !== changedOption);
        } else {
          return [...currentTags, changedOption];
        }
      });
    }
    event.preventDefault();
  };

  const getProblemColorByRating = (rating: number) => {
    switch(true) {
      case rating <= 1199:
        return '#808080';
      case rating <= 1399:
        return '#008000';
      case rating <= 1599:
        return '#03A3A3';
      case rating <= 1899:
        return '#0000FF';
      case rating <= 2099:
        return '#AA00AA';
      case rating <= 2299:
        return '#FF8C00';
      case rating <= 2399:
        return '#E97916';
      case rating <= 2599:
        return '#F14545';
      case rating <= 2999:
        return '#FF0000';
      default:
        return '#700303';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-4 p-4 bg-gray-800 sticky top-0 z-50">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
            activeTab === 'problems'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Problem Finder
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          AI Assistant
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'problems' ? (
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-8 text-center max-w-2xl w-full mb-8">
              <Image
                src="/images.png"
                width={120}
                height={120}
                className="mx-auto mb-6 border-4 border-gray-700 rounded-full"
                alt="Logo"
              />
              <h1 className="text-4xl font-bold text-blue-500 mb-8">
                Gimme Problems
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">Select Tags</h2>
                  <select
                    multiple
                    className="w-full p-4 border border-gray-600 bg-gray-800 rounded-lg text-gray-300"
                    onChange={handleTagToggle}
                    value={tags}
                    size={6}
                  >
                    {[
                      "*special problem", "2-sat", "binary search", "bitmasks",
                      "brute force", "combinatorics", "constructive algorithms",
                      "data structures", "dfs and similar", "divide and conquer",
                      "dp", "dsu", "expression parsing", "fft", "flow", "games",
                      "geometry", "graph matchings", "graphs", "greedy", "hashing",
                      "implementation", "interactive", "math", "matrices",
                      "number theory", "probabilities", "shortest paths",
                      "sortings", "strings", "ternary search", "trees",
                      "two pointers",
                    ].map((tag) => (
                      <option 
                        value={tag} 
                        key={tag}
                        className={`p-2 ${tags.includes(tag) ? 'bg-blue-900' : ''}`}
                      >
                        {tag} {tags.includes(tag) ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-2 hover:text-red-400 focus:outline-none"
                          onClick={() => setTags(tags.filter(t => t !== tag))}
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    className="w-full p-4 border border-gray-600 bg-gray-800 rounded-lg text-gray-300"
                    onChange={(event) => handleDifficultyChange(event, false)}
                    defaultValue=""
                  >
                    <option value="" disabled>Starting Range</option>
                    {[800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
                      1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600,
                      2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500
                    ].map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>

                  <select
                    className="w-full p-4 border border-gray-600 bg-gray-800 rounded-lg text-gray-300"
                    onChange={(event) => handleDifficultyChange(event, true)}
                    defaultValue=""
                  >
                    <option value="" disabled>Ending Range</option>
                    {[800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
                      1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600,
                      2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500
                    ].map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                >
                  Gimme Problems
                </button>
              </form>
            </div>

            {loading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Finding problems...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4 bg-red-900 bg-opacity-20 rounded-lg">
                {error}
              </div>
            ) : (
              randomProblems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
                  {randomProblems.map((problem, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
                      style={{ 
                        backgroundColor: getProblemColorByRating(problem.rating),
                        boxShadow: `0 0 20px ${getProblemColorByRating(problem.rating)}33`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative backdrop-blur-sm bg-black/30 p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                            #{problem.index}
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                            {problem.rating}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold mb-4 text-white flex-grow">
                          {problem.name}
                        </h2>
                        <a
                          href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center py-3 px-4 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm font-semibold group-hover:bg-white/40"
                        >
                          Solve Challenge
                        </a>
                      </div>
                      <div className="absolute inset-0 ring-1 ring-white/20 rounded-xl pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Chat />
          </div>
        )}
      </div>
    </div>
  );
}
