"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Upload, X, ImageIcon, Loader2, RefreshCw, CloudUpload,  Plus } from "lucide-react"
import { API_BASE_URL } from "../../lib/client"

type ImageBase64 = {
  file?: File
  filename: string
  base64: string
}

const IMAGES_PER_PAGE = 20
const CACHE_KEY = "cached_images"
const CACHE_TIMESTAMP_KEY = "cache_timestamp"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_FILE_SIZE = 100 * 1024 // 100KB in bytes

const imagesPool = async (): Promise<ImageBase64[]> => {
  const response = await fetch(`${API_BASE_URL}/images`)
  console.log("response",response);
  if (!response.ok) throw new Error("Failed to fetch images")

  const data: { filename: string }[] = await response.json()
  const baseURL = `${API_BASE_URL}/uploads/Images`

  return data.map((item) => ({
    filename: item.filename,
    base64: `${baseURL}/${item.filename}`,
  }))
}

const ModernImageGallery = () => {
  const [images, setImages] = useState<ImageBase64[]>([])
  
  const [newUploadImages, setNewUploadImages] = useState<ImageBase64[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingImages, setFetchingImages] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [dragActive, setDragActive] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  // Load images from cache or fetch from server
  useEffect(() => {
    const loadImages = async () => {
      setFetchingImages(true)

      try {
        // Check cache first
        const cachedImages = localStorage.getItem(CACHE_KEY)
        const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        const now = Date.now()

        if (cachedImages && cacheTimestamp && now - Number.parseInt(cacheTimestamp) < CACHE_DURATION) {
          // Use cached data
          setImages(JSON.parse(cachedImages))
          setFetchingImages(false)
          return
        }

        // Fetch fresh data
        const fetchedImages = await imagesPool()
        setImages(fetchedImages)

        // Cache the data
        localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedImages))
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString())
      } catch (error) {
        console.error("Error loading images:", error)
      } finally {
        setFetchingImages(false)
      }
    }

    loadImages()
  }, [])

  const refreshImages = async () => {
    setFetchingImages(true)
    try {
      const fetchedImages = await imagesPool()
      setImages(fetchedImages)

      // Update cache
      const now = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedImages))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString())

      setCurrentPage(1)
    } catch (error) {
      console.error("Error refreshing images:", error)
    } finally {
      setFetchingImages(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)
    await processFiles(fileArray)
  }

  const processFiles = async (files: File[]) => {
    // Filter files by size
    const validFiles: File[] = []
    const rejectedFiles: string[] = []

    files.forEach((file) => {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file)
      } else {
        rejectedFiles.push(file.name)
      }
    })

    // Show error if any files were rejected
    if (rejectedFiles.length > 0) {
      const errorMsg = `${rejectedFiles.length} file(s) exceeded 100KB limit: ${rejectedFiles.slice(0, 3).join(", ")}${rejectedFiles.length > 3 ? "..." : ""}`
      setSizeError(errorMsg)
      setTimeout(() => setSizeError(null), 5000)
    }

    // Process only valid files
    if (validFiles.length > 0) {
      const imagesWithBase64: ImageBase64[] = await Promise.all(
        validFiles.map(async (file) => ({
          file,
          filename: file.name,
          base64: await fileToBase64(file),
        })),
      )

      setNewUploadImages((prev) => [...prev, ...imagesWithBase64])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
      if (files.length > 0) {
        await processFiles(files)
      }
    }
  }

  const removeImage = (index: number) => {
    setNewUploadImages((prev) => prev.filter((_, i) => i !== index))
  }

  // const handleSubmit = async () => {
  //   if (newUploadImages.length === 0) return

  //   setLoading(true)
  //   const formData = new FormData()
  //   newUploadImages.forEach(({ file }) => {
  //     if (file) formData.append("images", file)
  //   })

  //   try {
  //     const token = sessionStorage.getItem("auth_token")
  //     await axios.post(`${API_BASE_URL}/insert_images`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: token ? `Bearer ${token}` : undefined,
  //       },
  //     })

  //     // Update images list and cache
  //     const uploadedImagePaths = newUploadImages.map(({ filename }) => ({
  //       filename,
  //       base64: `${API_BASE_URL}/uploads/Images/${filename}`,
  //     }))

  //     const updatedImages = [...uploadedImagePaths, ...images]
  //     setImages(updatedImages)

  //     // Update cache
  //     const now = Date.now()
  //     localStorage.setItem(CACHE_KEY, JSON.stringify(updatedImages))
  //     localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString())

  //     setNewUploadImages([])
  //     setCurrentPage(1)
  //   } catch (error) {
  //     console.error("Upload error:", error)
  //   }
  //   setLoading(false)
  // }


  const handleSubmit = async () => {
    if (newUploadImages.length === 0) return

    setLoading(true)
    const formData = new FormData()
    newUploadImages.forEach(({ file }) => {
      if (file) formData.append("images", file)
    })

    try {
        const token = sessionStorage.getItem("auth_token")
        await axios.post(`${API_BASE_URL}/insert_images`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token ? `Bearer ${token}` : undefined,
            },
        })

        // Instead of appending manually, fetch latest clean images from backend
        await refreshImages()
        setNewUploadImages([])
        setCurrentPage(1)
    } catch (error) {
        console.error("Upload error:", error)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE)
  const start = (currentPage - 1) * IMAGES_PER_PAGE
  const currentImages = images.slice(start, start + IMAGES_PER_PAGE)

  return (
    <div className="min-h-screen bg-gradient-to-br rounded-lg from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-center text-[#245cab]">Image Gallery</h1>
          <p className="text-sm sm:text-base !text-slate-600">Upload and manage your images with ease</p>
        </div>

        {/* Upload Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5 text-[#245cab]" />
              Upload Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Size Error Alert */}
            {sizeError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Upload Error</p>
                  <p className="text-sm mt-1">{sizeError}</p>
                </div>
              </div>
            )}
            {/* Drag and Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-3 sm:space-y-4">
               
                <div>
                 
                  
                  <div className="flex items-center justify-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer w-full sm:w-auto">
                      <div className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto">
                        <Plus className="w-4 h-4" />
                        Choose Images
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                 
                </div>
              </div>
            </div>

            {newUploadImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Selected Images</span>
                    <span className="sm:hidden">Selected</span>
                  </h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    {newUploadImages.length} selected
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newUploadImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-blue-300 transition-colors">
                        <img
                          src={image.base64 || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                          {image.filename}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Uploading {newUploadImages.length} images...</span>
                      <span className="sm:hidden">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Upload {newUploadImages.length} Images</span>
                      <span className="sm:hidden">Upload ({newUploadImages.length})</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="hidden !text-black sm:inline">Image Gallery</span>
                <span className="sm:hidden !text-black">Gallery</span>
                {images.length > 0 && (
                  <Badge variant="outline" className="ml-1 !text-black sm:ml-2 text-xs sm:text-sm">
                    {images.length}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshImages}
                disabled={fetchingImages}
                className="flex items-center gap-1 sm:gap-2 hover:bg-green-50 hover:border-green-300 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${fetchingImages ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fetchingImages ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm sm:text-base text-slate-600">Loading images...</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">No images found</h3>
                <p className="text-sm sm:text-base text-slate-500">Upload some images to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {currentImages.map((image, index) => (
                    <div key={start + index} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
                        <img
                          src={image.base64 || "/placeholder.svg"}
                          alt={`Gallery ${start + index}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-2 px-1">
                        <p className="text-xs text-gray-600 truncate" title={image.filename}>
                          {image.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-6 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-6 text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ModernImageGallery