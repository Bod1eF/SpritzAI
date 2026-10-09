import categories from './categories.json';

export const buildDupePrompt = (text: string, image: string | null): string => `
    You are a fragrance analysis expert.
    Given this text from a page containing a fragrance below (and potential image link),
    do three things and respond STRICTLY in JSON format:

    1. Write a concise 2 to 3 sentence product description that could be used on a product page.
    2. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    3. Standardize and extract the exact full link to the product image from either the text or the candidate image link, choosing whichever is more likely to be the
    core product image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    Fragrance page: ${text}
    Candidate image: ${image}
`;

export const buildFrangrancePrompt = (name: string, text: string, image: string | null, price: string | number | null): string => `
    You are a fragrance analysis expert.
    Given the following fragrance information, do five things and respond STRICTLY in JSON format:

    1. Standardize and extract the name of the fragrance.
    2. Categorize it strictly as exactly one of the following: ${categories.join(', ')}.
    3. Write a concise 2 to 3 sentence product description that could be used on a product page. 
    4. Standardize and extract the price (just the numerical value). If no price is found, set the "price" value to null.
    5. Standardize and extract the exact full link to the image. If no image link is found, set the "image" value to null.

    Your ENTIRE response MUST be a valid JSON object with the following keys: "name", "category", "copy", "price", and "image" that can be passed as a valid input to JSON.parse(). Do not include any other text or formatting outside of this JSON object.

    (potentially malformed) Fragrance Info:
    Name: ${name}
    Description: ${text}
    Image: ${image}
    Price: ${price}
`;