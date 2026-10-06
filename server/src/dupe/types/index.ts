export interface ProductDetails {
  name: string;
  image: string;
  description: string;
  price: string;
  structured?: boolean;
}

export interface DupePage {
  text: string;
  image: string;
}

export type ScrapedPage = ProductDetails & { text: string };

export interface DupeResult {
  dupe: string;
  category: string;
  dupelink: string | null;
  dupebrand: string | null;
}

export interface FindDupesRequest {
  // `any` so tsoa doesn't reject missing/non-string values with its own 422;
  // the service keeps your original 400 check.
  url?: any;
}

export interface ErrorResponse {
  error: string;
}

export interface FindDupesResponse {
  targetName: string;
  targetCategory: string;
  targetCopy?: string;
  targetImage?: string;
  targetPrice?: string | number;
  dupeName?: string;
  dupeCategory?: string;
  dupeLink?: string;
  dupeBrand?: string;
  dupeCopy?: string;
  dupeImage?: string;
  dupePrice?: string | number;
}

export interface LLMResult {
  name: string;
  category: string;
  copy?: string;
  image?: string;
  price?: string | number;
}

export interface DupeAnalysis {
  copy?: string;
  image?: string;
  price?: string | number;
}

// Thrown by the service, translated to a status code by the controller
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}