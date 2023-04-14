import hashlib
import re

def generate_profile_slug(text_source: str) -> str:
    sha256_hash = hashlib.sha256(text_source.encode()).hexdigest()
    slug = sha256_hash.lower().strip()
    slug = re.sub(r'\W+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    
    return slug[:12]