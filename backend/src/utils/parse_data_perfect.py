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
        # handle year length
        if len(year) == 2:
            year = "20" + year
        return f"{year}-{month}-{day}"
    return None

parsed_records = []

for i, match in enumerate(matches):
    container_no = match.group(0)
    start_idx = match.start()
    end_idx = match.end()
    
    # 1. Backtrack to find Loading Date, Status, BL No, and ETA Date
    prev_end = matches[i-1].end() if i > 0 else 0
    pre_text = clean_text[max(prev_end, start_idx - 120):start_idx].strip()
    
    # Find all dates in the preceding text
    found_dates = list(date_pattern.finditer(pre_text))
    
    loading_date = ""
    eta_date = ""
    status = "pending"
    bl_no = ""
    
    if found_dates:
        # The last date closest to the container number is the loading date
        last_date_match = found_dates[-1]
        loading_date = last_date_match.group(0)
        
        # Text before the loading date
        text_before_loading = pre_text[:last_date_match.start()].strip()
        
        # Find if any status is at the end of text_before_loading
        matched_status = None
        for st in statuses:
            if text_before_loading.endswith(st) or st in text_before_loading[-30:]:
                matched_status = st
                break
                
        if matched_status:
            status = matched_status
            status_idx = text_before_loading.rfind(matched_status)
            text_before_status = text_before_loading[:status_idx].strip()
            
            # Find ETA date in text_before_status (closest to the status going backwards)
            eta_dates = list(date_pattern.finditer(text_before_status))
            if eta_dates:
                eta_date = eta_dates[-1].group(0)
                # BL No is between the ETA date and the status
                bl_no = text_before_status[eta_dates[-1].end():].strip()
            else:
                bl_no = text_before_status
        else:
            # If no status found, use the count of dates
            if len(found_dates) >= 2:
                eta_date = found_dates[-2].group(0)
                bl_no = pre_text[found_dates[-2].end():last_date_match.start()].strip()
            else:
                bl_no = text_before_loading
    
    # Clean BL No
    bl_no = bl_no.strip().lstrip('.').strip()
    # If BL No contains status, strip it
    for st in statuses:
        bl_no = bl_no.replace(st, "").strip()
    # If BL No contains dates, strip them
    bl_no = date_pattern.sub("", bl_no).strip()
    
    # Standardize Status
    status_lower = status.lower()
    if "work not started" in status_lower:
        status_std = "pending"
    elif "done" in status_lower:
        status_std = "done"
    elif "none" in status_lower:
        status_std = "pending"
    else:
        status_std = "inTransit" # arrived or cleared if we want, inTransit is safe
        
    # 2. Look forward to parse other fields
    next_start = matches[i+1].start() if i < len(matches) - 1 else len(clean_text)
    post_text = clean_text[end_idx:next_start].strip()
    
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
            
    # Try to find unloadingDate in post_text
    post_dates = re.findall(r'\d{1,2}[/\-]+\d{1,2}[/\-]+\d{4}', post_text)
    unloading_date = ""
    if post_dates:
        # If there are two dates, the second one is unloading date
        if len(post_dates) >= 2:
            unloading_date = post_dates[1]
        else:
            # If only one date, check if it's different from loading_date
            if format_date(post_dates[0]) != format_date(loading_date):
                unloading_date = post_dates[0]
        
    # Format dates
    eta_formatted = format_date(eta_date)
    loading_formatted = format_date(loading_date)
    unloading_formatted = format_date(unloading_date)

    parsed_records.append({
        "containerNo": container_no,
        "blNo": bl_no,
        "etaDate": eta_formatted,
        "loadingDate": loading_formatted,
        "unloadingDate": unloading_formatted,
        "status": status_std,
        "portOfChina": port_ch,
        "shippingLine": line,
        "exporterName": exp_name,
        "importerName": imp_name,
        "cha": cha_name,
        "party": imp_name,
        "remarks": f"Status from sheet: {status}"
    })

with open("src/utils/parsed_containers_perfect.json", "w", encoding="utf-8") as f:
    json.dump(parsed_records, f, indent=2)

print(f"Perfect parsing finished. Parsed {len(parsed_records)} containers.")
