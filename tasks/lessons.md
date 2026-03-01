# Lessons Learned — Project-T1

## Design File (pencil-new.pen)

### 1. Always update ALL frames, not just one
**Mistake:** Initially only updated Frame `GPHaW` with new images/colors, forgot Frame `VHP70`.  
**Rule:** When making global style changes (colors, images, fonts), always check how many top-level frames exist and apply to ALL of them.  
**Prevention:** Run `batch_get` at document root level first to list all frames before starting.

### 2. Use bulk `replace_all_matching_properties` for color changes
**Pattern:** Instead of manually finding every node with a specific color, use `replace_all_matching_properties` to do a sweep across an entire frame tree.  
**Benefit:** Catches colors in strokes, fills, and text that manual search might miss.

### 3. Verify with `search_all_unique_properties` after bulk replacements
**Pattern:** After replacing colors, run `search_all_unique_properties` to confirm no stale values remain.  
**Benefit:** Catches edge cases where colors are stored in different formats (e.g., `#FFD700` vs `#ffd700`).

### 4. Image URLs use relative paths from the .pen file location
**Pattern:** Images in project use `./assets/images/filename.ext` — not absolute paths.  
**Rule:** Always use relative paths matching the project structure when setting image URLs.

### 5. Extract all image nodes systematically before updating
**Pattern:** Use regex on `batch_get` output to find ALL nodes with `url` properties at once.  
**Benefit:** Prevents missing hidden image nodes buried deep in the tree.

### 6. Color Palette as Source of Truth
**Pattern:** Always reference `palette.png` colors exactly as defined — don't make up similar shades.  
**Colors:** `#cc2729` (red), `#fff700` (yellow), `#de6b7c` (pink), `#d37c54` (orange), `#78b8e8` (blue), `#c45542` (muted red-orange)

---

## Process

### 7. Plan before diving into implementation
**Rule:** For multi-section updates, list all sections first, then work through them systematically.

### 8. Screenshot after each batch to verify
**Rule:** Take a screenshot after each major update batch to catch visual issues early.
