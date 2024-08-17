#!/bin/bash

# CONSTANTS
YTDLP="yt-dlp"
FFMPEG="~/ffmpeg"

#POSITIONAL ARGUMENTS:
NAME=$1
URL=$2
FORMAT=$3

# --ffmpeg-location "$FFMPEG"   <-- include flag if ffmpeg isnt automatically found

$YTDLP -x -q --audio-quality "0" --ffmpeg-location "$FFMPEG" --audio-format $FORMAT --embed-thumbnail -o "storage/$NAME.%(ext)s" --restrict-filenames "$URL"