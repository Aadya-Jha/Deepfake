# file: backend/scripts/attack_test.py
import os
import csv
import requests

ANALYZE_URL = "http://127.0.0.1:8001/analyze"
API_KEY = "wrapper-test-key"

def run(folder, out_csv="attack_results.csv"):
    rows = []
    for fname in sorted(os.listdir(folder)):
        fp = os.path.join(folder, fname)
        if not os.path.isfile(fp):
            continue
        with open(fp, "rb") as fh:
            try:
                resp = requests.post(ANALYZE_URL, files={"file": (fname, fh)}, headers={"x-api-key": API_KEY}, timeout=60)
                data = resp.json() if resp.headers.get("content-type","").startswith("application/json") else {}
                rows.append([fname, resp.status_code, data.get("prob_fake"), data.get("flagged")])
            except Exception as e:
                rows.append([fname, "ERROR", str(e), ""])
    with open(out_csv, "w", newline="") as out:
        w = csv.writer(out)
        w.writerow(["filename", "status", "prob_fake", "flagged"])
        w.writerows(rows)
    print(f"Wrote {out_csv}")

if __name__ == "__main__":
    import sys
    folder = sys.argv[1] if len(sys.argv) > 1 else "test_vectors"
    run(folder)
