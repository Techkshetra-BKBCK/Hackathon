

// page.js
"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import * as tf from "@tensorflow/tfjs"
import { Stage, Layer, Rect, Image as KonvaImage } from "react-konva"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SUPPORTED_IMAGE_TYPES = [
  { name: "Chest X-ray", value: "xray", model: "google/vit-base-patch16-224" },
  { name: "Brain MRI", value: "mri", model: "google/vit-base-patch16-224" },
  { name: "Mammogram", value: "mammogram", model: "google/vit-base-patch16-224" },
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

export default function Home() {
  const [image, setImage] = useState(null)
  const [imageElement, setImageElement] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImageType, setSelectedImageType] = useState(SUPPORTED_IMAGE_TYPES[0])

  const validateImage = async (file) => {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Image size exceeds 10MB limit")
    }
    
    const img = await loadImage(URL.createObjectURL(file))
    if (img.width === 0 || img.height === 0) {
      throw new Error("Invalid image dimensions")
    }
    
    return true
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null)
    const file = acceptedFiles[0]
    
    try {
      await validateImage(file)
      const reader = new FileReader()

      reader.onload = async (e) => {
        if (e.target?.result) {
          setImage(e.target.result)
          await processImage(e.target.result)
        }
      }

      reader.onerror = () => {
        throw new Error("Failed to read image file")
      }

      reader.readAsDataURL(file)
    } catch (error) {
      setError(error.message)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  const processImage = async (dataUrl) => {
    setIsLoading(true)
    setError(null)
    
    // Create references to tensors so we can clean them up later
    let tensor = null
    let resized = null
    let normalized = null
    let batched = null

    try {
      // Validate image
      const img = await loadImage(dataUrl)
      if (img.width === 0 || img.height === 0) {
        throw new Error("Invalid image dimensions")
      }

      // Preprocess image with error handling
      try {
        tensor = tf.browser.fromPixels(img)
        resized = tf.image.resizeBilinear(tensor, [224, 224])
        normalized = resized.div(255.0)
        batched = normalized.expandDims(0)
      } catch (tfError) {
        console.error("TensorFlow processing error:", tfError)
        throw new Error("Failed to process image")
      }

      // Convert to blob with error handling
      const canvas = document.createElement("canvas")
      canvas.width = 224
      canvas.height = 224
      await tf.browser.toPixels(normalized.squeeze(), canvas)
      
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error("Failed to create image blob"))
        })
      })

      const base64Image = await blobToBase64(blob)

      // Send to API with better error handling
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          model: selectedImageType.model,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API request failed with status ${response.status}`)
      }

      const result = await response.json()

      if (!Array.isArray(result)) {
        throw new Error("Invalid response format from API")
      }

      // Map the results
      const mappedResults = result.map((item) => ({
        ...item,
        label: mapToMedicalTerm(item.label, selectedImageType.value),
      }))

      setAnalysis(mappedResults)
    } catch (error) {
      console.error("Detailed error processing image:", error)
      setError(error.message || "An error occurred while processing the image. Please try again.")
    } finally {
      // Clean up TensorFlow tensors
      if (tensor) tensor.dispose()
      if (resized) resized.dispose()
      if (normalized) normalized.dispose()
      if (batched) batched.dispose()
      setIsLoading(false)
    }
  }

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = src
    })
  }

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => reject(new Error("Failed to convert image"))
      reader.readAsDataURL(blob)
    })
  }

  useEffect(() => {
    if (image) {
      loadImage(image)
        .then(setImageElement)
        .catch(error => setError(error.message))
    }
  }, [image])

  const chartData = {
    labels: analysis ? analysis.map((item) => item.label) : [],
    datasets: [
      {
        label: "Confidence",
        data: analysis ? analysis.map((item) => item.score * 100) : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Analysis Results",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  const mapToMedicalTerm = (label, imageType) => {
    const medicalTerms = {
      xray: {
        person: "Potential anomaly detected",
        envelope: "Possible lung opacity",
        "web site": "Possible lung nodule",
        normal: "No significant findings",
      },
      mri: {
        brain: "Brain structure visible",
        "web site": "Potential abnormality detected",
        normal: "No significant findings",
      },
      mammogram: {
        "web site": "Potential abnormality detected",
        envelope: "Possible mass detected",
        normal: "No significant findings",
      },
    }

    return medicalTerms[imageType][label] || `Unclassified: ${label}`
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>AI-Powered Medical Image Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="image-type">Select Image Type</Label>
            <Select
              value={selectedImageType.value}
              onValueChange={(value) =>
                setSelectedImageType(SUPPORTED_IMAGE_TYPES.find((type) => type.value === value))
              }
            >
              <SelectTrigger id="image-type">
                <SelectValue placeholder="Select image type" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_IMAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${error ? 'border-red-500' : ''}`}
          >
            <input {...getInputProps()} />
            <p>Drag and drop a {selectedImageType.name} image here, or click to select a file</p>
            <p className="text-sm text-gray-500 mt-2">Supported formats: JPEG, PNG, GIF (max 10MB)</p>
          </div>

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Analyzing image...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {image && !isLoading && (
            <div className="mt-6">
              <Stage width={400} height={400}>
                <Layer>
                  {imageElement && (
                    <KonvaImage
                      image={imageElement}
                      width={400}
                      height={400}
                      fit="contain"
                    />
                  )}
                  {analysis && analysis[0].score > 0.5 && (
                    <Rect
                      x={50}
                      y={50}
                      width={300}
                      height={300}
                      stroke="red"
                      strokeWidth={2}
                    />
                  )}
                </Layer>
              </Stage>

              {analysis && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-4">Analysis Results:</h3>
                  <Bar data={chartData} options={chartOptions} className="mb-4" />
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      Primary detection: {analysis[0].label}
                      <span className="ml-2 text-blue-600">
                        (Confidence: {(analysis[0].score * 100).toFixed(2)}%)
                      </span>
                    </p>
                    
                    <p className="mt-2 text-gray-600">
                      Summary: The AI model has detected potential signs of {analysis[0].label.toLowerCase()} in the{" "}
                      {selectedImageType.name} with {(analysis[0].score * 100).toFixed(2)}% confidence. Please consult
                      with a medical professional for a thorough evaluation.
                    </p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">View Detailed Report</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Detailed Analysis Report</DialogTitle>
                        <DialogDescription>
                          Comprehensive breakdown of the AI model's findings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {analysis.map((item, index) => (
                          <div key={index} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`result-${index}`} className="text-right">
                              {item.label}
                            </Label>
                            <div id={`result-${index}`} className="col-span-3">
                              Confidence: {(item.score * 100).toFixed(2)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}