#!/bin/bash

# Replace with your repository details
REPO="eknowles/tilepack"

# List all releases and delete them
gh release list --repo "$REPO" | while read -r release; do
  # Extract the release ID from the release list output
  RELEASE_ID=$(echo "$release" | awk '{print $1}')
  echo "Deleting release: $RELEASE_ID"
  gh release delete "$RELEASE_ID" --repo "$REPO" --yes --cleanup-tag
done

echo "All tags and releases deleted."
