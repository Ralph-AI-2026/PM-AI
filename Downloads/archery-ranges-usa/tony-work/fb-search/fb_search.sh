#!/usr/bin/env bash
W="/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/fb-search"
TB="http://127.0.0.1:3860/api/v1/action"
while IFS= read -r line; do
  id=$(echo "$line" | python3 -c "import sys,json;print(json.loads(sys.stdin.read())['id'])")
  out="$W/pages/${id}.txt"
  [ -s "$out" ] && continue
  q=$(echo "$line" | python3 -c "import sys,json,urllib.parse;d=json.loads(sys.stdin.read());print(urllib.parse.quote(f\"{d['name']} {d['city']} {d['state']} archery\"))")
  curl -s --max-time 22 -X POST "$TB" -H 'Content-Type: application/json' \
    -d "{\"platform\":\"facebook\",\"action\":\"navigate\",\"params\":{\"url\":\"https://www.facebook.com/search/pages?q=${q}\"}}" >/dev/null 2>&1
  sleep 7
  txt=$(curl -s --max-time 22 -X POST "$TB" -H 'Content-Type: application/json' \
    -d '{"platform":"facebook","action":"extract_text","params":{}}' 2>/dev/null | python3 -c "import sys,json;print((json.load(sys.stdin).get('data') or {}).get('text',''))" 2>/dev/null)
  printf '%s' "$txt" > "$out"
  sleep 3
done < "$W/targets.jsonl"
echo DONE_FBSEARCH > "$W/status"
