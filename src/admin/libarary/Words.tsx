import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
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
          // Remove this line: withCredentials: true,
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Form Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl  text-[#245cab] mb-1">Add Words</h2>
          <p className="text-gray-500 text-sm mb-2">
            Enter words and assign them to a category.
          </p>
        </div>
        <div className="flex gap-x-4">
          <div>
            <Label className="mb-1 block">Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Select Type</Label>
            <Select value={selectdType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {action_type.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Word Input Card */}
      <Card>
        <CardHeader />
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                placeholder="Enter a word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                maxLength={500}
                minLength={1}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAddWord}
              className="h-10 px-6 bg-green-600 hover:bg-green-700"
              disabled={!word.trim() || selectedCategory === "Select"}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display entered words before upload */}
      {words.length > 0 && (
        <div className="bg-white rounded-md p-4 shadow-sm border">
          <Label className="block mb-2 text-gray-700">Words List</Label>
          <ul className="flex flex-wrap gap-2">
            {words.map((w, i) => (
              <li
                key={i}
                className="flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-1"
              >
                <span className="text-sm">{w}</span>
                <button
                  onClick={() => handleDelete(i)}
                  className="ml-2 text-blue-500 hover:text-red-600 transition"
                  aria-label="Remove word"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={handleSubmit}
          disabled={words.length === 0 || selectedCategory === "Select"}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-300">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setCurrentPage(1);
              setSearchTerm("");
            }}
            className={`flex-1 text-center py-2 font-semibold ${activeTab === cat
                ? "text-[#245cab] border-b-2 border-[#245cab]"
                : "text-gray-500"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="mt-4 flex justify-end">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search word..."
          className="border rounded-md px-3 py-2 w-full md:w-1/3 text-sm"
        />
      </div>

      {/* Word Grid */}
      {fetchingWords ? (
        <div className="text-center text-gray-500 py-10">
          <div className="animate-spin h-8 w-8 border-4 border-[#245cab] border-t-transparent rounded-full mx-auto mb-3" />
          <p>Loading words...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-6">
          {currentWords.length > 0 ? (
            currentWords.map((w, idx) => (
              <div
                key={idx}
                className="border rounded-md p-3 bg-white shadow-sm text-sm"
              >
                {w.word}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">
              No words found.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
