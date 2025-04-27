import { QuizContent } from './types';

export const getVideoDuration = (videoUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      resolve(video.duration / 60); // Convert to minutes
    };
    video.onerror = () => {
      resolve(0);
    };
  });
};

export const calculateLessonDuration = async (content: string): Promise<number> => {
  // Extract text content (excluding HTML tags and media content)
  const textContent = content
    .replace(/<div class="media-content".*?<\/div>/g, '') // Remove media content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();

  // Calculate reading time (150 words per minute)
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 150);

  // Get video durations
  const videoMatches = content.match(/<div class="media-content" data-type="video">(.*?)<\/div>/g) || [];
  let totalVideoDuration = 0;

  // Extract video URLs and get their durations
  const videoUrls = videoMatches
    .map(match => {
      const urlMatch = match.match(/<div class="media-content" data-type="video">(.*?)<\/div>/);
      return urlMatch ? urlMatch[1] : null;
    })
    .filter((url): url is string => typeof url === 'string');

  // Get duration of each video
  const videoDurations = await Promise.all(
    videoUrls.map(url => getVideoDuration(url))
  );
  totalVideoDuration = videoDurations.reduce((sum, duration) => sum + duration, 0);

  // Count images (15 seconds each = 0.25 minutes each)
  const imageMatches = content.match(/<div class="media-content" data-type="image">(.*?)<\/div>/g) || [];
  const imageTime = Math.ceil(imageMatches.length * 0.25);

  // Sum up all durations and round up to nearest minute
  const totalDuration = Math.ceil(readingTime + totalVideoDuration + imageTime);
  
  return totalDuration;
};

export const calculateQuizDuration = (questions: QuizContent['questions']): number => {
  // Estimate 2 minutes per question
  return questions.length * 2;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

export const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['image'],
      ['clean']
    ],
    handlers: {
      image: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const range = (this as any).quill.getSelection();
              (this as any).quill.insertEmbed(range?.index || 0, 'image', e.target?.result);
            };
            reader.readAsDataURL(file);
          }
        };
      }
    }
  },
  clipboard: {
    matchVisual: false
  }
};

export const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'link',
  'list', 'bullet',
  'color', 'background',
  'image'
]; 