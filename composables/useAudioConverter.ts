import { ref } from "vue"

interface UseAudioConverterOptions {
  onConversionProgress?: (progress: number) => void
  onConversionEnd?: (file: File | null) => void
}

export function useAudioConverter(options?: UseAudioConverterOptions) {
  const isConverting = ref(false)
  const conversionProgress = ref(0)
  const convertedAudioFile = ref<File | null>(null)
  const conversionError = ref<Error | null>(null)

  const convertFileToMp3 = async (inputFile: File): Promise<File | null> => {
    isConverting.value = true
    conversionProgress.value = 0
    convertedAudioFile.value = null
    conversionError.value = null

    try {
      // Create audio context to decode the file
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      // Convert file to array buffer
      const arrayBuffer = await inputFile.arrayBuffer()
      conversionProgress.value = 20

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      conversionProgress.value = 40

      // Convert to WAV format (simpler than MP3, no external dependencies)
      const wavData = audioBufferToWav(audioBuffer)
      conversionProgress.value = 80

      // Create WAV file (backend should accept WAV files)
      const wavBlob = new Blob([wavData], { type: "audio/wav" })
      const wavFile = new File(
        [wavBlob],
        inputFile.name.replace(/\.(webm|wav|ogg|m4a|mp4)$/i, ".wav"),
        { type: "audio/wav" }
      )

      convertedAudioFile.value = wavFile
      options?.onConversionEnd?.(wavFile)
      conversionProgress.value = 100

      // Close audio context to free resources
      await audioContext.close()

      return wavFile
    } catch (err: any) {
      conversionError.value = err
      convertedAudioFile.value = null
      options?.onConversionEnd?.(null)
      return null
    } finally {
      isConverting.value = false
    }
  }

  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const bitsPerSample = 16

    const bytesPerSample = bitsPerSample / 8
    const blockAlign = numberOfChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = length * blockAlign
    const bufferSize = 44 + dataSize

    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)

    // WAV header
    let offset = 0

    // RIFF chunk descriptor
    writeString(view, offset, "RIFF")
    offset += 4
    view.setUint32(offset, bufferSize - 8, true)
    offset += 4
    writeString(view, offset, "WAVE")
    offset += 4

    // fmt sub-chunk
    writeString(view, offset, "fmt ")
    offset += 4
    view.setUint32(offset, 16, true)
    offset += 4 // Subchunk1Size
    view.setUint16(offset, 1, true)
    offset += 2 // AudioFormat (PCM)
    view.setUint16(offset, numberOfChannels, true)
    offset += 2
    view.setUint32(offset, sampleRate, true)
    offset += 4
    view.setUint32(offset, byteRate, true)
    offset += 4
    view.setUint16(offset, blockAlign, true)
    offset += 2
    view.setUint16(offset, bitsPerSample, true)
    offset += 2

    // data sub-chunk
    writeString(view, offset, "data")
    offset += 4
    view.setUint32(offset, dataSize, true)
    offset += 4

    // PCM audio data
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i])
        )
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(offset, intSample, true)
        offset += 2
      }
    }

    return arrayBuffer
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const cleanupConverter = async () => {
    isConverting.value = false
    conversionProgress.value = 0
    convertedAudioFile.value = null
    conversionError.value = null
  }

  return {
    isConverting,
    conversionProgress,
    convertedAudioFile,
    conversionError,
    convertFileToMp3,
    cleanupConverter,
  }
}
