# Supplier inventory entry rules — Horizon OOH

User corrections recorded 27 October 2026. Apply to future Egypt and Saudi supplier imports.

## Evidence comes before entry
- Read the entire supplier presentation, including captions, arrows, map screenshots, map links/annotations, tables, both-face slides, notes and availability date.
- Prefer supplier GPS coordinates, Google Maps links, KML/KMZ or an explicit marked map. Verify country, road, side/direction and photograph landmarks rather than accepting the first geocoder match.
- If only a written address exists, identify the road segment and compare satellite imagery to both photographs: bridge geometry, pedestrian bridge, median, intersections, ramps, adjoining buildings and travel direction.
- A hospital, mall, district or park centroid is not the roadside billboard position. Do not put a roadside installation inside the named landmark merely because it appears in the address.
- For a bridge-mounted panel, match the actual bridge structure. A nearby hospital or neighbourhood point is insufficient.
- For a freestanding panel, place the pin at its support beside the correct road/carriageway, not at the centroid of a nearby property. Do not blindly snap every point to the road centreline.
- Where images/address do not establish the road segment, flag coordinates for manual review; do not imply survey accuracy. Approximate pins require user authorization and explicit disclosure.
- User-corrected pins take precedence. Re-read current database values before any write; never replay an older import over user edits.
- Indoor airport/mall inventory and actual wall/rooftop mounts need their physical installation context; the roadside rule must not be used to move legitimate installations blindly.

## Classify the physical installation
Use supplier technical terminology plus visible support/installation geometry, not just the road name, aspect ratio, generic sample image, or an existing database label. Existing inventory contains inconsistent classifications; examples are candidates, not ground truth.
- Mirror / مرايه: user-confirmed reference H-14471, the horizontal advertising panels on the Almaza pedestrian bridge. Reviewed comparison references H-11572 and H-11616 also show bridge-mounted panels.
- Uni-pole / Uni Pole / يوني بول: one primary supporting pole beneath the advertising face; H-14472 and H-14474 are current supplier examples. User's H-14474 pin identifies the road/nearby pedestrian bridge context; it does not make the advertised panel itself a bridge panel.
- Gate / بوابه: establish the actual gate/gantry construction from the supplier photo; do not call every road bridge a Gate. H-14471 was incorrectly imported as Gate and corrected to Mirror.
- Twin Pole: confirm two supports. T Pole, Flag, Mega Post and Uni-pole may share broad silhouettes; use supplier dimensions and stated product nomenclature.
- Double Decker: stacked advertising faces; Butterfly: paired angled faces; verify actual support/face arrangement.
- Combo: mixed formats in one advertised package. Keep both sizes and preserve separate unit/face totals. H-14473: 16 x 8 + 6 x 3, 10 units, 20 total faces; distribution between sizes unknown.
- Roof Top, Wall, Light Box, Digital Screen, Fanous, Succette and indoor branding are distinct placements/media; do not derive them solely from image size.
- Keep agreed Arabic trade names: يوني بول، مرايه، بوابه؛ avoid literal translations such as لوحة أحادية العمود.

## Data and image safeguards
- Distinguish number of units from total faces. Do not assume each quoted dimension applies to every unit of a mixed package.
- Do not compute one total area from the first size in a mixed-size string.
- Match supplier to the existing supplier ID; preserve contact records. Check existing inventory for overlaps, and ask before creating deliberate duplicates.
- Extract only photographs actually displayed on the relevant PDF pages. PDFs may contain unused alternate embedded images.
- Retouch exposure/colour/sharpness mildly, preserve billboard artwork and surroundings, use the exact approved Horizon frame, size/optimise outputs, and write accurate EN/AR ALT.
- Back up before changes, guard exact records, and compare unaffected inventory after import.
- Verify dashboard values, public EN/AR pages, image order, bilingual ALT, map link coordinates, and SSG. Do not treat an HTTP200 alone as visual verification.

## Review limits
Inventory snapshot: 2906 Egypt listings; 37 raw type labels. Reviewed 68 example images spanning all 37 raw labels (up to two examples per label). This is not a claim of visual verification of every listing or road pin.
Coordinate screening found H-13869 (14.007981,44.174913) and H-14379 (30.6291698,-86.0587606) outside a broad Egypt bounding box. 123 groups share rounded coordinates. Shared pins can be valid for a package but require evidence before any correction.
Potential classification mismatches seen in sample review: H-11552 (Gate label, freestanding pole photo), H-13853 (Belt Branding label, mall advertising photo). Retain records and flag for manual review; do not bulk relabel from a single thumbnail.

## Mandatory Horizon image frame
Owner instruction dated 28 October 2026: for every billboard actively reviewed or edited, inspect every visible photograph. Replace any obsolete frame, Yafta Map branding frame, or unframed photo with the exact approved Horizon frame before completing the work. Keep backups privately, but do not leave the obsolete version attached to the public listing. This owner instruction overrides earlier preservation preferences for photographs whose frame is wrong; correctly framed existing photographs should be preserved. Repair broken image references using identical bytes when the approved framed original exists.
