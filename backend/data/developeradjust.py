import json
import os

FILE_NAME = "developers.json"

def main():
    # Check if file exists
    if not os.path.exists(FILE_NAME):
        print(f"Error: {FILE_NAME} not found in this folder.")
        return

    # Load JSON file
    with open(FILE_NAME, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print("Error: developer.json is not valid JSON.")
            return

    # Ensure it's a list
    if not isinstance(data, list):
        print("Error: developer.json must contain a list of records.")
        return

    changed = False

    # Process each record
    for record in data:
        if "address" not in record:
            print(f"Adding address field to record {record.get('_id')}")
            record["address"] = {
                "street": "",
                "city": "",
                "state": "",
                "zipCode": "",
                "country": "UAE"
            }
            changed = True
        else:
            print(f"Record {record.get('_id')} already has address → skipping")

    # Save updates only if something changed
    if changed:
        with open(FILE_NAME, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print("\ndeveloper.json has been updated successfully.")
    else:
        print("\nNo changes were needed.")

if __name__ == "__main__":
    main()
