export interface Transcription {
  id: string
  filename: string
  duration: string
  fileSize: string
  s3Key: string
  status: "pending" | "processing" | "completed" | "failed"
  transcriptionText: string
  createdAt: string
  language?: string
}

export interface TranscriptionApiResponse {
  message: string
  status: "success" | "error"
  data: Transcription[]
  count: number
  timestamp: string
  requestId: string
}

export interface ApiError {
  message: string
  status: "error"
  error?: string
  timestamp: string
  requestId: string
}
