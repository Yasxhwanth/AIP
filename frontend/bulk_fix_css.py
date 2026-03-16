import os
import re

def fix_css_rgba(content):
    # Pattern to match rgba(var(--name), opacity) or rgba(var(--name),0.2)
    # Allows for optional spaces
    pattern = r'rgba\(var\(--([a-zA-Z0-9-]+)\)\s*,\s*([0-9.]+)\)'
    replacement = r'rgb(var(--\1) / \2)'
    return re.sub(pattern, replacement, content)

def bulk_fix(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.tsx', '.css', '.ts')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = fix_css_rgba(content)
                    
                    if new_content != content:
                        print(f"Fixing {path}")
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    bulk_fix('src')
