import re
import json

with open("src/utils/pdf_extracted_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

clean_text = " ".join(text.split())

container_pattern = re.compile(r'RBC2026\d{4}-\d{2,3}')
matches = list(container_pattern.finditer(clean_text))

statuses = [
    "WORK NOT STARTED", "CHECKLIST APPROVED", "CHECKLIST",
    "HOLD AT ME", "P&I", "BOE", "DONE", "NONE"
]

date_pattern = re.compile(r'\d{1,2}[/\-]+[/\-]*\d{1,2}[/\-]+\d{4}')

ports_india = ["NHAVA SHEVA", "NHAVA SHEV"]
ports_china = ["NINGBO", "NANSHA", "WUHAN", "SHEKOU", "CHINA AIR", "DA CHAN BAY"]
shipping_lines = ["IAL", "MSC", "HAS", "YML", "EMC", "KMTC", "WHL", "RCL", "HMM", "OOCL", "ONE", "SNL", "COSCO", "PEAK"]
exporters = [
    "YIWU HONG SALE INTERNATIONAL TRADE CO.,LTD",
    "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    "YIWU SUPERMEJOR IMPORT AND EXPORT CO.,LIMITED"
]
importers = [
    "RAMDEV BEAUTY COLLECTION",
    "SHREEJI SELLING",
    "VEDIKA ENTERPRISES",
    "RAMA SALON FURNITURE",
    "SHIVAY ENTERPRISE"
]
chas = ["MOUNTAIN", "OCENUS", "ECPL"]

def format_date(date_str):
    if not date_str:
        return None
    # Remove leading/trailing non-date chars
    date_str = re.sub(r'^[^\d]+', '', date_str)
    date_str = re.sub(r'[^\d]+$', '', date_str)
    date_str = date_str.replace("-", "/").replace("//", "/")
    parts = date_str.split("/")
    if len(parts) == 3:
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        year = parts[2]
        if len(year) == 2:
            year = "20" + year
        return f"{year}-{month}-{day}"
    return None

def clean_bl_no(bl):
    bl = bl.strip()
    # Remove leading/trailing junk like dots
    bl = bl.lstrip('.').strip()
    if len(bl) > 22 or " " in bl or any(k in bl.upper() for k in ["COLLECTION", "SOCIETY", "ROAD", "SURAT", "GUJARAT", "INDIA", "LTD", "CO.", "CO,LTD"]):
        return ""
    return bl

# Step 1: Backtrack for each container to find prefix metadata and the absolute start of the record
containers_info = []

for i, match in enumerate(matches):
    container_no = match.group(0)
    start_idx = match.start()
    
    prev_end = matches[i-1].end() if i > 0 else 0
    pre_text = clean_text[max(prev_end, start_idx - 120):start_idx].strip()
    
    found_dates = list(date_pattern.finditer(pre_text))
    
    loading_date = ""
    eta_date = ""
    status = "pending"
    bl_no = ""
    record_start_relative = 0
    
    if found_dates:
        last_date_match = found_dates[-1]
        loading_date = last_date_match.group(0)
        record_start_relative = last_date_match.start()
        
        text_before_loading = pre_text[:last_date_match.start()].strip()
        
        matched_status = None
        for st in statuses:
            if text_before_loading.endswith(st) or st in text_before_loading[-30:]:
                matched_status = st
                break
                
        if matched_status:
            status = matched_status
            status_idx = text_before_loading.rfind(matched_status)
            record_start_relative = status_idx
            
            text_before_status = text_before_loading[:status_idx].strip()
            
            eta_dates = list(date_pattern.finditer(text_before_status))
            if eta_dates:
                eta_date = eta_dates[-1].group(0)
                bl_no = text_before_status[eta_dates[-1].end():].strip()
                record_start_relative = eta_dates[-1].start()
            else:
                bl_no = text_before_status
        else:
            if len(found_dates) >= 2:
                eta_date = found_dates[-2].group(0)
                bl_no = pre_text[found_dates[-2].end():last_date_match.start()].strip()
                record_start_relative = found_dates[-2].start()
            else:
                bl_no = text_before_loading
                
    # Absolute start index of this container's record in clean_text
    absolute_start = max(prev_end, start_idx - 120) + record_start_relative
    
    # Clean BL No
    bl_no = clean_bl_no(bl_no)
    
    status_lower = status.lower()
    if "work not started" in status_lower:
        status_std = "pending"
    elif "done" in status_lower:
        status_std = "done"
    elif "none" in status_lower:
        status_std = "pending"
    else:
        status_std = "inTransit"
        
    containers_info.append({
        "containerNo": container_no,
        "blNo": bl_no,
        "etaDateRaw": eta_date,
        "loadingDateRaw": loading_date,
        "statusRaw": status,
        "status": status_std,
        "absolute_start": absolute_start,
        "container_match": match
    })

# Step 2: Slice the text precisely for each record!
parsed_records = []

for i, info in enumerate(containers_info):
    record_start = info["absolute_start"]
    record_end = containers_info[i+1]["absolute_start"] if i < len(containers_info) - 1 else len(clean_text)
    
    record_slice = clean_text[record_start:record_end]
    
    container_no = info["containerNo"]
    container_no_idx = record_slice.find(container_no)
    post_text = record_slice[container_no_idx + len(container_no):].strip()
    
    port_in = "NHAVA SHEVA"
    port_ch = ""
    for p in ports_china:
        if p in post_text:
            port_ch = p
            break
            
    line = ""
    for l in shipping_lines:
        if l in post_text:
            line = l
            break
            
    exp_name = ""
    for e in exporters:
        if e in post_text:
            exp_name = e
            break
            
    imp_name = ""
    for imp in importers:
        if imp in post_text:
            imp_name = imp
            break
            
    cha_name = ""
    for c in chas:
        if c in post_text:
            cha_name = c
            break
            
    post_dates = re.findall(r'\d{1,2}[/\-]+\d{1,2}[/\-]+\d{4}', post_text)
    unloading_date = ""
    if post_dates:
        if len(post_dates) >= 2:
            unloading_date = post_dates[1]
        else:
            if format_date(post_dates[0]) != format_date(info["loadingDateRaw"]):
                unloading_date = post_dates[0]
                
    eta_formatted = format_date(info["etaDateRaw"])
    loading_formatted = format_date(info["loadingDateRaw"])
    unloading_formatted = format_date(unloading_date)
    
    parsed_records.append({
        "containerNo": container_no,
        "blNo": info["blNo"],
        "etaDate": eta_formatted,
        "loadingDate": loading_formatted,
        "unloadingDate": unloading_formatted,
        "status": info["status"],
        "portOfChina": port_ch,
        "shippingLine": line,
        "exporterName": exp_name,
        "importerName": imp_name,
        "cha": cha_name,
        "party": imp_name,
        "remarks": f"Status from sheet: {info['statusRaw']}"
    })

with open("src/utils/parsed_containers_perfect.json", "w", encoding="utf-8") as f:
    json.dump(parsed_records, f, indent=2)

print(f"Perfect slices parsing finished. Parsed {len(parsed_records)} containers.")
