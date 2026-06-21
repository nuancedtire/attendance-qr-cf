declare global {
  class Html5Qrcode {
    constructor(elementId: string)
    start(
      cameraConfig: { facingMode: string },
      config: { fps: number; qrbox: { width: number; height: number } },
      onScan: (decodedText: string) => void,
      onError: (error: string) => void,
    ): Promise<void>
    stop(): Promise<void>
  }
}

export {}
