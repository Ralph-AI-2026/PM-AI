import time
import re
import os

log_file = r'C:\Users\jrpke\.gemini\antigravity\brain\0ff1099a-e17f-434c-8e72-d4569572e251\.system_generated\tasks\task-227.log'
progress_file = r'c:\Users\jrpke\Downloads\archery-ranges-usa\state-range-photos\PHOTO-SWEEP-PROGRESS.md'

# Make sure we have the initial header for Phase 3 in the file
with open(progress_file, 'r', encoding='utf-8') as pf:
    prog_content = pf.read()
if '## Crawl4AI Resume (Phase 3' not in prog_content:
    with open(progress_file, 'a', encoding='utf-8') as pf:
        pf.write('\n## Crawl4AI Resume (Phase 3 - No Website Clubs)\n- Background scrape in progress. Downloaded so far: 0 photos (updated every ~25).\n')

last_notified = 0

while True:
    if not os.path.exists(log_file):
        time.sleep(5)
        continue
        
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        downloads = len(re.findall(r'downloaded \[', content))
        
        # Check if task is finished (log contains RESULTS SUMMARY)
        finished = 'RESULTS SUMMARY' in content
        
        if downloads >= last_notified + 25 or finished:
            last_notified = (downloads // 25) * 25
            
            with open(progress_file, 'r', encoding='utf-8') as pf:
                prog_content = pf.read()
                
            new_text = f'## Crawl4AI Resume (Phase 3 - No Website Clubs)\n- Background scrape in progress. Downloaded so far: {downloads} photos (updated every ~25).'
            if finished:
                new_text = f'## Crawl4AI Resume (Phase 3 - No Website Clubs)\n- Background scrape **FINISHED**. Total downloaded: {downloads} photos.'
                
            prog_content = re.sub(
                r'## Crawl4AI Resume \(Phase 3 - No Website Clubs\)\n- Background scrape.*',
                new_text,
                prog_content
            )
            
            with open(progress_file, 'w', encoding='utf-8') as pf:
                pf.write(prog_content)
                
            print(f'Updated progress to {downloads}')
            
        if finished:
            print('Task finished, exiting watcher.')
            break
            
    except Exception as e:
        print('Error:', e)
        
    time.sleep(10)
