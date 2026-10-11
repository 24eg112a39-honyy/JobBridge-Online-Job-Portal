# JobBridge Frontend

A responsive HTML/CSS/JavaScript frontend for the Spring Boot Online Job Portal backend.

## Files
- `index.html` — page structure
- `style.css` — responsive design
- `app.js` — calls the Spring Boot REST API

## Run it
1. Start MySQL and your Spring Boot backend.
2. Confirm `GET http://localhost:8080/api/jobs` works.
3. Open this folder in VS Code and run `index.html` using the Live Server extension.
4. Live Server commonly uses `http://127.0.0.1:5500` or `http://localhost:5500`.
5. If browser console reports a CORS error, add the exact frontend origin to `@CrossOrigin` in `JobController` and `JobApplicationController`. Example:
   `@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500"})`
6. Reload the page.

## APIs expected
- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/applications`

This frontend does not implement login, role-based access, resume file uploads, or admin controls.
