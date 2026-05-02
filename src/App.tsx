/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingBag, 
  TrendingDown, 
  Star, 
  ChevronRight, 
  Bell, 
  ArrowRightLeft,
  Sparkles,
  ExternalLink,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getProductRecommendations } from "./geminiService";
import { Product, Recommendation } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackedProducts, setTrackedProducts] = useState<Product[]>([]);
  const [preferences, setPreferences] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "track">("search");

  // Load tracked products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tracked_products");
    if (saved) setTrackedProducts(JSON.parse(saved));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!preferences.trim()) return;
    setLoading(true);
    const recs = await getProductRecommendations(preferences);
    setRecommendations(recs);
    setLoading(false);
  };

  const toggleTrackProduct = (product: Product) => {
    const isTracked = trackedProducts.some(p => p.id === product.id);
    let newTracked;
    if (isTracked) {
      newTracked = trackedProducts.filter(p => p.id !== product.id);
    } else {
      newTracked = [...trackedProducts, product];
    }
    setTrackedProducts(newTracked);
    localStorage.setItem("tracked_products", JSON.stringify(newTracked));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">SmartPrice</h1>
          </div>
          <nav className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            <button 
              onClick={() => setActiveTab("search")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "search" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-800"}`}
            >
              Search & Compare
            </button>
            <button 
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "track" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-800"}`}
            >
              Price Tracking
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {activeTab === "search" ? (
          <>
            {/* Search Section */}
            <section className="space-y-6">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Compare Prices Instantly</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto">Found a product? Let us check Amazon and Flipkart to find you the best deal possible.</p>
              </div>
              
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for? (e.g. iPhone 15, Kindle)"
                  className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-slate-200 focus:border-primary outline-none text-lg shadow-sm transition-all pr-16"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Search size={24} />
                </button>
              </form>

              <AnimatePresence mode="wait">
                {products.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8"
                  >
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        status={trackedProducts.some(p => p.id === product.id) ? "tracked" : "none"}
                        onTrack={() => toggleTrackProduct(product)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* AI Recommendation Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
                    <Sparkles size={16} />
                    AI Powered Shopping Assistant
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">Need recommendations?</h3>
                  <p className="text-slate-600">Tell us what you're looking for, your budget, and preferences.</p>
                </div>
                <div className="flex-1 max-w-md flex gap-2">
                  <input 
                    type="text" 
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. Budget laptop for gaming"
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-indigo-200 outline-none focus:ring-2 ring-indigo-500/20"
                  />
                  <button 
                    onClick={loadAIRecommendations}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Ask AI
                  </button>
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 space-y-3 cursor-pointer hover:border-indigo-300 transition-all group"
                      onClick={() => {
                        setQuery(rec.title);
                        // Manual search trigger simulate
                      }}
                    >
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">{rec.category}</span>
                      <h4 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                      <p className="text-slate-500 text-sm">{rec.reason}</p>
                      <div className="flex items-center text-indigo-600 text-sm font-bold gap-1 mt-4">
                        Search now <ChevronRight size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Tracked Products Section */
          <section className="space-y-8 min-h-[60vh]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900">Price Drop Radar</h2>
                <p className="text-slate-500">We're watching these items for you. You'll see a notification when prices drop.</p>
              </div>
              <div className="bg-accent/10 text-accent p-3 rounded-full">
                <Bell size={24} />
              </div>
            </div>

            {trackedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                <TrendingDown size={64} className="text-slate-300" />
                <p className="text-slate-500 text-lg">No products tracked yet.<br/>Search for products and click the heart icon to start tracking.</p>
                <button 
                  onClick={() => setActiveTab("search")}
                  className="text-primary font-bold hover:underline"
                >
                  Go to search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trackedProducts.map(product => (
                  <TrackedItemCard 
                    key={product.id} 
                    product={product} 
                    onRemove={() => toggleTrackProduct(product)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer Instructions for Beginner */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">How it Works</h4>
            <p className="text-sm">This app simulates price scraping. In a real app, you'd use APIs or web scrapers (like Puppeteer) to get live data from stores.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">AI Integration</h4>
            <p className="text-sm">We use the Gemini API to understand what you need and suggest items. It's like having a smart friend who knows all the brands.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">Price Tracking</h4>
            <p className="text-sm">Currently, we save your tracked items in your browser's "Local Storage", so they stay there even if you refresh!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onTrack: () => void;
  status: "tracked" | "none";
  key?: React.Key;
}

function ProductCard({ product, onTrack, status }: ProductCardProps) {
  const diff = product.amazonPrice - product.flipkartPrice;
  const bestDeal = diff > 0 ? "Flipkart" : "Amazon";
  const iconColor = status === "tracked" ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500";

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all duration-300 flex">
      <div className="w-1/3 relative overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <button 
          onClick={onTrack}
          className={`absolute top-3 left-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg z-10 transition-colors ${iconColor}`}
        >
          <Bell size={20} className={status === "tracked" ? "fill-current" : ""} />
        </button>
      </div>
      
      <div className="flex-1 p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest">
            {product.category}
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 text-accent">
            <Star size={14} className="fill-current" />
            <span className="text-sm font-bold">{product.rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-2xl border-2 transition-all ${bestDeal === "Amazon" ? "border-amazon/30 bg-amazon/5 scale-105" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Amazon</span>
            <span className="text-xl font-black text-slate-800">${product.amazonPrice}</span>
          </div>
          <div className={`p-3 rounded-2xl border-2 transition-all ${bestDeal === "Flipkart" ? "border-flipkart/30 bg-flipkart/5 scale-105" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Flipkart</span>
            <span className="text-xl font-black text-slate-800">${product.flipkartPrice}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
            Save ${Math.abs(diff)} on {bestDeal}
          </div>
          <button className="flex items-center gap-1 text-primary font-bold text-sm hover:underline">
            View Deal <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TrackedItemCardProps {
  product: Product;
  onRemove: () => void;
  key?: React.Key;
}

function TrackedItemCard({ product, onRemove }: TrackedItemCardProps) {
  // Simulate price history
  const history = [
    { date: "May 1", price: product.amazonPrice + 50 },
    { date: "May 2", price: product.amazonPrice }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex gap-4">
        <img src={product.image} className="w-20 h-20 rounded-2xl object-cover" />
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-800 truncate">{product.name}</h4>
          <p className="text-xs text-slate-400">Current Best: <span className="text-green-600 font-bold">${Math.min(product.amazonPrice, product.flipkartPrice)}</span></p>
          <div className="mt-2 flex items-center gap-4">
             <div className="flex items-center gap-1 text-xs text-slate-500">
               <Bell size={12} className="text-primary" /> Watching
             </div>
             <button onClick={onRemove} className="text-xs text-red-500 font-bold hover:underline">Stop tracking</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 tracking-wider">
          <div className="flex items-center gap-1"><History size={14} /> Price History</div>
          <TrendingDown size={14} className="text-green-500" />
        </div>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-sm">
              <span className="text-slate-500 font-medium">{h.date}</span>
              <span className="text-slate-800 font-bold">${h.price}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
        Go to Shop <ArrowRightLeft size={18} />
      </button>
    </div>
  );
}
