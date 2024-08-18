#!/bin/bash

REPO="eknowles/tilepack"

gh release list --repo "$REPO" | while read -r release; do
  RELEASE_ID=$(echo "$release" | awk '{print $1}')
  echo "Deleting release: $RELEASE_ID"
  gh release delete "$RELEASE_ID" --repo "$REPO" --yes --cleanup-tag
done
