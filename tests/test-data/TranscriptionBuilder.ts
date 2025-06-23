import type { Transcription } from "~/types/transcription"

/**
 * Simplified Builder pattern for creating test data
 * Only includes methods that are actually used in tests
 */
export class TranscriptionBuilder {
  private transcription: Transcription

  constructor() {
    this.transcription = {
      id: "1",
      filename: "test-audio.wav",
      duration: "01:30",
      fileSize: "2.0 MB",
      s3Key: "test-audio.wav",
      status: "completed",
      transcriptionText: "Default transcription text.",
      createdAt: "2024-01-01T10:00:00Z",
    }
  }

  withId(id: string): TranscriptionBuilder {
    this.transcription.id = id
    return this
  }

  withFilename(filename: string): TranscriptionBuilder {
    this.transcription.filename = filename
    this.transcription.s3Key = filename
    return this
  }

  withStatus(status: Transcription["status"]): TranscriptionBuilder {
    this.transcription.status = status
    return this
  }

  withDuration(duration: string): TranscriptionBuilder {
    this.transcription.duration = duration
    return this
  }

  withFileSize(fileSize: string): TranscriptionBuilder {
    this.transcription.fileSize = fileSize
    return this
  }

  withTranscriptionText(text: string): TranscriptionBuilder {
    this.transcription.transcriptionText = text
    return this
  }

  build(): Transcription {
    return { ...this.transcription }
  }
}
