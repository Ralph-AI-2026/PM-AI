#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

def has_pro_shop(text):
    """Check for on-site pro shop / retail store / gear sales"""
    patterns = [
        r'\bpro\s+shop\b',
        r'\bpro\s+shop',
        r'retail.*store',
        r'store.*archery',
        r'gear\s+sales',
        r'equipment\s+sales',
        r'\bshop\b.*(?:bow|gear|archery|equipment)',
        r'archery.*shop',
        r'bow.*shop',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def has_3d_course(text):
    """Check for on-site 3D archery course"""
    patterns = [
        r'3d\s+(?:range|course|shoot)',
        r'3d\s+archery',
        r'foam.*animal\s+targets',
        r'animal\s+targets',
        r'3d\s+target',
        r'three\s+dimensional.*archery',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def has_field_course(text):
    """Check for on-site field archery course"""
    patterns = [
        r'field\s+(?:archery|course|range|round)',
        r'field\s+archery',
        r'marked.*field\s+course',
        r'unmarked.*field\s+course',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def lessons_available(text):
    """Check for lessons / classes / coaching / instruction"""
    patterns = [
        r'\blessons?\b',
        r'\bclasses?\b',
        r'\bcoaching\b',
        r'\binstruction\b',
        r'\bclinics?\b',
        r'learn\s+to\s+(?:shoot|archery)',
        r'beginner\s+class',
        r'archery\s+lessons',
        r'instruction',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def equipment_rental_available(text):
    """Check for equipment / bow rental"""
    patterns = [
        r'equipment\s+rental',
        r'bow\s+rental',
        r'rent(?:al)?\s+(?:equipment|bow)',
        r'rental\s+equipment',
        r'rent\s+bow',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def extract_features(page_path):
    """Extract features from a page"""
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception:
        return None
    
    # Skip if page is empty or error
    if not text or len(text.strip()) < 50:
        return None
    
    features = {}
    
    if has_pro_shop(text):
        features['has_pro_shop'] = True
    if has_3d_course(text):
        features['has_3d_course'] = True
    if has_field_course(text):
        features['has_field_course'] = True
    if lessons_available(text):
        features['lessons_available'] = True
    if equipment_rental_available(text):
        features['equipment_rental_available'] = True
    
    return features if features else None

# Read input chunk
chunk_file = 'xchunks/f-04.jsonl'
output_file = 'results/f-04.out.jsonl'

Path('results').mkdir(exist_ok=True)

pro_shop_count = 0
course_3d_count = 0
field_count = 0
lessons_count = 0
rental_count = 0
pages_read = 0
lines_written = 0

with open(output_file, 'w') as out:
    with open(chunk_file) as f:
        for line in f:
            if not line.strip():
                continue
            
            data = json.loads(line)
            page_path = data['page']
            
            features = extract_features(page_path)
            pages_read += 1
            
            if features:
                result = {'id': data['id']}
                result.update(features)
                out.write(json.dumps(result) + '\n')
                lines_written += 1
                
                if 'has_pro_shop' in features:
                    pro_shop_count += 1
                if 'has_3d_course' in features:
                    course_3d_count += 1
                if 'has_field_course' in features:
                    field_count += 1
                if 'lessons_available' in features:
                    lessons_count += 1
                if 'equipment_rental_available' in features:
                    rental_count += 1

print(f"f-04: pages read {pages_read} | pro_shop {pro_shop_count}, 3d {course_3d_count}, field {field_count}, lessons {lessons_count}, rental {rental_count}")
