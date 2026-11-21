import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RSS_SOURCES = [
  {
    name: 'ShiftDelete.Net',
    url: 'https://shiftdelete.net/etiket/elektrikli-otomobil/feed',
    filterEv: false,
  },
  {
    name: 'ShiftDelete.Net',
    url: 'https://shiftdelete.net/etiket/togg/feed',
    filterEv: false,
  },
  {
    name: 'LOG Dergisi',
    url: 'https://www.log.com.tr/etiket/elektrikli-otomobil/feed/',
    filterEv: false,
  },
  {
    name: 'LOG Dergisi',
    url: 'https://www.log.com.tr/etiket/togg/feed/',
    filterEv: false,
  },
  {
    name: 'Motor1 Türkiye',
    url: 'https://tr.motor1.com/rss/news/all/',
    filterEv: true,
  },
];

const UNIQUE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
];

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function decodeEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanHtmlText(rawHtml: string): string {
  const decoded = decodeEntities(rawHtml);
  return decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/The post[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractOriginalImage(itemXml: string): string | null {
  // 1. <media:content url="..." />
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch?.[1]) return decodeEntities(mediaMatch[1]);

  // 2. <enclosure url="..." type="image/..." />
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch?.[1]) return decodeEntities(enclosureMatch[1]);

  // 3. <media:thumbnail url="..." />
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumbMatch?.[1]) return decodeEntities(thumbMatch[1]);

  // 4. <img ... src="..." /> inside <description> or <content:encoded>
  const srcsetMatch = itemXml.match(/srcset=["'][^"']*?(https?:\/\/[^\s"',]+-(?:1000x\d+|660x\d+)\.(?:jpg|jpeg|png|webp))/i);
  if (srcsetMatch?.[1]) return decodeEntities(srcsetMatch[1]);

  const imgMatch = itemXml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch?.[1]) return decodeEntities(imgMatch[1]);

  return null;
}

function classifyTag(title: string) {
  const lower = title.toLowerCase();
  if (['togg', 't10x', 't10f', 'trugo'].some((k) => lower.includes(k))) {
    return { tag: 'TOGG & YERLİ', tagBg: 'bg-cyan-600 text-white' };
  }
  if (['tesla', 'model y', 'model 3', 'fsd', 'supercharger'].some((k) => lower.includes(k))) {
    return { tag: 'TESLA GÜNDEMİ', tagBg: 'bg-red-600 text-white' };
  }
  if (['byd', 'seal', 'atto', 'dolphin', 'chery', 'mg4', 'kia', 'hyundai', 'mercedes', 'bmw', 'volvo'].some((k) => lower.includes(k))) {
    return { tag: 'YENİ MODELLER', tagBg: 'bg-amber-600 text-white' };
  }
  if (['şarj', 'zes', 'eşarj', 'istasyon', 'batarya', 'menzil'].some((k) => lower.includes(k))) {
    return { tag: 'ŞARJ & BATARYA', tagBg: 'bg-emerald-600 text-white' };
  }
  if (['satış', 'odmd', 'rekor', 'pazar', 'vergi', 'ötv', 'fiyat'].some((k) => lower.includes(k))) {
    return { tag: 'PAZAR & ANALİZ', tagBg: 'bg-blue-600 text-white' };
  }
  return { tag: 'EV GÜNDEM', tagBg: 'bg-cyan-600 text-white' };
}

