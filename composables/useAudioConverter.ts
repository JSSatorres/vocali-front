// composables/useAudioConverter.ts
import { ref, watch, onUnmounted } from "vue"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

// ... (interfaces y demás código inicial igual) ...
interface UseAudioConverterOptions {
  onConversionProgress?: (progress: number) => void
  onConversionEnd?: (file: File | null) => void
}
export function useAudioConverter(options?: UseAudioConverterOptions) {
  const isConverting = ref(false)
  const conversionProgress = ref(0)
  const convertedAudioFile = ref<File | null>(null)
  const conversionError = ref<Error | null>(null)

  let ffmpeg: FFmpeg | null = null

  // ... (loadFFmpeg, selectBestMimeType, getFileExtension, createAudioFile - estas van fuera de aqui ) ...
  // Ah, veo que loadFFmpeg, selectBestMimeType, getFileExtension, createAudioFile estan en useAudioRecorder. Ignorar esta parte.
  // Solo loadFFmpeg está aquí.

  const loadFFmpeg = async () => {
    // ... (Tu código de loadFFmpeg es correcto tal como está) ...
  }

  // La función convertFileToMp3 debe ser parte del `return` del composable
  const convertFileToMp3 = async (inputFile: File): Promise<File | null> => {
    isConverting.value = true
    conversionProgress.value = 0
    convertedAudioFile.value = null // Reinicia el valor
    conversionError.value = null

    try {
      if (!ffmpeg || !ffmpeg.loaded) {
        await loadFFmpeg() // Asegúrate de que FFmpeg esté cargado
        // No es necesario comprobar el valor de retorno, solo asegúrate de que no haya errores
      }

      console.log("Starting MP3 conversion with FFmpeg...")

      const inputFileName =
        "input." + (inputFile.name.split(".").pop() || "webm") // Fallback a webm si no hay extensión
      const outputFileName = "output.mp3"

      await ffmpeg!.writeFile(inputFileName, await fetchFile(inputFile))

      await ffmpeg!.exec([
        "-i",
        inputFileName,
        "-acodec",
        "libmp3lame",
        "-ab",
        "64k",
        "-ar",
        "16000",
        "-ac",
        "1",
        "-f",
        "mp3",
        outputFileName,
      ])

      const mp3Data = await ffmpeg?.readFile(outputFileName)

      if (!mp3Data || mp3Data.length === 0) {
        throw new Error("No output data from FFmpeg")
      }

      const mp3Blob = new Blob([mp3Data], { type: "audio/mpeg" })
      const mp3File = new File(
        [mp3Blob],
        inputFile.name.replace(/\.(webm|wav|ogg|m4a|mp4)$/, ".mp3"), // Asegúrate de cubrir más extensiones
        { type: "audio/mpeg" }
      )

      convertedAudioFile.value = mp3File // ¡Asigna el archivo MP3 aquí!
      options?.onConversionEnd?.(mp3File)
      return mp3File
    } catch (err: any) {
      console.error("Error in MP3 conversion:", err)
      conversionError.value = err
      convertedAudioFile.value = null // Si hay error, el valor es null
      return null
    } finally {
      isConverting.value = false // La conversión ha terminado (éxito o fallo)
      conversionProgress.value = 0 // Reinicia el progreso
      // Limpia los archivos temporales de FFmpeg
      // if (ffmpeg) {
      //   try {
      //     await ffmpeg.deleteFile(inputFileName).catch(() => {})
      //     await ffmpeg.deleteFile(outputFileName).catch(() => {})
      //   } catch (e) {
      //     console.warn("Error during FFmpeg file cleanup:", e)
      //   }
      // }
    }
  }

  const cleanupConverter = async () => {
    if (ffmpeg) {
      try {
        await ffmpeg.terminate()
        console.log("FFmpeg instance terminated.")
      } catch (e) {
        console.log("Error terminating FFmpeg instance:", e)
      }
      ffmpeg = null
    }
  }

  onUnmounted(() => {
    cleanupConverter()
  })

  return {
    isConverting,
    conversionProgress,
    convertedAudioFile, // Exporta la referencia reactiva
    conversionError, // Exporta el error para mostrarlo
    convertFileToMp3, // ¡Exporta la función para llamarla cuando quieras!
    cleanupConverter,
  }
}
