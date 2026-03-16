import sys

try:
    with open('build_error_3.txt', 'rb') as f:
        content = f.read()
    
    try:
        text = content.decode('utf-16le')
    except UnicodeDecodeError:
        text = content.decode('utf-8', errors='ignore')
        
    lines = text.splitlines()
    for line in lines:
        if "error" in line.lower() or "failed" in line.lower() or "module not found" in line.lower():
            print(line)
except Exception as e:
    print(f"Error: {e}")
