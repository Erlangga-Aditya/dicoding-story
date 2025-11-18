class CameraHelper {
  constructor() {
    this.stream = null;
    this.videoElement = null;
  }

  // Check if camera is supported
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Start camera stream
  async startCamera(videoElement) {
    try {
      this.videoElement = videoElement;
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
    }
  }

  // Capture photo from video stream
  capturePhoto(canvasElement) {
    if (!this.stream || !this.videoElement) {
      throw new Error('Camera not started');
    }

    const context = canvasElement.getContext('2d');
    canvasElement.width = this.videoElement.videoWidth;
    canvasElement.height = this.videoElement.videoHeight;

    context.drawImage(this.videoElement, 0, 0);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvasElement.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      }, 'image/jpeg', 0.9);
    });
  }

  // Stop camera stream
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}

export default CameraHelper;