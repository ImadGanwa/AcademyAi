# Mind Map Generation Feature Integration Tasks

## Summary

### Purpose
Integrate the Mind Map Generation feature from `mind-map-generation-main` into the AICrafters platform. This feature analyzes video transcriptions using the Google Gemini AI API to create deeply nested, hierarchical mind maps that help students visualize and understand course content.

### Current Status
- ✅ Backend core components created (service, controller, routes)
- ✅ API endpoint defined (GET /api/mindmaps/courses/:courseId/videos/:videoUrl)
- ✅ Frontend requirements analyzed and documented
- ⏳ Dependencies added but need to be installed
- ⏳ Authentication still needs to be added
- ⏩ Frontend implementation pending
- ⏩ Testing pending

### Integration Approach
1. **Backend** - Create API endpoints that leverage existing transcription data to generate mind maps
2. **Frontend** - Add UI elements to trigger mind map generation and display the results
3. **Storage** - Initially generate mind maps on-the-fly, consider persistent storage as enhancement

This document outlines the tasks required to complete this integration.

## Progress Tracking

### Backend Integration
- [x] Analyze Mind Map Backend code structure and dependencies
- [x] Identify core functionality for generating mind maps (using Gemini API)
- [x] Add dependency (@google/generative-ai) to package.json
- [x] Add environment variable (GEMINI_API_KEY) to documentation
- [x] Create utility files (AppError.ts, logger.ts)
- [x] Create mindMapService.ts with core logic
- [x] Create mindMapController.ts for handling requests
- [x] Create mindMapRoutes.ts for API endpoints
- [x] Mount routes in app.ts
- [x] Run npm install to add new dependency
- [x] Verify VideoTranscription model field names
- [x] Add authentication middleware to routes
- [ ] Write tests for new components
- [ ] Consider persistent storage for mind maps (optional)

### Frontend Integration
- [x] Analyze Mind Map Frontend code structure
- [x] Identify required dependencies (markmap-lib, markmap-view, d3)
- [x] Plan component structure for mind map integration
- [x] Add dependencies to aicrafters-frontend package.json
- [x] Create MindMap component 
- [x] Create Modal/Popup for displaying mind maps
- [x] Add "Generate Mind Map" button to relevant pages
- [x] Implement API call to fetch mind map data
- [x] Connect the button to API call and display logic
- [ ] Write tests for frontend components

### Documentation
- [x] Create integration task tracking document (this file)
- [x] Update backend README with environment variable
- [x] Document API endpoints
- [x] Add frontend usage documentation (created mind_map_documentation.md)
- [x] Update main README with feature description

## Backend Integration (`aicrafters-backend`)

1.  **Analyze Mind Map Backend:**
    *   Understand the code structure, dependencies, and logic within `mind-map-generation-main/backend`.
    *   Identify the core functionality for generating mind maps.
    *   Determine how it consumes input data (e.g., transcriptions, course content).
    *   Identify any external services or APIs it relies on.

2.  **Integrate Code:**
    *   Copy or refactor relevant code from `mind-map-generation-main/backend` into `aicrafters-backend/src`.
    *   Create necessary new folders (e.g., `services/mindMapService.ts`, `controllers/mindMapController.ts`, `routes/mindMapRoutes.ts`).
    *   Adapt the code to fit the existing project structure and conventions (TypeScript, Express, Mongoose, etc.).

3.  **Define API Endpoint(s):**
    *   Create new API endpoints in `aicrafters-backend` (e.g., `POST /api/mindmaps/courses/:courseId/generate`) to trigger mind map generation.
    *   Define request/response schemas.
    *   Add authentication and authorization middleware.

4.  **Data Handling:**
    *   Determine how to fetch the necessary input data (e.g., transcriptions from `VideoTranscription` model).
    *   Decide how and where to store the generated mind map data (e.g., update `VideoTranscription` model, create a new `MindMap` model).

5.  **Dependencies:**
    *   Add any new npm dependencies required by the mind map backend logic to `aicrafters-backend/package.json`.
    *   Run `npm install` in `aicrafters-backend`.

6.  **Configuration:**
    *   Add any necessary environment variables to `.env.example` and `.env` (e.g., API keys for external mind map services).
    *   Update configuration files if needed.

7.  **Testing:**
    *   Write unit/integration tests for the new backend logic and API endpoints.

## Frontend Integration (`aicrafters-frontend`)

1.  **Analyze Mind Map Frontend:**
    *   Understand the code structure and UI components within `mind-map-generation-main/mindmap`.
    *   Identify how the mind map is visualized.

2.  **Add UI Element:**
    *   Add a "Generate Mind Map" button or link to the relevant page(s) in the frontend (e.g., course content page, video player page).

3.  **API Call:**
    *   Implement the logic to call the new backend API endpoint when the button is clicked.
    *   Handle loading states and potential errors.

4.  **Display Mind Map:**
    *   Integrate the mind map visualization component from `mind-map-generation-main/mindmap` or use a suitable library.
    *   Display the generated mind map data fetched from the backend.

5.  **Dependencies:**
    *   Add any new npm dependencies required by the mind map frontend logic/visualization to `aicrafters-frontend/package.json`.
    *   Run `npm install` in `aicrafters-frontend`.

6.  **Testing:**
    *   Write tests for the new frontend components and interactions.

## Implementation Notes

### Backend Component Files Created
- `aicrafters-backend/src/services/mindMapService.ts` - Core mind map generation logic
- `aicrafters-backend/src/controllers/mindMapController.ts` - Request handler
- `aicrafters-backend/src/routes/mindMapRoutes.ts` - API endpoint definitions
- `aicrafters-backend/src/utils/AppError.ts` - Error handling utility
- `aicrafters-backend/src/config/logger.ts` - Logging utility

### API Endpoints Created
- `GET /api/mindmaps/courses/:courseId/videos/:videoUrl` - Generate mind map for a specific video

### Frontend Implementation Requirements

Based on analysis of `mind-map-generation-main/mindmap`, we'll need:

#### Dependencies to Add to aicrafters-frontend
- `markmap-lib` - For transforming markdown to mind map data
- `markmap-view` - For rendering the mind map visualization
- `d3`