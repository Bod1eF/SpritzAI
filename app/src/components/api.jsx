export async function getDupe(url, setDupeResult, setApiFailed, setLoading, setSearchURL) {
  try {
    const response = await fetch('http://localhost:3000/api/scrape', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('API call failed');
    const json = await response.json();

    setDupeResult(json);
    setApiFailed(false);
  } catch (error) {
    setApiFailed(true);
    setDupeResult(null);
  } finally {
    setLoading(false);
    setSearchURL(null);
  }
}

// {
//   "targetName": "Chanel Chance Eau Fraîche Eau de Parfum",
//   "targetCategory": "Fresh Woody Floral Light",
//   "targetCopy": "Experience the woody floral-sparkling expression of CHANEL CHANCE EAU FRAÎCHE Eau de Parfum. Opening with zesty citron and unveiling a luminous jasmine heart, it settles into a vibrant, ambery teak wood trail for an invigorating encounter. Seize this chance for $110.00.",
//   "targetImage": "https://media.ulta.com/i/ulta/2623325?w=500&h=500",
//   "targetPrice": "110.00",
//   "dupeName": "Coconut Ice Cream Gelato",
//   "dupeCategory": "Fresh Woody Floral Light",
//   "dupeLink": "https://theduabrand.com/collections/all-fragrances/products/coconut-ice-cream-gelato?variant=39387079213233",
//   "dupeBrand": "Dua Fragrances",
//   "dupeCopy": "Relive nostalgic moments with Coconut Ice Cream Gelato, a simple yet profound gourmand fragrance. Notes of Bergamot, Vanilla Ice Cream, Coconut Gelato, and Spun Sugar create an unapologetically sweet and comforting scent. This unisex Extrait de Parfum is perfect for cozy moments when you crave something sweet.",
//   "dupeImage": "https://theduabrand.com/cdn/shop/products/16337032-optimized-Coconut_Ice_Cream_Gelato_fronted.webp?v=1728378785",
//   "dupePrice": "65.00"
// }
// ${targetName}
// ${targetCategory}
// ${targetCopy}
// ${targetImage}
// ${targetPrice}
// ${dupeName}
// ${dupeCategory}
// ${dupeLink}
// ${dupeBrand}
// ${dupeCopy}
// ${dupeImage}
// ${dupePrice}


