import urllib.request
import re
import os

query = "palantir+aip+demo+interface"
url = f"https://www.youtube.com/results?search_query={query}"
artifact_dir = r"C:\Users\YASHWANTH\.gemini\antigravity\brain\fd4e9f7b-9a47-4aaa-8d67-ebc1709f3f80"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # Find youtube video IDs
    video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    
    seen = set()
    unique_ids = [x for x in video_ids if not (x in seen or seen.add(x))][:3]
    print("Found video IDs:", unique_ids)
    
    for i, vid in enumerate(unique_ids):
        img_url = f"https://i.ytimg.com/vi/{vid}/maxresdefault.jpg"
        filepath = os.path.join(artifact_dir, f"youtube_palantir_aip_{i}.jpg")
        try:
            req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_data = urllib.request.urlopen(req_img).read()
            with open(filepath, 'wb') as f:
                f.write(img_data)
            print(f"Success: {filepath}")
        except Exception as e:
            print(f"Failed to download maxres, trying hqdefault for {vid} : {e}")
            try:
                img_url = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                img_data = urllib.request.urlopen(req_img).read()
                with open(filepath, 'wb') as f:
                    f.write(img_data)
                print(f"Success (hq): {filepath}")
            except Exception as e2:
                print(f"Failed completely for {vid}: {e2}")

except Exception as e:
    print(e)
