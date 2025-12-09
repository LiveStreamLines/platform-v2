import json

# Path to your JSON file
file_path = "cameras.json"

print(f"📂 Loading JSON file: {file_path}")

# Read the JSON file
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print("✅ JSON file loaded successfully.")

# Check type of JSON data
if isinstance(data, list):
    print(f"🔍 Found {len(data)} records in the JSON file.")
    for i, record in enumerate(data, start=1):
        print(f"\n➡️ Processing record #{i}:")
        print(json.dumps(record, ensure_ascii=False, indent=4))

        if "country" not in record:
            print("⚠️  'country' field missing — adding 'country': 'UAE'")
            record["country"] = "UAE"
        else:
            print(f"✅ 'country' field exists with value: {record['country']}")

    print("\n💾 Writing updated data back to file...")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print("✅ All records processed and saved successfully!")

else:
    print("❌ The JSON file does not contain a list of records.")
