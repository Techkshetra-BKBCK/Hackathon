// route.js
import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

// Check if the API key is set
const apiKey = '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'
if (!apiKey) {
  console.error("HUGGING_FACE_API_KEY is not set in the environment variables.")
}

const hf = new HfInference(apiKey)

export async function POST(request) {
  try {
    const { image, model } = await request.json()

    if (!image || !model) {
      return NextResponse.json({ error: "Image and model are required" }, { status: 400 })
    }

    // Validate the image format
    if (!image.startsWith('data:image')) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 })
    }

    console.log(`Received request for model: ${model}`)

    const imageData = image.split(',')[1] // Remove the data URL prefix

    const result = await hf.imageClassification({
      data: Buffer.from(imageData, 'base64'),
      model: model,
    })

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "No results from model" }, { status: 500 })
    }

    console.log("Analysis completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Detailed error in API route:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing the image." },
      { status: 500 }
    )
  }
}
