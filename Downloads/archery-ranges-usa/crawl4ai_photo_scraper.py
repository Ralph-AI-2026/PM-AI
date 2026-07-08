#!/usr/bin/env python3
"""
crawl4ai_photo_scraper.py
─────────────────────────
Finds real photos for US archery clubs that still have the Unsplash placeholder.

Strategy:
  1. Parse the CSV export → find clubs with the placeholder image
  2. Skip clubs that already have a local photo in state-range-photos/
  3. For clubs WITH a website → crawl4ai extracts images from the site
  4. For clubs WITHOUT a website → crawl4ai searches DuckDuckGo Images
  5. Pick the best hero/range photo, download it, save mapping

Usage:
  python crawl4ai_photo_scraper.py                     # all states
  python crawl4ai_photo_scraper.py --states "Mississippi,Louisiana,Nevada"
  python crawl4ai_photo_scraper.py --limit 50          # first 50 clubs
  python crawl4ai_photo_scraper.py --no-website-only   # only clubs missing a website (DDG search)
"""

import asyncio
import csv
import os
import re
import sys
import json
import argparse
import time
import hashlib
from pathlib import Path
from urllib.parse import quote_plus, urlparse

try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
except ImportError:
    print("ERROR: crawl4ai not installed. Run: pip install crawl4ai")
    sys.exit(1)

try:
    import aiohttp
except ImportError:
    print("ERROR: aiohttp not installed. Run: pip install aiohttp")
    sys.exit(1)

# ─── Config ───────────────────────────────────────────────────────────────────
PLACEHOLDER_URL = "https://images.unsplash.com/photo-1574607774561-e645c79a2478"
CSV_FILE = "us-listings-export-2026-07-06.csv"
PHOTO_DIR = "state-range-photos"
MAPPING_FILE = "crawl4ai_photo_mapping.csv"
RESULTS_LOG = "crawl4ai_photo_results.jsonl"

# Image filtering
SKIP_PATTERNS = [
    "logo", "icon", "favicon", "avatar", "badge", "button", "banner-ad",
    "sprite", "pixel", "tracking", "analytics", "advertisement", ".svg",
    "facebook.com", "twitter.com", "instagram.com", "linkedin.com",
    "google-analytics", "googletagmanager", "doubleclick", "adsense",
    "1x1", "spacer", "blank", "placeholder", "stock-photo",
]

# Prefer images with these keywords in URL/alt
PREFER_PATTERNS = [
    "archery", "range", "target", "bow", "arrow", "shoot", "indoor",
    "outdoor", "3d", "course", "field", "club", "facility", "building",
    "exterior", "interior", "hero", "main", "header", "banner",
]

MIN_IMAGE_SCORE = 0  # crawl4ai relevance score threshold


def state_to_slug(state_name):
    """Convert 'New Hampshire' -> 'new-hampshire'"""
    return state_name.lower().replace(" ", "-")


def sanitize_filename(name):
    """Clean up club name for filename."""
    # Remove special chars but keep spaces for readability
    clean = re.sub(r'[^\w\s\-\(\)]', '', name).strip()
    return clean[:80]  # Cap length


def get_existing_photos(state_slug):
    """Return set of photo filenames already in a state's photo folder."""
    state_dir = os.path.join(PHOTO_DIR, state_slug)
    if not os.path.isdir(state_dir):
        return set()
    return {f for f in os.listdir(state_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))}


def club_has_local_photo(club_name, city, state_slug, existing_photos):
    """Check if a club already has a downloaded photo (fuzzy match on filename)."""
    name_lower = club_name.lower()
    city_lower = (city or "").lower()
    for photo in existing_photos:
        photo_lower = photo.lower()
        # Match by club name or city in filename
        if name_lower[:20] in photo_lower or (city_lower and city_lower in photo_lower and name_lower[:10] in photo_lower):
            return True
    return False


