# OCR-and-review pipeline for scanned past questions

Past questions arrive as scanned PDFs with several questions per page, so they are images, not text. We extract each page with a vision model into draft rows (exam, subject, topic, question, options, correct), land them in a CSV a human reviews, and ship only approved rows. We chose this over manual keying or blind OCR because maths symbols and diagrams break naive OCR, and unreviewed questions would poison the bank.

**Status**: accepted

## Considered Options

- Manual keying of every question (accurate, but very slow).
- Blind OCR straight into the bank (fast, but silently wrong on symbols and diagrams).
- Vision extraction into a human-reviewed CSV before shipping (chosen).

## Consequences

- No question enters the bank without human approval; a review tool is part of the build.
- The pipeline is the bottleneck for content volume, so bank size grows at review speed, not scrape speed.
- Extraction quality must be monitored per subject; diagrams may need manual handling.
