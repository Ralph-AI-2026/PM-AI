#!/usr/bin/env bash
id="$1"; url="$2"
out="/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/hours-gather/pages/${id}.md"
[ -s "$out" ] && exit 0
case "$url" in http*) : ;; *) url="https://$url" ;; esac
timeout 40 /home/jrpkennedy/arlen-crawl/.venv/bin/arlen-crawl scrape -q -t 25000 "$url" > "$out" 2>/dev/null || true
[ -s "$out" ] || echo "EMPTY $id" >> /mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/hours-gather/acquire-empty.log
