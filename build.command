#!/usr/bin/env bash
# ============================================================================
#  macOS only - double-clickable entry point.
#
#  Finder treats a *.command file as a script and opens it in Terminal,
#  which gives us an interactive TTY -> the numbered menu works as usual.
#  It just forwards everything to build.sh.
#
#  Requires: chmod +x build.command build.sh
# ============================================================================

cd "$(dirname "$0")" || exit 1
exec bash ./build.sh "$@"
