import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


// Optional: edge runtime can be faster for simple fetch + transform
// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || 'cat').trim();
  const limit = searchParams.get('limit') || '12';
  const sroffset = searchParams.get('sroffset');
  const cont = searchParams.get('continue');

  const apiUrl = new URL('https://commons.wikimedia.org/w/api.php');
  apiUrl.searchParams.set('action', 'query');
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('origin', '*');
  apiUrl.searchParams.set('list', 'search');
  apiUrl.searchParams.set('srsearch', query);
  apiUrl.searchParams.set('srnamespace', '6'); // Files only
  apiUrl.searchParams.set('srlimit', limit);
  if (sroffset) apiUrl.searchParams.set('sroffset', sroffset);
  if (cont) apiUrl.searchParams.set('continue', cont);

  try {
    const response = await fetch(apiUrl.toString(), {
      // A UA helps Wikimedia debugging and is good API citizenship
      headers: {
        'User-Agent': 'HE-next Wikimedia Commons integration (https://example.com)'
      }
    });
    if (!response.ok) {
      throw new Error(`Commons search failed with status ${response.status}`);
    }
    const data = await response.json();

    const results: Array<{ title: string; snippet: string }> = data?.query?.search || [];

    // Fetch image info for each result in parallel
    const imagePromises = results.map(async (item) => {
      const title = item.title.startsWith('File:') ? item.title : `File:${item.title}`;

      const infoUrl = new URL('https://commons.wikimedia.org/w/api.php');
      infoUrl.searchParams.set('action', 'query');
      infoUrl.searchParams.set('format', 'json');
      infoUrl.searchParams.set('origin', '*');
      infoUrl.searchParams.set('prop', 'imageinfo');
      infoUrl.searchParams.set('titles', title);
      infoUrl.searchParams.set('iiprop', 'url|extmetadata|dimensions');
      infoUrl.searchParams.set('iiurlwidth', '480'); // Reasonable thumbnail width

      const infoResponse = await fetch(infoUrl.toString(), {
        headers: {
          'User-Agent': 'HE-next Wikimedia Commons integration (https://example.com)'
        }
      });
      if (!infoResponse.ok) return null;
      const infoData = await infoResponse.json();
      const pages = infoData?.query?.pages || {};
      const pageKey = Object.keys(pages)[0];
      const imageInfo = pages?.[pageKey]?.imageinfo?.[0];

      const displayUrl = imageInfo?.thumburl || imageInfo?.url || null;
      const width = imageInfo?.thumbwidth || imageInfo?.width;
      const height = imageInfo?.thumbheight || imageInfo?.height;
      const license = imageInfo?.extmetadata?.LicenseShortName?.value || 'Unknown';
      const licenseUrl = imageInfo?.extmetadata?.LicenseUrl?.value;
      const author = imageInfo?.extmetadata?.Artist?.value || 'Unknown';

      return {
        title: item.title,
        snippet: item.snippet,
        url: displayUrl,
        width,
        height,
        license,
        licenseUrl,
        author
      };
    });

    const enrichedResults = (await Promise.all(imagePromises)).filter(Boolean);

    return NextResponse.json({
      results: enrichedResults,
      continue: data?.continue,
      searchinfo: data?.query?.searchinfo
    });
  } catch (error) {
    console.error('Commons API error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}


