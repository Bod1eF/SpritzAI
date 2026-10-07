export interface ProductDetails {
  name: string;
  image: string;
  text: string;
  price: string;
}

export type ProductPage = ProductDetails & { structured?: boolean; };

export interface Dupe {
  name: string;
  category: string;
  link: string | null;
  brand: string | null;
}

export interface TargetAnalysis {
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

export interface FindDupesRequest {
  url?: any;
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

export interface ErrorResponse {
  error: string;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}