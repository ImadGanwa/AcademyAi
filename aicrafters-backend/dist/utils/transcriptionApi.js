"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranscription = getTranscription;
const node_fetch_1 = __importDefault(require("node-fetch"));
function getTranscription(videoUrl, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract video ID from Vimeo URL - always use the ID right after vimeo.com/
        let videoId;
        try {
            // Parse the URL to extract the video ID
            const url = new URL(videoUrl);
            const pathParts = url.pathname.split('/').filter(part => part);
            // The first part after vimeo.com/ is always the video ID
            videoId = pathParts[0];
            console.log(`Extracted video ID: ${videoId} from URL: ${videoUrl} using URL parser`);
        }
        catch (error) {
            // Fallback to simpler extraction if URL parsing fails
            const match = videoUrl.match(/vimeo\.com\/(\d+)/);
            if (match && match[1]) {
                videoId = match[1];
                console.log(`Extracted video ID: ${videoId} from URL: ${videoUrl} using regex fallback`);
            }
        }
        if (!videoId) {
            throw new Error(`Invalid Vimeo URL: ${videoUrl}`);
        }
        console.log(`Final video ID: ${videoId} from URL: ${videoUrl}`);
        const url = `https://api.vimeo.com/videos/${videoId}/texttracks`;
        const headers = {
            'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        };
        try {
            const response = yield (0, node_fetch_1.default)(url, {
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
                const errorText = yield response.text();
                throw new Error(`Vimeo API error: ${response.status} - ${errorText}`);
            }
            const data = yield response.json();
            console.log(`Data: ${JSON.stringify(data)}`);
            if (data.data && data.data.length > 0) {
                const trackUrl = data.data[0].link;
                const vttResponse = yield (0, node_fetch_1.default)(trackUrl);
                if (vttResponse.status === 200) {
                    const vttText = yield vttResponse.text();
                    return processVttText(vttText);
                }
                else {
                    throw new Error(`Error downloading VTT file: ${vttResponse.status}`);
                }
            }
            else {
                return "No transcription found.";
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred while fetching transcription');
        }
    });
}
function processVttText(vttText) {
    const lines = vttText.split(/\r?\n/);
    const usefulLines = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "" ||
            trimmedLine.startsWith("WEBVTT") ||
            trimmedLine.includes("-->") ||
            /^\d+$/.test(trimmedLine)) {
            continue;
        }
        usefulLines.push(trimmedLine);
    }
    return usefulLines.join(" ");
}
