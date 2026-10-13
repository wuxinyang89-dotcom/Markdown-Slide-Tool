#!/usr/bin/env bash
# ============================================================================
#  Markdown PPT  -  build launcher for macOS / Linux
# ----------------------------------------------------------------------------
#  This is a THIN launcher, on purpose. All the real work (scanning decks,
#  rendering the menu, building) lives in scripts/build.mjs.
#
#  Unlike build.bat, this file does NOT need to be pure ASCII: bash reads a
#  script as raw bytes and never re-seeks it by byte offset against a console
#  code page, so UTF-8 is safe here. (cmd.exe is the one that misaligns lines.)
#
#  USAGE
#    ./build.sh                  interactive menu
#    ./build.sh all              every deck, all formats
#    ./build.sh html             every deck, HTML only
#    ./build.sh pdf | pptx       same idea
#    ./build.sh list             list all decks
#    ./build.sh clean            empty the dist folder
#    ./build.sh preview [kw]     live preview
#    ./build.sh <keyword> [fmt]  build only matching decks
#
#  FIRST RUN
#    chmod +x build.sh build.command
#  On macOS you can then simply double-click build.command in Finder.
# ============================================================================

set -u

# Always operate relative to this script, wherever it was invoked from.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  [ERROR] Node.js not found. Please install it first:"
  echo "          https://nodejs.org"
  echo
  exit 1
fi

node "scripts/build.mjs" "$@"
rc=$?

# Launched by double-click (no arguments) -> keep the window open so the
# build log / error messages stay readable.
if [ "$#" -eq 0 ]; then
  printf '\n     按回车关闭窗口 ...'
  read -r _ || true
fi

exit "$rc"
