/**
 * Reproduce un archivo de audio dado su URL de origen.
 * @param src URL del recurso de audio.
 */
export async function playAudio(src: string): Promise<void> {
  try {
    const audio: HTMLAudioElement = new Audio(src);
    await audio.play();
  } catch (err) {
    console.error('[playAudio] Failed to play audio:', src, err);
  }
}
