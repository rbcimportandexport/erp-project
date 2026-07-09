import json
import os

categories = {
    "01": "Live Animals",
    "02": "Meat & Edible Meat",
    "03": "Fish & Seafood",
    "04": "Dairy Products, Eggs, Honey",
    "05": "Animal Products",
    "06": "Live Trees & Plants",
    "07": "Vegetables",
    "08": "Fruits & Nuts",
    "09": "Coffee, Tea & Spices",
    "10": "Cereals",
    "11": "Milling Products",
    "12": "Oil Seeds & Medicinal Plants",
    "13": "Gums, Resins",
    "14": "Vegetable Materials",
    "15": "Animal & Vegetable Oils",
    "16": "Meat/Fish Preparations",
    "17": "Sugar",
    "18": "Cocoa",
    "19": "Bakery & Cereal Preparations",
    "20": "Fruit & Vegetable Preparations",
    "21": "Miscellaneous Food Preparations",
    "22": "Beverages",
    "23": "Animal Feed",
    "24": "Tobacco",
    "25": "Salt, Stone, Cement",
    "26": "Ores",
    "27": "Mineral Fuels & Petroleum",
    "28": "Inorganic Chemicals",
    "29": "Organic Chemicals",
    "30": "Pharmaceuticals",
    "31": "Fertilizers",
    "32": "Paints & Dyes",
    "33": "Cosmetics & Perfumes",
    "34": "Soap & Cleaning Products",
    "35": "Glues & Enzymes",
    "36": "Explosives",
    "37": "Photographic Goods",
    "38": "Miscellaneous Chemicals",
    "39": "Plastics",
    "40": "Rubber",
    "41": "Raw Leather",
    "42": "Leather Articles, Bags",
    "43": "Fur & Artificial Fur",
    "44": "Wood Products",
    "45": "Cork",
    "46": "Straw & Basketware",
    "47": "Pulp",
    "48": "Paper & Paperboard",
    "49": "Printed Books & Newspapers",
    "50": "Silk",
    "51": "Wool",
    "52": "Cotton",
    "53": "Vegetable Textile Fibres",
    "54": "Man-made Filaments",
    "55": "Man-made Staple Fibres",
    "56": "Wadding, Felt, Nonwovens",
    "57": "Carpets",
    "58": "Special Fabrics & Lace",
    "59": "Coated Textile Fabrics",
    "60": "Knitted Fabrics",
    "61": "Knitted Garments",
    "62": "Woven Garments",
    "63": "Other Textile Articles",
    "64": "Footwear",
    "65": "Headgear",
    "66": "Umbrellas",
    "67": "Artificial Flowers & Feathers",
    "68": "Stone, Cement Articles",
    "69": "Ceramic Products",
    "70": "Glass & Glassware",
    "71": "Jewellery & Precious Stones",
    "72": "Iron & Steel",
    "73": "Iron & Steel Articles",
    "74": "Copper",
    "75": "Nickel",
    "76": "Aluminium",
    "77": "Reserved",
    "78": "Lead",
    "79": "Zinc",
    "80": "Tin",
    "81": "Other Base Metals",
    "82": "Tools & Cutlery",
    "83": "Metal Hardware",
    "84": "Machinery",
    "85": "Electrical & Electronics",
    "86": "Railway Equipment",
    "87": "Vehicles",
    "88": "Aircraft",
    "89": "Ships & Boats",
    "90": "Medical & Optical Instruments",
    "91": "Clocks & Watches",
    "92": "Musical Instruments",
    "93": "Arms & Ammunition",
    "94": "Furniture",
    "95": "Toys & Sports Goods",
    "96": "Miscellaneous Manufactured Articles",
    "97": "Works of Art & Antiques",
    "98": "Special Classification (Customs-specific)",
    "99": "Services (SAC under GST)",
}

file_path = 'backend/src/utils/unique_hsn.json'

# Load existing HSN codes
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        hsn_list = json.load(f)
else:
    hsn_list = []

# Find existing chapters
existing_chapters = set()
for item in hsn_list:
    if 'code' in item:
        existing_chapters.add(item['code'][:2])

# Generate codes for missing chapters
added_count = 0
for i in range(1, 100):
    cc = f"{i:02d}"
    if cc not in existing_chapters:
        category_name = categories.get(cc, "Miscellaneous")
        for suffix in ["011000", "022000", "033000", "044000", "055000"]:
            hsn_list.append({
                "code": f"{cc}{suffix}",
                "description": f"{category_name.upper()} TYPE {suffix[:2]}",
                "dutyRate": 10,
                "gstRate": 18,
                "isActive": True
            })
            added_count += 1

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(hsn_list, f, indent=2, ensure_ascii=False)

print(f"Successfully added {added_count} mock HSN codes for empty chapters!")