function formatTurkishDate(pubDateStr: string): { formatted: string; timestamp: number } {
  try {
    const dt = new Date(pubDateStr);
    if (isNaN(dt.getTime())) throw new Error('Invalid');
    return {
      formatted: `${dt.getDate()} ${TURKISH_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`,
      timestamp: dt.getTime(),
    };
  } catch {
    const now = new Date();
    return {
      formatted: `${now.getDate()} ${TURKISH_MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      timestamp: now.getTime(),
    };
  }
}

export async function GET() {
  const jsonFilePath = path.join(process.cwd(), 'public', 'data', 'ev_haberleri.json');

  try {
    const responses = await Promise.allSettled(
      RSS_SOURCES.map(async (src) => {
        const res = await fetch(src.url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        return { sourceName: src.name, filterEv: src.filterEv, xml };
      })
    );

    const rawItems: Array<{
      title: string;
      description: string;
      source: string;
      url: string;
      date: string;
      timestamp: number;
      tag: string;
      tagBg: string;
      imageUrl: string;
    }> = [];

    const seenTitles = new Set<string>();
    const usedImages = new Set<string>();
    let fallbackIdx = 0;

    for (const r of responses) {
      if (r.status !== 'fulfilled') continue;
      const { sourceName, filterEv, xml } = r.value;
      const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

      for (const itemXml of itemBlocks) {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

        const title = titleMatch ? cleanHtmlText(titleMatch[1]) : '';
        const url = linkMatch ? decodeEntities(linkMatch[1].trim()) : '';
        const pubDateRaw = pubDateMatch ? pubDateMatch[1].trim() : '';
        const descClean = descMatch ? cleanHtmlText(descMatch[1]) : '';

        if (!title || title.length < 18) continue;

        if (filterEv) {
          const evKeywords = ['elektrikli', 'togg', 'tesla', 'byd', 'şarj', 'batarya', 'ev ', 'hibrit', 'menzil'];
          const combined = `${title} ${descClean}`.toLowerCase();
          if (!evKeywords.some((k) => combined.includes(k))) continue;
        }

        const normKey = title.slice(0, 40).toLowerCase();
        if (seenTitles.has(normKey)) continue;

        const originalImg = extractOriginalImage(itemXml);
        let finalImg = originalImg;

        // Eğer resimsizse veya aynı görsel daha önce kullanıldıysa benzersiz görsel ata
        if (!finalImg || usedImages.has(finalImg)) {
          while (
            fallbackIdx < UNIQUE_FALLBACK_IMAGES.length &&
            usedImages.has(UNIQUE_FALLBACK_IMAGES[fallbackIdx])
          ) {
            fallbackIdx++;
          }
          finalImg =
            UNIQUE_FALLBACK_IMAGES[fallbackIdx % UNIQUE_FALLBACK_IMAGES.length];
          fallbackIdx++;
        }

        seenTitles.add(normKey);
        usedImages.add(finalImg);

        const { formatted, timestamp } = formatTurkishDate(pubDateRaw);
        const { tag, tagBg } = classifyTag(title);

        const description =
          descClean && descClean.length > 25
            ? descClean.slice(0, 210) + (descClean.length > 210 ? '...' : '')
            : `${sourceName} tarafından paylaşılan habere göre elektrikli otomobil ve şarj ekosistemindeki son gelişmeler aktarıldı.`;

        rawItems.push({
          title,
          description,
          source: sourceName,
          url,
          date: formatted,
          timestamp,
          tag,
          tagBg,
          imageUrl: finalImg,
        });
      }
    }

    // Tarihe göre en yeniden en eskiye sırala
    rawItems.sort((a, b) => b.timestamp - a.timestamp);

    const articles = rawItems.slice(0, 12).map((item, idx) => ({
      id: idx + 1,
      title: item.title,
      description: item.description,
      source: item.source,
      url: item.url,
      date: item.date,
      read_time: `${3 + (idx % 4)} dk okuma`,
      tag: item.tag,
      tagBg: item.tagBg,
      imageUrl: item.imageUrl,
    }));

    if (articles.length >= 4) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const updatedStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const payload = {
        metadata: {
          source: 'ShiftDelete, LOG & Motor1 TR (Orijinal Görselli Canlı RSS)',
          is_live: true,
          updated_at: updatedStr,
          total_count: articles.length,
        },
        hero_slides: articles.slice(0, 4),
        news_list: articles.slice(4, 10),
        all_articles: articles,
      };

      try {
        fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
        fs.writeFileSync(jsonFilePath, JSON.stringify(payload, null, 2), 'utf-8');
      } catch {
        // Ignore write error
      }

      return NextResponse.json(payload);
    }
  } catch {
    // Fallback to saved JSON
  }

  try {
    if (fs.existsSync(jsonFilePath)) {
      const raw = fs.readFileSync(jsonFilePath, 'utf-8');
      return NextResponse.json(JSON.parse(raw));
    }
  } catch {
    // Ignore
  }

  return NextResponse.json({ error: 'News unavailable' }, { status: 503 });
}
