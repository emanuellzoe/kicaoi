#!/usr/bin/env bash
#
# generate-activity.sh — incremental "playground utility" activity generator.
#
# Creates a series of branches, each with COMMITS_PER_PR commits, opens a PR
# against main, merges it (--merge --delete-branch), then syncs main and repeats.
# Every change is confined to the playground/ folder.
#
# Each commit ("utility u-N") appends exactly one line to three files:
#   playground/styles.css    : .u-N { padding: Npx; border-radius: 4px; background: <COLOR>; color: #fff; }
#   playground/index.html    : <div class="u-N">box u-N</div>
#   playground/CHANGELOG.md  : - u-N: add utility (bg <COLOR>, pad Npx)
#
# Usage:
#   playground/generate-activity.sh [PR_COUNT] [COMMITS_PER_PR] [START_PR] [START_COUNTER]
#
# Defaults: PR_COUNT=20  COMMITS_PER_PR=5  START_PR=auto  START_COUNTER=auto
# "auto" means: continue from the last utility number / PR index recorded in
# playground/CHANGELOG.md (falls back to 1 on a fresh project).

set -euo pipefail

# ---- params -----------------------------------------------------------------
PR_COUNT="${1:-20}"
COMMITS_PER_PR="${2:-5}"
START_PR_ARG="${3:-auto}"
START_COUNTER_ARG="${4:-auto}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

PG_DIR="playground"
CSS="$PG_DIR/styles.css"
HTML="$PG_DIR/index.html"
CHANGELOG="$PG_DIR/CHANGELOG.md"

# color palette, cycled by (N-1) % 10
COLORS=(\#2563eb \#16a34a \#dc2626 \#d97706 \#7c3aed \#0891b2 \#db2777 \#65a30d \#ea580c \#0d9488)

# ---- helpers ----------------------------------------------------------------
ensure_files() {
  mkdir -p "$PG_DIR"
  if [[ ! -f "$CSS" ]]; then
    printf '/* Playground utility styles — auto-generated, append-only. */\n' > "$CSS"
  fi
  if [[ ! -f "$HTML" ]]; then
    cat > "$HTML" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Playground utilities</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<!-- utility boxes appended below, one per utility -->
EOF
  fi
  if [[ ! -f "$CHANGELOG" ]]; then
    printf '# Playground Changelog\n\n' > "$CHANGELOG"
  fi
}

# detect the last utility number from the changelog (0 if none)
last_utility() {
  if [[ -f "$CHANGELOG" ]]; then
    grep -oE '^- u-[0-9]+:' "$CHANGELOG" 2>/dev/null | grep -oE '[0-9]+' | sort -n | tail -1 || true
  fi
}

# detect the last PR index from merged PR titles in git/changelog history (0 if none)
last_pr_index() {
  git log --oneline 2>/dev/null \
    | grep -oE 'PR [0-9]+, commit' \
    | grep -oE '[0-9]+' | sort -n | tail -1 || true
}

sync_main() {
  git checkout main >/dev/null 2>&1
  git pull --ff-only origin main >/dev/null 2>&1
}

# ---- resolve starting points ------------------------------------------------
if [[ "$START_COUNTER_ARG" == "auto" ]]; then
  lu="$(last_utility)"; lu="${lu:-0}"
  START_COUNTER=$(( lu + 1 ))
else
  START_COUNTER="$START_COUNTER_ARG"
fi

if [[ "$START_PR_ARG" == "auto" ]]; then
  lp="$(last_pr_index)"; lp="${lp:-0}"
  START_PR=$(( lp + 1 ))
else
  START_PR="$START_PR_ARG"
fi

RUN_ID="$(date +%Y%m%d-%H%M%S)"
COUNTER="$START_COUNTER"
END_PR=$(( START_PR + PR_COUNT - 1 ))

echo ">>> run_id=$RUN_ID  PR_COUNT=$PR_COUNT  COMMITS_PER_PR=$COMMITS_PER_PR"
echo ">>> start_pr=$START_PR end_pr=$END_PR  start_counter=$START_COUNTER"

# ---- main loop --------------------------------------------------------------
for (( i=START_PR; i<=END_PR; i++ )); do
  sync_main

  NN="$(printf '%02d' "$i")"
  TS="$(date +%Y%m%d-%H%M%S)"
  BRANCH="playground/${TS}-pr${NN}"
  git checkout -b "$BRANCH" >/dev/null 2>&1
  echo ">>> [PR $i/$END_PR] branch $BRANCH"

  pr_utils=()
  for (( j=1; j<=COMMITS_PER_PR; j++ )); do
    N="$COUNTER"
    COLOR="${COLORS[$(( (N-1) % 10 ))]}"
    PAD="$N"

    ensure_files
    printf '.u-%d { padding: %dpx; border-radius: 4px; background: %s; color: #fff; }\n' \
      "$N" "$PAD" "$COLOR" >> "$CSS"
    printf '<div class="u-%d">box u-%d</div>\n' "$N" "$N" >> "$HTML"
    printf -- '- u-%d: add utility (bg %s, pad %dpx)\n' "$N" "$COLOR" "$PAD" >> "$CHANGELOG"

    git add "$PG_DIR"
    git commit -q -m "playground: add utility u-${N} (PR ${i}, commit ${j})"
    pr_utils+=("u-${N}")
    COUNTER=$(( COUNTER + 1 ))
  done

  # join utility list for the PR body
  UTIL_LIST="$(IFS=', '; echo "${pr_utils[*]}")"

  git push -u origin "$BRANCH" >/dev/null 2>&1
  gh pr create \
    --base main \
    --head "$BRANCH" \
    --title "Playground activity batch ${i} (run ${RUN_ID})" \
    --body "Auto-generated incremental utilities: ${UTIL_LIST}. Folder: playground/ only." \
    >/dev/null

  # merge (retry a few times while GitHub computes mergeability)
  for attempt in 1 2 3 4 5; do
    if gh pr merge "$BRANCH" --merge --delete-branch >/dev/null 2>&1; then
      echo ">>> [PR $i] merged ($UTIL_LIST)"
      break
    fi
    if [[ "$attempt" == 5 ]]; then
      echo "!!! [PR $i] merge failed after retries" >&2
      exit 1
    fi
    sleep 3
  done

  sync_main
  git branch -D "$BRANCH" >/dev/null 2>&1 || true
done

echo ">>> done. next utility would be u-${COUNTER}."
