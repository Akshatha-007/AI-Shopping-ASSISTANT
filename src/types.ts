/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  amazonPrice: number;
  flipkartPrice: number;
  rating: number;
  category: string;
  image: string;
  priceHistory: { date: string; price: number }[];
}

export interface Recommendation {
  title: string;
  reason: string;
  category: string;
}
