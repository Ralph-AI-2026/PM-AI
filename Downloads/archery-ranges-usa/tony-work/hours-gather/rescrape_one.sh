#!/usr/bin/env bash
id="$1"; url="$2"
out="/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/hours-gather/pages2/${id}.md"
[ -s "$out" ] && exit 0
case "$url" in http*) : ;; *) url="https://$url" ;; esac
timeout 60 /home/jrpkennedy/arlen-crawl/.venv/bin/arlen-crawl scrape-deep -q -t 40000 "$url" > "$out" 2>/dev/null || \
timeout 55 /home/jrpkennedy/arlen-crawl/.venv/bin/arlen-crawl scrape -q -t 40000 -e camoufox "$url" > "$out" 2>/dev/null || true
[ -s "$out" ] || rm -f "$out"