def score_image(img_dict, club_name, city):
    """Score an image candidate. Higher = better."""
    src = img_dict.get("src", "")
    alt = img_dict.get("alt", "")
    score = img_dict.get("score", 0)

    src_lower = src.lower()
    alt_lower = alt.lower()
    combined = f"{src_lower} {alt_lower}"

    # Disqualify
    for skip in SKIP_PATTERNS:
        if skip in src_lower:
            return -100

    # Must be a real URL
    if not src.startswith("http"):
        return -100

    # Penalize tiny images (data URIs, 1x1 pixels)
    width = img_dict.get("width", 0)
    height = img_dict.get("height", 0)
    if width and height:
        if width < 100 or height < 100:
            return -50
        if width >= 400 and height >= 250:
            score += 10  # Good size

    # Boost for archery-related keywords
    for pref in PREFER_PATTERNS:
        if pref in combined:
            score += 5

    # Boost if club name appears in alt text
    club_words = club_name.lower().split()
    for word in club_words:
        if len(word) > 3 and word in alt_lower:
            score += 3

    # Boost if city appears
    if city and city.lower() in combined:
        score += 3

    # Boost for common image formats
    if any(ext in src_lower for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        score += 2

    # Penalize unsplash/stock
    if "unsplash" in src_lower or "stock" in src_lower or "shutterstock" in src_lower:
        return -100

    return score


async def download_image(session, url, filepath, referer=None, timeout=20):
    """Download an image to disk. Returns True on success."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        if referer:
            headers["Referer"] = referer
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout), headers=headers, ssl=False, allow_redirects=True) as resp:
            if resp.status == 200:
                content_type = resp.headers.get("Content-Type", "")
                data = await resp.read()
                # Accept if image content type OR data looks like an image (>3KB)
                if ("image" in content_type or len(data) > 3000) and len(data) > 3000:
                    # Verify it's not an HTML error page
                    if not data[:50].lstrip().startswith(b'<') or b'<!DOCTYPE' not in data[:100]:
                        os.makedirs(os.path.dirname(filepath), exist_ok=True)
                        with open(filepath, "wb") as f:
                            f.write(data)
                        return True
    except Exception as e:
        pass
    return False


def get_file_extension(url):
    """Extract file extension from URL."""
    parsed = urlparse(url)
    path = parsed.path.lower()
    if '.png' in path:
        return 'png'
    elif '.webp' in path:
        return 'webp'
    elif '.jpeg' in path:
        return 'jpeg'
    return 'jpg'


async def crawl_club_website(crawler, club, crawler_config):
    """Crawl a club's website to find images."""
    website = club.get("website", "").strip()
    if not website:
        return []

    # Ensure URL has scheme
    if not website.startswith("http"):
        website = "https://" + website

    try:
        result = await crawler.arun(url=website, config=crawler_config)
        if result.success and result.media:
            images = result.media.get("images", [])
            return images
    except Exception as e:
        pass

    return []


async def search_for_images(crawler, club_name, city, state, crawler_config):
    """Search Bing Images for photos of the club (no JS needed)."""
    query = f"{club_name} archery {city} {state}"
    images = []

    # Strategy A: Bing Images (HTML, no JS required)
    try:
        bing_url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2&first=1"
        bing_config = CrawlerRunConfig(
            page_timeout=15000,
            screenshot=False,
        )
        result = await crawler.arun(url=bing_url, config=bing_config)
        if result.success and result.media:
            imgs = result.media.get("images", [])
            if imgs:
                return imgs
    except Exception:
        pass

    # Strategy B: DDG HTML lite search
    try:
        ddg_url = f"https://html.duckduckgo.com/html/?q={quote_plus(query + ' archery range photo')}"
        result = await crawler.arun(url=ddg_url, config=crawler_config)
        if result.success and result.media:
            imgs = result.media.get("images", [])
            if imgs:
                return imgs
    except Exception:
        pass

    return images


async def process_club(crawler, session, club, crawler_config, state_slug):
    """Process a single club: crawl → pick best image → download."""
    name = club["name"]
    city = club.get("city", "")
    state = club.get("state", "")
    website = club.get("website", "").strip()
    club_id = club.get("id", "")

    result_entry = {
        "id": club_id,
        "name": name,
        "city": city,
        "state": state,
        "website": website,
        "source": None,
        "image_url": None,
        "status": "no_image_found",
        "local_path": None,
    }

    images = []

    # Strategy 1: Crawl club website
    if website:
        images = await crawl_club_website(crawler, club, crawler_config)
        if images:
            result_entry["source"] = "website"

    # Strategy 2: Web image search if no website or no images found from website
    if not images:
        images = await search_for_images(crawler, name, city, state, crawler_config)
        if images:
            result_entry["source"] = "image_search"

    if not images:
        return result_entry

    # Score and rank images
    scored = [(score_image(img, name, city), img) for img in images]
    scored.sort(key=lambda x: x[0], reverse=True)

    # Build referer from website
    referer = website if website and website.startswith("http") else None

    # Try downloading top candidates
    for score_val, img in scored[:10]:  # Try top 10
        if score_val < -10:
            continue

        src = img.get("src", "")
        if not src.startswith("http"):
            continue

        ext = get_file_extension(src)
        safe_city = city if city else "unknown"
        filename = f"{sanitize_filename(name)} ({safe_city}).{ext}"
        filepath = os.path.join(PHOTO_DIR, state_slug, filename)

        success = await download_image(session, src, filepath, referer=referer)
        if success:
            result_entry["status"] = "downloaded"
            result_entry["image_url"] = src
            result_entry["local_path"] = filepath
            return result_entry

    result_entry["status"] = "download_failed"
    return result_entry


async def main():
    parser = argparse.ArgumentParser(description="Crawl4AI photo scraper for US archery clubs")
    parser.add_argument("--states", type=str, help="Comma-separated list of states to process")
    parser.add_argument("--limit", type=int, default=0, help="Max number of clubs to process (0=all)")
    parser.add_argument("--no-website-only", action="store_true", help="Only process clubs without a website")
    parser.add_argument("--website-only", action="store_true", help="Only process clubs that have a website")
    parser.add_argument("--batch-size", type=int, default=5, help="Number of concurrent crawls")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between batches (seconds)")
    args = parser.parse_args()

    # ── 1. Load CSV ──────────────────────────────────────────────────────────
    print(f"Loading {CSV_FILE}...")
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)
    print(f"  Total listings: {len(all_rows)}")

    # ── 2. Filter to placeholder clubs ───────────────────────────────────────
    placeholder_clubs = [r for r in all_rows if PLACEHOLDER_URL in r.get("post_images", "")]
    print(f"  Clubs with placeholder: {len(placeholder_clubs)}")

    # ── 3. Filter by state if requested ──────────────────────────────────────
    if args.states:
        target_states = {s.strip() for s in args.states.split(",")}
        placeholder_clubs = [r for r in placeholder_clubs if r["state"] in target_states]
        print(f"  After state filter ({args.states}): {len(placeholder_clubs)}")

    # ── 4. Filter by website availability ────────────────────────────────────
    if args.no_website_only:
        placeholder_clubs = [r for r in placeholder_clubs if not r.get("website", "").strip()]
        print(f"  After no-website filter: {len(placeholder_clubs)}")
    elif args.website_only:
        placeholder_clubs = [r for r in placeholder_clubs if r.get("website", "").strip()]
        print(f"  After website-only filter: {len(placeholder_clubs)}")

    # ── 5. Skip clubs that already have a local photo ────────────────────────
    # Build per-state photo index
    photo_index = {}
    for state_dir in os.listdir(PHOTO_DIR) if os.path.isdir(PHOTO_DIR) else []:
        full = os.path.join(PHOTO_DIR, state_dir)
        if os.path.isdir(full):
            photo_index[state_dir] = get_existing_photos(state_dir)

    clubs_to_process = []
    skipped_existing = 0
    for club in placeholder_clubs:
        state_slug = state_to_slug(club["state"])
        existing = photo_index.get(state_slug, set())
        if club_has_local_photo(club["name"], club.get("city", ""), state_slug, existing):
            skipped_existing += 1
        else:
            clubs_to_process.append(club)

    print(f"  Skipped (already have local photo): {skipped_existing}")
    print(f"  Clubs to process: {len(clubs_to_process)}")

    # ── 6. Apply limit ──────────────────────────────────────────────────────
    if args.limit > 0:
        clubs_to_process = clubs_to_process[:args.limit]
        print(f"  After limit: {len(clubs_to_process)}")

    if not clubs_to_process:
        print("\nNo clubs to process. Done!")
        return

    # ── 7. Run crawl4ai ──────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"Starting crawl4ai photo scraper for {len(clubs_to_process)} clubs...")
    print(f"Batch size: {args.batch_size} | Delay: {args.delay}s")
    print(f"{'='*60}\n")

    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080,
    )

    crawler_config = CrawlerRunConfig(
        page_timeout=25000,
        screenshot=False,
        remove_overlay_elements=True,
    )

    stats = {"downloaded": 0, "no_image_found": 0, "download_failed": 0, "errors": 0}
    all_results = []

    async with aiohttp.ClientSession() as session:
        async with AsyncWebCrawler(config=browser_config) as crawler:
            # Process in batches
            for i in range(0, len(clubs_to_process), args.batch_size):
                batch = clubs_to_process[i:i + args.batch_size]
                batch_num = (i // args.batch_size) + 1
                total_batches = (len(clubs_to_process) + args.batch_size - 1) // args.batch_size

                print(f"\n── Batch {batch_num}/{total_batches} ──")

                tasks = []
                for club in batch:
                    state_slug = state_to_slug(club["state"])
                    os.makedirs(os.path.join(PHOTO_DIR, state_slug), exist_ok=True)
                    tasks.append(process_club(crawler, session, club, crawler_config, state_slug))

                try:
                    results = await asyncio.gather(*tasks, return_exceptions=True)
                except Exception as e:
                    print(f"  Batch error: {e}")
                    continue

                for result in results:
                    if isinstance(result, Exception):
                        print(f"  ERROR: {result}")
                        stats["errors"] += 1
                        continue

                    status = result.get("status", "error")
                    stats[status] = stats.get(status, 0) + 1
                    all_results.append(result)

                    icon = "✅" if status == "downloaded" else "❌"
                    src_tag = f"[{result.get('source', '?')}]" if result.get("source") else ""
                    print(f"  {icon} {result['name']} ({result['city']}, {result['state']}) "
                          f"→ {status} {src_tag}")

                # Rate limiting
                if i + args.batch_size < len(clubs_to_process):
                    await asyncio.sleep(args.delay)

    # ── 8. Save results ──────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("RESULTS SUMMARY")
    print(f"{'='*60}")
    print(f"  Downloaded:      {stats.get('downloaded', 0)}")
    print(f"  No image found:  {stats.get('no_image_found', 0)}")
    print(f"  Download failed: {stats.get('download_failed', 0)}")
    print(f"  Errors:          {stats.get('errors', 0)}")

    # Save mapping CSV
    downloaded_results = [r for r in all_results if r["status"] == "downloaded"]
    if downloaded_results:
        with open(MAPPING_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "name", "city", "state", "image_url", "local_path", "source"])
            writer.writeheader()
            for r in downloaded_results:
                writer.writerow({
                    "id": r["id"],
                    "name": r["name"],
                    "city": r["city"],
                    "state": r["state"],
                    "image_url": r["image_url"],
                    "local_path": r["local_path"],
                    "source": r["source"],
                })
        print(f"\n  Mapping saved to {MAPPING_FILE}")

    # Save full results log (JSONL)
    with open(RESULTS_LOG, "a", encoding="utf-8") as f:
        for r in all_results:
            r["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            f.write(json.dumps(r) + "\n")
    print(f"  Full log appended to {RESULTS_LOG}")


if __name__ == "__main__":
    asyncio.run(main())
