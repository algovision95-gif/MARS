import fs from 'fs';
import Upload from '../models/Upload.js';

async function extractPDFText(filePath) {
  try {
    const { default: pdfParse } = await import('pdf-parse').catch(() => ({ default: null }));
    if (!pdfParse) return 'PDF parsing library not available.';
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || 'No text extracted from PDF.';
  } catch (err) {
    console.error('PDF extract error:', err.message);
    return 'PDF text extraction failed.';
  }
}

async function extractDocxText(filePath) {
  try {
    const { default: mammoth } = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || 'No text found in DOCX.';
  } catch (err) {
    console.error('DOCX extract error:', err.message);
    return 'DOCX text extraction failed.';
  }
}

async function transcribeAudio(filePath, mimetype) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const audioData = fs.readFileSync(filePath);
    const base64 = audioData.toString('base64');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent({
      contents: [{
        parts: [
          { inlineData: { mimeType: mimetype || 'audio/mpeg', data: base64 } },
          { text: 'Transcribe this audio accurately. Return only the transcription text.' },
        ],
      }],
    });
    return response.text || 'Audio transcription returned empty result.';
  } catch (err) {
    console.error('Audio transcription error:', err.message);
    return 'Audio transcription failed. Check Gemini API key.';
  }
}

async function extractVideoText(filePath) {
  try {
    const { default: ffmpeg } = await import('fluent-ffmpeg');
    const audioPath = filePath.replace(/\.[^/.]+$/, '_extracted.mp3');

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('64k')
        .save(audioPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const text = await transcribeAudio(audioPath, 'audio/mpeg');

    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    return text;
  } catch (err) {
    console.error('Video processing error:', err.message);
    return 'Video text extraction failed. Ensure FFmpeg is installed.';
  }
}

export async function processFile(uploadId, filePath, mimetype) {
  await Upload.findByIdAndUpdate(uploadId, { status: 'processing' });
  let extractedText = '';

  try {
    if (mimetype === 'application/pdf') {
      extractedText = await extractPDFText(filePath);
    } else if (mimetype === 'text/plain') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else if (mimetype.includes('wordprocessingml')) {
      extractedText = await extractDocxText(filePath);
    } else if (mimetype.startsWith('audio/')) {
      extractedText = await transcribeAudio(filePath, mimetype);
    } else if (mimetype.startsWith('video/')) {
      extractedText = await extractVideoText(filePath);
    } else {
      extractedText = 'Unsupported file type for text extraction.';
    }

    await Upload.findByIdAndUpdate(uploadId, { extractedText, status: 'processed' });
    console.log(`✅ Processed file: ${uploadId} (${extractedText.length} chars)`);
  } catch (err) {
    console.error('File processor error:', err.message);
    await Upload.findByIdAndUpdate(uploadId, { status: 'failed' });
  }
}
