import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import axios from "axios";
import { API_BASE_URL } from "../../lib/client";
import { 
  BookOpen, 
  Layers, 
  Type, 
  Plus, 
  Save, 
  Search, 
  X, 
  CheckCircle2, 
  Grid,
  Loader2
} from "lucide-react";

// Fetch helper function
async function generateWordsData(level: string, count: number = 300): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/words?level=${level}&count=${count}`
      , {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("auth_token") || ""}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch words");

    const data = await response.json();
    return data.words || [];
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}

const categories = ["Easy", "Moderate", "Hard", "Master", "GrandMaster"];
const action_type = ["concrete", "abstract", "action"]
const ITEMS_PER_PAGE = 100;

type WordEntry = {
  word: string;
  category: string;
};

export default function Words() {
  const [loading, setLoading] = useState(false);
  const [fetchingWords, setFetchingWords] = useState(true);
  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Select");
  const [selectdType, setSelectedType] = useState("Select")
  const [searchTerm, setSearchTerm] = useState("");
  const [postedWords, setPostedWords] = useState<WordEntry[]>([]);
  const [fetchedWords, setFetchedWords] = useState<Record<string, WordEntry[]>>({
    Easy: [],
    Medium: [],
    Moderate: [],
    Hard: [],
    Master: [],
    GrandMaster: []
  });

  const [activeTab, setActiveTab] = useState(categories[0]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch words on mount
  useEffect(() => {
    async function fetchAllCategories() {
      setFetchingWords(true);
      const categoryWordMap: Record<string, WordEntry[]> = {
        Easy: [],
        Medium: [],
        Moderate: [],
        Hard: [],
        Master: [],
        GrandMaster: []
      };

      await Promise.all(
        categories.map(async (cat) => {
          const words = await generateWordsData(cat, 300);
          categoryWordMap[cat] = words.map((w) => ({
            word: w,
            category: cat,
          }));
        })
      );


      setFetchedWords(categoryWordMap);
      setFetchingWords(false);
    }

    fetchAllCategories();
  }, []);

  const handleAddWord = () => {
    if (word.trim() === "" || selectedCategory === "Select" || selectdType === 'Select') return;
    if (words.includes(word.trim())) {
      toast.error("Word already exists in the list");
      return;
    }

    setWords((prev) => [...prev, word.trim()]);
    setWord("");
  };

  const handleDelete = (index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (words.length === 0 || selectedCategory === "Select" || selectdType === 'Select') {
      toast.error("Please select a category and add at least one word.");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await axios.post(
        `${API_BASE_URL}/add_words`,
        {
          category: selectedCategory,
          word: words,
          type: selectdType
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const { inserted, skipped_duplicates } = response.data;

      if (inserted.length > 1) {
        toast.success(`${inserted.length} word(s) added successfully.`);
      }

      if (skipped_duplicates.length > 0) {
        toast(
          `Skipped duplicates: ${skipped_duplicates.join(", ")}`
          , {
            icon: '⚠️',
          }
        );
      }

      const newEntries = inserted.map((w: string) => ({
        word: w,
        category: selectedCategory,
        type: selectdType
      }));

      console.log("new Entries", newEntries)

      setPostedWords((prev) => [...newEntries, ...prev]);
      setWords([]);
      setSelectedCategory("Select");
      setSelectedType("Select")
      setCurrentPage(1);
      toast.success("Words added successfully");
    } catch (error) {
      toast.error("Failed to upload words.");
      console.error(error);
    }
    setLoading(false);
  };
  
  // Combine fetched and posted words for the current tab
  const allWords = [
    ...postedWords.filter((w) => w.category === activeTab),
    ...(fetchedWords[activeTab] || []),
  ];


  // Filter based on search
  const filteredWords = allWords.filter((entry) =>
    entry.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const currentWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Word Bank Manager</h1>
          <p className="text-slate-500 text-sm">Curate and manage vocabulary for different difficulty levels.</p>
        </div>
      </div>

      {/* Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
              <Plus className="w-5 h-5 text-blue-500" />
              Add New Words
            </CardTitle>
            <CardDescription>Configure difficulty and type, then add words to the staging list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Selectors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Layers className="w-4 h-4" /> Difficulty Level
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                  <Type className="w-4 h-4" /> Word Type
                </Label>
                <Select value={selectdType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {action_type.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex flex-col md:flex-row gap-2 items-start">
              <input
                placeholder="Enter word here..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
              />
              <Button
                onClick={handleAddWord}
                className="h-[50px] w-14 bg-slate-800 hover:bg-slate-700"
                disabled={!word.trim() || selectedCategory === "Select" || selectdType === "Select"}
                title="Add to list"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Staging Area */}
        <Card className="border-slate-200 shadow-sm flex flex-col h-full bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Staging Area
              </CardTitle>
              <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {words.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto max-h-[300px] lg:max-h-none">
            {words.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {words.map((w, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-1 pl-3 pr-1 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    <span className="max-w-[120px] truncate">{w}</span>
                    <button
                      onClick={() => handleDelete(i)}
                      className="p-1 rounded-full hover:bg-blue-200 text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                <Grid className="w-10 h-10 opacity-20" />
                <p className="text-sm">No words queued.</p>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
              onClick={handleSubmit}
              disabled={words.length === 0 || loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Upload Words</>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Library Section */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-xl font-bold text-slate-800">Word Library</h2>
             <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-medium">{filteredWords.length} items</span>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search library..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto scrollbar-hide gap-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                  activeTab === cat
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat}
                {activeTab === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Display */}
        {fetchingWords ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-sm font-medium">Loading library...</p>
          </div>
        ) : (
          <>
            <div className="min-h-[300px]">
              {currentWords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {currentWords.map((w, idx) => (
                    <Card key={idx} className="group border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 bg-white">
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="font-medium text-slate-700 group-hover:text-blue-700 truncate">{w.word}</span>
                        {/* If you had a per-word delete logic, the icon would go here. 
                            Using a subtle decoration for now since logic wasn't provided for individual deletion of fetched words */}
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Search className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-slate-500 font-medium">No words found in this category.</p>
                  <p className="text-slate-400 text-sm">Try adjusting your search or add new words.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-4 text-xs font-medium"
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-4 text-xs font-medium"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}