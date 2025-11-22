export class SceneRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];

  async startRecording(canvas: HTMLCanvasElement, audioStream?: MediaStream) {
    const canvasStream = canvas.captureStream(60);
    if (!canvasStream) throw new Error('captureStream not supported or canvas invalid');

    const combined = new MediaStream();

    const videoTracks = canvasStream.getVideoTracks();
    if (videoTracks.length) combined.addTrack(videoTracks[0]);

    if (audioStream) {
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length) {
        audioTracks.forEach(t => combined.addTrack(t));
        console.log('✅ Added audio tracks from processed audio stream');
      } else {
        console.warn('⚠️ audioStream has no audio tracks');
      }
    } else {
      console.warn('⚠️ No audioStream provided; recording will be silent');
    }

    const mimeTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];
    let mime = 'video/webm';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        mime = m;
        break;
      }
    }
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(combined, { mimeType: mime });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.start();
    console.log('🎥 SceneRecorder started, mime:', mime);
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}
