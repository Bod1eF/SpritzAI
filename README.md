Based on a [project](https://github.com/paulleeisme06/CruzHacks2025) created for CruzHacks 2025 by Bodie, Luis, Paul, and Judy

# SpritzAI – Affordable Alternatives to Luxury Fragrances

**SpritzAI** is a web app built to help users find affordable alternatives—or "dupes"—for high-end perfumes and colognes. Users simply paste the URL of a luxury fragrance product into the app, and it returns similar-smelling, budget-friendly options.

---

## How It Works

1. **User Input**: The user enters a URL of their desired high-end fragrance.
2. **Exact Match Check**: The product is checked against our database of 2,000+ exact matches (aggregated from various google sheets, wikis, and forums created by fragrance communties across the internet)
3. **Fragrance Analysis**: If no exact match is found, key metadata is scraped from the inputted product page, parsed, and analysed with an LLM to identify the product's key notes (e.g., floral, woody, citrus) to form a scent profile.
4. **Results**: Exact matches or up to 3 recommended fragrances with similar scent profiles are presented to the user with the category, description, and similarity score.

---

## Tech Stack

### Frontend

- [React.js](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Puppeteer](https://pptr.dev/)
- [Gemini API](https://deepmind.google/technologies/gemini/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [OpenAPI 3.0](https://swagger.io/specification/)

---

## Running the App

**Prerequisites:** Node.js and Docker.

### First-time setup

1. Install dependencies for the root, server, and app:

```bash
   npm run install:all
```

2. Create `server/.env`. The backend loads it via `dotenv` at startup, so both values are required:

```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fragrancefinder
   # API key for the Gemini model used to analyze fragrances (get one at https://aistudio.google.com/apikey):
   GEMINI_API_KEY=your_gemini_api_key_here
```

### Run locally

From the repo root:

```bash
npm run dev
```

### Database

```bash
npm run db:reset  
npm run db:down   
```

### Production build

```bash
npm run build
npm start          # serves the compiled backend from server/dist
```
