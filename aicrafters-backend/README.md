# AICrafters Backend

This is the backend service for the AICrafters application, providing the API and business logic.

## Project Purpose

This project serves as the core API for the AICrafters Academy platform. It handles user authentication, course management, data storage, interactions with third-party services (like Cloudinary), and other server-side operations needed by the frontend application.

## Technology Stack

*   **Runtime:** Node.js (>= 18.0.0)
*   **Language:** TypeScript
*   **Framework:** Express.js
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens), bcryptjs (for password hashing)
*   **API Communication:** RESTful API principles
*   **File Uploads:** Cloudinary, Multer
*   **Environment Variables:** dotenv
*   **Object-Document Mapper (ODM):** Mongoose
*   **Validation:** (Likely custom or using a library within controllers/validators)
*   **Email:** Nodemailer
*   **PDF Generation:** pdfkit
*   **Excel Handling:** xlsx
*   **Development Tooling:** Nodemon, ts-node

## Project Structure

The `src` directory contains the core application code:

*   `app.ts`: The main application entry point, setting up Express, middleware, and routes.
*   `assets/`: Static assets, if any, used by the backend.
*   `config/`: Configuration files (e.g., database connection, environment setup).
*   `controllers/`: Request handlers that process incoming API requests, interact with services/models, and send responses.
*   `middleware/`: Express middleware functions (e.g., authentication checks, error handling, logging).
*   `models/`: Mongoose schemas and models defining the structure of database documents.
*   `routes/`: Express router definitions, mapping API endpoints to controller functions.
*   `services/`: Business logic modules, interacting with external APIs or performing complex operations.
*   `types/`: TypeScript type definitions and interfaces.
*   `utils/`: Utility functions used across the backend.
*   `validators/`: Functions or middleware for validating incoming request data.

## Prerequisites

- Node.js (version >= 18.0.0)
- npm (usually comes with Node.js)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd aicrafters.aicademy/aicrafters-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root of the `aicrafters-backend` directory and add the following environment variables. You can use the `.env.example` file as a template.

```env
# Database Configuration (Example for local development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aicrafters
DB_USER=postgres
DB_PASSWORD=your_password

# MongoDB URI (Required for Render deployment and potentially local use)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret

# Cloudinary Credentials (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini API Key (Required for Mind Map generation)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (URL of the connected frontend application)
FRONTEND_URL=http://localhost:3000 # Or your frontend's URL

# Node Environment
NODE_ENV=development # Change to 'production' for production builds

# Other variables as needed...
```

**Note:** For production deployments (e.g., on Render), ensure the necessary environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `GEMINI_API_KEY`, `FRONTEND_URL`) are set in the hosting environment.

## Available Scripts

-   **`npm start`**: Starts the production server (requires a prior build). Runs `node dist/app.js`.
-   **`npm run dev`**: Starts the development server using `nodemon` for live reloading. Runs `nodemon src/app.ts`.
-   **`npm run build`**: Compiles the TypeScript code to JavaScript in the `dist` directory. Runs `tsc`.

## Build Process

The project uses TypeScript. The `npm run build` script (or `build.sh`) compiles the code located in the `src` directory and outputs the JavaScript files to the `dist` directory, based on the configuration in `tsconfig.json`. The `build.sh` script also copies `package.json` and `package-lock.json` to the `dist` directory.

## Deployment (Render)

This project is configured for deployment on Render using the `render.yaml` file.

-   **Build Command:** `chmod +x build.sh && ./build.sh`
-   **Start Command:** `npm start`

Render will automatically use these commands and the specified environment variables (which need to be configured in the Render service settings) to build and run the application.

## Code Style & Linting

While specific linting configuration (e.g., ESLint, Prettier) isn't explicitly defined in the provided files (besides basic TypeScript checks via `tsconfig.json`), it's recommended to adopt and enforce a consistent code style using tools like ESLint and Prettier for better code quality and maintainability. 