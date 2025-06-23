import type { Transcription } from "~/types/transcription"

/**
 * Simplified Object Mother pattern for test data
 * Only includes commonly used test objects
 */
export class TranscriptionMother {
  static completed(): Transcription {
    return {
      id: "1",
      filename: "completed-audio.wav",
      duration: "02:30",
      fileSize: "3.2 MB",
      s3Key: "completed-audio.wav",
      status: "completed",
      transcriptionText: "This is a completed transcription text.",
      createdAt: "2024-01-01T10:00:00Z",
    }
  }

  static processing(): Transcription {
    return {
      id: "2",
      filename: "processing-audio.wav",
      duration: "01:45",
      fileSize: "2.1 MB",
      s3Key: "processing-audio.wav",
      status: "processing",
      transcriptionText: "",
      createdAt: "2024-01-01T11:00:00Z",
    }
  }

  static failed(): Transcription {
    return {
      id: "3",
      filename: "failed-audio.wav",
      duration: "00:30",
      fileSize: "1.0 MB",
      s3Key: "failed-audio.wav",
      status: "failed",
      transcriptionText: "",
      createdAt: "2024-01-01T12:00:00Z",
    }
  }

  static list(): Transcription[] {
    return [this.completed(), this.processing(), this.failed()]
  }
}
