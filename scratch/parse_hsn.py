import os
import json
import pandas as pd

excel_path = r"D:\Download Vinay JI\MAIN HSN MASTER.xlsx"
output_dir = r"d:\RBC ERP SYSTEM IMPORT AND EXPORT\erp-project\frontend\src\data"
output_file = os.path.join(output_dir, "hsnMaster.json")

print("Reading Excel file...")
df = pd.read_excel(excel_path)

# Normalize column names to strip spaces
df.columns = [c.strip() for c in df.columns]
print("Columns found:", list(df.columns))

# Drop rows without description
df = df.dropna(subset=["DESCRIPTION"])

# Clean values
def clean_str(val):
    if pd.isna(val):
        return ""
    val_str = str(val).strip()
    if val_str.endswith(".0"):
        val_str = val_str[:-2]
    return val_str

def clean_num(val, default=0):
    if pd.isna(val):
        return default
    try:
        val_str = str(val).strip().replace("%", "")
        return float(val_str)
    except:
        return default

hsn_map = {}

for _, row in df.iterrows():
    desc = clean_str(row["DESCRIPTION"]).upper()
    if not desc:
        continue
    
    hsn = clean_str(row.get("HSN", row.get("HSN ", "")))
    unit = clean_str(row.get("UNIT", "PCS")).upper()
    bcd = clean_str(row.get("BCD", "0"))
    sws = clean_num(row.get("SWS", row.get("SWS ", 10)))
    gst = clean_num(row.get("IGST", row.get("GST", 18)))
    
    # Store unique descriptions (take the first populated values)
    if desc not in hsn_map:
        hsn_map[desc] = {
            "description": desc,
            "hsn": hsn,
            "unit": unit or "PCS",
            "bcd": bcd or "0",
            "sws": sws,
            "gst": gst
        }

# Convert map to sorted list by description
hsn_list = sorted(list(hsn_map.values()), key=lambda x: x["description"])

os.makedirs(output_dir, exist_ok=True)
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(hsn_list, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(hsn_list)} items to {output_file}")
