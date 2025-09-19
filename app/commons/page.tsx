'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type ImageResult = {
  title: string;
  snippet: string;
  url: string | null;
  width?: number;
  height?: number;
  license?: string;
  licenseUrl?: string;
  author?: string;
};

type ApiResponse = {
  results: ImageResult[];
  continue?: Record<string, string>;
  searchinfo?: { totalhits?: number };
};

export default function CommonsSearchPage() {
  const [query, setQuery] = useState('cat');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuation, setContinuation] = useState<Record<string, string> | undefined>(undefined);

  const canLoadMore = useMemo(() => Boolean(continuation?.continue) || Boolean(continuation?.sroffset), [continuation]);

  const search = useCallback(async (opts?: { append?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query, limit: '12' });
      if (opts?.append && continuation) {
        // Pass-through generic continue params (e.g., 'continue', 'sroffset')
        Object.entries(continuation).forEach(([key, value]) => params.set(key, value));
      }
      const res = await fetch(`/api/commons?${params.toString()}`);
      if (!res.ok) throw new Error('Request failed');
      const data: ApiResponse = await res.json();
      setContinuation(data.continue);
      setResults((prev) => (opts?.append ? [...prev, ...data.results] : data.results));
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [query, continuation]);

  useEffect(() => {
    // initial search on mount
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wikimedia Commons Image Search</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 flex-1 min-w-0"
          placeholder="Search for images (e.g., landscape)"
        />
        <button
          onClick={() => search({ append: false })}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((item, idx) => (
          <div key={`${item.title}-${idx}`} className="border rounded overflow-hidden">
            {item.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                No preview
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold truncate" title={item.title}>{item.title}</p>
              <p className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.snippet }} />
              <div className="mt-2 space-y-1">
                <p className="text-xs">License: {item.license}{item.licenseUrl ? (
                  <>
                    {' '}(<a href={item.licenseUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">details</a>)
                  </>
                ) : null}</p>
                <p className="text-xs">Author: <span dangerouslySetInnerHTML={{ __html: item.author || 'Unknown' }} /></p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        {canLoadMore && (
          <button
            onClick={() => search({ append: true })}
            disabled={loading}
            className="mt-6 bg-gray-800 text-white px-4 py-2 rounded"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}


