#!/bin/bash
# Move to the project root
cd "$(dirname "$0")"

# Remove any stale git locks
rm -f .git/index.lock

# Update remote
git remote set-url origin https://github.com/road2tec/Linkdin-facial-attendance-system-Final.git || git remote add origin https://github.com/road2tec/Linkdin-facial-attendance-system-Final.git

# Try to add and commit
git add .
git commit -m "Fix proxy attendance, data rendering issues, and material URLs"

# Push to the new repo
git push -u origin main || git push -u origin master
