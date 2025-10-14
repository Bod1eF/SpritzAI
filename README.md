# CruzHacks2025
Team Members: Bodie, Luis, Paul, Judy

Project Name: SpritzAI

# SpritzAI – Affordable Alternatives to Luxury Fragrances

**SpritzAI** is a web application built to help users find affordable alternatives—or "dupes"—for high-end perfumes and colognes. Aimed at students, budget-conscious shoppers, and everyday consumers who love great scents without the luxury markup, the app uses AI and web scraping to deliver personalized recommendations. Users simply paste the URL of a luxury fragrance product into the app, and it returns similar-smelling, budget-friendly options along with images, detailed information, and database-generated comparisons.

---

## How It Works

1. **User Input**: The user enters a URL of a high-end fragrance product.
2. **Web Scraping**: The backend uses **Puppeteer** to scrape the product page's HTML.
3. **Fragrance Analysis**: The HTML is sent to the **Gemini API**, which identifies the product name and classifies it into a predefined scent category (e.g., floral, woody, citrus).
4. **Database Lookup**: The backend queries a **PostgreSQL** database (running in a Docker container) to find exact or category-based dupes.
5. **AI-Powered Results**: If matches are found, they’re returned to the user along with product images, purchase links, and LLM-generated descriptions and comparisons.
   
---

## Tech Stack

### Frontend
- [React.js](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/) (for styling)

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

## 🚀 Running the App

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
