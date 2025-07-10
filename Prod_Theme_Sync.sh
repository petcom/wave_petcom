#!/usr/bin/env bash

# === CONFIG ===
SRC_DIR="./"
DEST_DIR="/var/www/sonaraz-prod/content/themes/wave/"
EXCLUDE_FILE="$(realpath .rsync-exclude)"
RSYNC_OPTS="-rltv"

echo "=== Theme Sync Script ==="
echo "Source: $SRC_DIR"
echo "Destination: $DEST_DIR"
echo "Exclude file: $EXCLUDE_FILE"


# === Check for package.json differences ===
SRC_PKG="package.json"
DEST_PKG="${DEST_DIR}package.json"

if [ -f "$SRC_PKG" ] && ssh yourserver "test -f $DEST_PKG"; then
  echo "Checking for differences in package.json..."
  DIFF=$(diff "$SRC_PKG" <(ssh yourserver "cat $DEST_PKG"))
  if [ -n "$DIFF" ]; then
    echo "WARNING: package.json differs between source and destination!"
    echo "Differences:"
    echo "$DIFF"
  else
    echo "package.json is identical."
  fi
else
  echo "WARNING: package.json not found in source or destination. Skipping check."
fi


# === Check that exclude file exists ===
if [ ! -f "$EXCLUDE_FILE" ]; then
  echo "ERROR: Exclude file not found at: $EXCLUDE_FILE"
  exit 1
fi

# === Ask for dry run ===
read -p "Do you want to do a dry run? (y/n): " DRYRUN

if [[ "$DRYRUN" =~ ^[Yy]$ ]]; then
  RSYNC_OPTS="$RSYNC_OPTS --dry-run"
  echo "Dry run mode enabled."
else
  echo "Live mode enabled. Files will be copied."
fi

# === Run rsync ===
echo "Running: rsync $RSYNC_OPTS --exclude-from='$EXCLUDE_FILE' $SRC_DIR $DEST_DIR"
rsync $RSYNC_OPTS --exclude-from="$EXCLUDE_FILE" "$SRC_DIR" "$DEST_DIR"

# === Ask to reset permissions ===
if [[ ! "$DRYRUN" =~ ^[Yy]$ ]]; then
  read -p "Reset destination files to ghost:ghost? (y/n): " RESETPERMS
  if [[ "$RESETPERMS" =~ ^[Yy]$ ]]; then
    echo "Resetting ownership to ghost:ghost in $DEST_DIR..."
    sudo chown -R ghost:ghost "$DEST_DIR"
    echo "Done!"
  else
    echo "Skipped resetting permissions."
  fi
else
  echo "Dry run — skipped resetting permissions."
fi

echo "=== Done! ==="
