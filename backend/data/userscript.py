import json
from datetime import datetime, timezone

# Load your JSON data
with open("users.json", "r") as f:
    users = json.load(f)

# Get current UTC time in milliseconds
current_timestamp = int(datetime.now(timezone.utc).timestamp() * 1000)

# Process each user
for user in users:
    password = user.get("password")
    phone = user.get("phone")
    token = user.get("resetPasswordToken")
    expires = user.get("resetPasswordExpires")

    if password:
        if phone:
            user["status"] = "active"
        else:
            user["status"] = "Phone Required"
        user["resetPasswordToken"] = None
        user["resetPasswordExpires"] = None
    else:
        if token:
            if expires and expires > current_timestamp:
                user["status"] = "Reset Password Sent"
            else:
                user["status"] = "Reset Password Expires"
        else:
            user["status"] = "New"

# Save the updated users to a new file
with open("updated_users.json", "w") as f:
    json.dump(users, f, indent=2)

print("Updated user data saved to 'updated_users.json'")
