# AUD supplier update - 28 October 2026

Sources: AUD November availability (19 pages), December availability (33 pages), DOOH Network (79 pages). Reviewed text, linked Google Maps pins, displayed photographs and map pages. Supplier is existing Al Arabia United, ID 282. Egypt only; Saudi untouched.

## Changes
- Added 34 missing offers: 10 digital and 24 static packages, H-14524 through H-14557. Repeated months, other faces and continuation slides grouped rather than duplicated.
- Updated 38 existing records from confirmed supplier specifications: dimensions, package units/total faces, type, location/district, map, bilingual title/description. Existing codes, slugs, prices and availability preserved. Static Dahshur H-14186 corrected from an erroneous digital classification.
- 51 optimized photographs: 48 for new offers, 3 replacements of obsolete Yafta Map images (H-14168, H-14186, H-14187). Correct Horizon framed originals preserved. H-14187 Mall of Egypt is absent from this source set: retained its data and actual photograph, cropped only its obsolete 50-pixel footer, then reframed.
- Exact approved Horizon frame; ImageMagick exposure +2, contrast +1, saturation 103%, mild unsharp, contain fit at 640x380, JPEG90 4:4:4. No generative reconstruction, replacement artwork or enlargement. EN/AR ALT and translation dictionary included.
- Corrected governorates H-14166 (Rod El Farag / Cairo) and H-14186 (Dahshur / Giza). Preserve slugs and add exact old-city URL redirects in both languages.
- No billboard deletion. Supplier/customer/district data unchanged. Full private inventory and photo backups at aud-20261028/backup-20261028-141423.

## Location evidence and limits
Network coordinates primarily follow the supplier PDF Google Maps links. Downtown Mall's link points at a neighbouring bank; its pin was moved to mall frontage after satellite review. Three BRT static packages have supplier links. Other static packages and Waterway/Petro Sport lack independent GPS; approximate roadside reference pins were reviewed against satellite road geometry and disclosed in both descriptions. These pins do not claim surveyed pole precision or identify every unit of a network. Source sector R/E map screenshots were inspected and retain multi-segment coverage in descriptions. Source Road labels do not override actual road geometry.

The two Ain Shams University slides have matching dimensions, unit/face counts, title and rate; one offer retains both photographs pending evidence of two independent products. Suez Road includes two separately paired front/back sites. Gamal Abdel Nasser networks are distinct unit/face packages on the same corridor. Existing paired listings for Americana and Katameya were not deleted; no additional copies of those offers were added. Existing North Coast inventory remains untouched; absence from the supplied decks does not authorize deletion.

## Prices and availability
Owner confirmed quoted prices are customer rates, but wants visitors to request a quote. New rates stored in dashboard price fields; existing rates preserved. Public billboard list/detail redact the price for guests and ordinary users; current dashboard admin/editor/viewer roles retain it. Responses are private/no-store and vary on Authorization. Regression tests cover all roles and public list; no DB mutation.

November/December availability is described with its source month and requires booking-date confirmation. Network catalog is not a promise of immediate vacant inventory. No prices placed in public descriptions, photographs or this public provenance manifest.

## Verification
Import preflight guards supplier, every existing target record, unique new codes, correct governorate/district relationship, image checksums/dimensions and bilingual ALT. Transaction checks protected fields, existing prices, retained image rows and unrelated tables; no deletes. Live EN/AR pages, canonical URLs, map coordinates, image URLs/ALT/order, public price redaction, old-city redirects and SSG are checked after deployment.

The owner updated H-14530 coordinates during the audit (14:22:47 UTC). Preserved the newer dashboard pin (30.025299, 31.474787) over the supplier-link pin.

Deployment encountered a full server filesystem. Incomplete isolated generated SSG output was discarded. Four older generated-page backup trees were streamed to local archives and every member checksum verified against the server before removing the expanded copies; database/image backups and the most recent SSG rollback tree remain on the server. Archives and verification manifests are in work/aud-20261028/archived-generated-backups.

Nested products in public location list/detail/home/full responses also redact prices with the same dashboard-role check and private/no-store Authorization-vary headers. Regression tests cover this nested transform for every role. Newer dashboard pin/lighting edits to H-14547 and H-14550 were also preserved, without replaying supplier coordinates over them.
