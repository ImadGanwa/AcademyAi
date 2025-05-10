import fetch from 'node-fetch';

interface VimeoTextTrack {
  link: string;
}

interface VimeoResponse {
  data: VimeoTextTrack[];
}

export async function getTranscription(videoUrl: string, accessToken: string): Promise<string> {
  // Extract video ID from Vimeo URL
  const videoId = videoUrl.split('/').pop()?.split('?')[0];
  if (!videoId) {
    throw new Error('Invalid Vimeo URL');
  }

  const url = `https://api.vimeo.com/videos/${videoId}/texttracks`;
  const headers = {
    'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.vimeo.*+json;version=3.4'
  };

  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers 
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: Please check your access token');
    }

    if (response.status === 404) {
      throw new Error('Video not found or not accessible');
    }

    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(`Vimeo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as VimeoResponse;

    if (data.data && data.data.length > 0) {
      const trackUrl = data.data[0].link;
      const vttResponse = await fetch(trackUrl);

      if (vttResponse.status === 200) {
        const vttText = await vttResponse.text();
        return processVttText(vttText);
      } else {
        throw new Error(`Error downloading VTT file: ${vttResponse.status}`);
      }
    } else {
      return "No transcription found.";
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching transcription');
  }
}

function processVttText(vttText: string): string {
  const lines = vttText.split(/\r?\n/);
  const usefulLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine === "" ||
      trimmedLine.startsWith("WEBVTT") ||
      trimmedLine.includes("-->") ||
      /^\d+$/.test(trimmedLine)
    ) {
      continue;
    }
    usefulLines.push(trimmedLine);
  }

  return usefulLines.join(" ");
} 