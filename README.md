Based on a [project](https://github.com/paulleeisme06/CruzHacks2025) created for CruzHacks 2025 by Bodie, Luis, Paul, and Judy

# SpritzAI – Affordable Alternatives to Luxury Fragrances

**SpritzAI** is a web app built to help users find affordable alternatives—or "dupes"—for high-end perfumes and colognes. Users simply paste the URL of a luxury fragrance product into the app, and it returns similar-smelling, budget-friendly options.

---

## How It Works

1. **User Input**: The user enters a URL of their desired high-end fragrance.
2. **Exact Match Check**: The product is checked against our database of 2,000+ exact matches.
3. **Fragrance Analysis**: If no exact match is found, key metadata is scraped from the inputted product page, parsed, and analysed with an LLM to identify the product's key notes (e.g., floral, woody, citrus) to form a scent profile.
5. **Results**: Exact matches or up to 3 recommended fragrances with similar scent profiles are presented to the user with the category, description, and similarity score.
   
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
## Application Structure

- `client/`: React frontend
- `server/`: Node/Express backend
- `docker/`: Docker Compose & PostgreSQL setup
- `db/`: Database schema and dupe data

---

## Running the App

To run the app locally:

```bash
# Stop and remove existing volumes
docker-compose -f ./docker/docker-compose.yml down --volumes

# Start PostgreSQL DB
npm run db

# Start backend server and frontend
npm run dev

#Start frontend (make sure all required components are installed, look in json file)
npm start
