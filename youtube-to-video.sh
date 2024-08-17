#!/bin/bash

# CONSTANTS
YTDLP="yt-dlp"
FFMPEG="~/ffmpeg"

#POSITIONAL ARGUMENTS:
NAME=$1
URL=$2
FORMAT=$3

# --ffmpeg-location "$FFMPEG"   <-- include flag if ffmpeg isnt automatically found

$YTDLP -q --ffmpeg-location "$FFMPEG" -f $FORMAT -o "storage/$NAME.%(ext)s" --embed-metadata --embed-thumbnail --restrict-filenames "$URL"