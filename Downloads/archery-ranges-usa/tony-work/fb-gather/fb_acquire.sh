#!/usr/bin/env bash
W="/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/fb-gather"
TB="http://127.0.0.1:3860/api/v1/action"
while IFS= read -r line; do
  id=$(echo "$line" | python3 -c "import sys,json;print(json.loads(sys.stdin.read())['id'])")
  url=$(echo "$line" | python3 -c "import sys,json;print(json.loads(sys.stdin.read())['facebook_url'])")
  out="$W/pages/${id}.txt"
  [ -s "$out" ] && continue
  # navigate to the About page for hours/contact; base url otherwise
  case "$url" in
    *profile.php*) navurl="$url" ;;
    */) navurl="${url}about" ;;
    *) navurl="${url}/about" ;;
  esac
  curl -s --max-time 25 -X POST "$TB" -H 'Content-Type: application/json' \
    -d "{\"platform\":\"facebook\",\"action\":\"navigate\",\"params\":{\"url\":\"${navurl}\"}}" >/dev/null 2>&1
  sleep 7
  txt=$(curl -s --max-time 25 -X POST "$TB" -H 'Content-Type: application/json' \
    -d '{"platform":"facebook","action":"extract_text","params":{}}' 2>/dev/null | python3 -c "import sys,json;print((json.load(sys.stdin).get('data') or {}).get('text',''))" 2>/dev/null)
  printf '%s' "$txt" > "$out"
  sleep 3
done < "$W/targets.jsonl"
echo DONE_FB > "$W/fb.status"
