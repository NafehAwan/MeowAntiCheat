/**
 * English strings. Every user-facing string lives here so Urdu and Arabic
 * (RTL) can be added as sibling files with the same keys.
 * Use {name} placeholders for values.
 */
export const en = {
  'app.name': 'Halal Scanner',

  'scan.title': 'Scan',
  'scan.hint': 'Point the camera at a barcode',
  'scan.permission.title': 'Camera access needed',
  'scan.permission.body': 'Halal Scanner uses the camera only to read barcodes and ingredient labels. Nothing is recorded.',
  'scan.permission.button': 'Allow camera',
  'scan.permission.settings': 'Camera access is off. Turn it on in your phone settings.',

  'product.title': 'Result',
  'product.loading': 'Looking up product…',
  'product.notFound.title': 'Product not found',
  'product.notFound.body': 'This barcode is not in the Open Food Facts database yet.',
  'product.noIngredients.title': 'No ingredient list',
  'product.noIngredients.body': 'We found the product, but it has no ingredient list in the database.',
  'product.photoComingSoon': 'Scanning a photo of the ingredient label is coming soon.',
  'product.error.title': 'Could not look up product',
  'product.error.body': 'Check your internet connection and try again.',
  'product.retry': 'Try again',
  'product.scanAnother': 'Scan another',
  'product.barcode': 'Barcode {code}',
  'product.unnamed': 'Unnamed product',
  'product.otherLanguage': 'The ingredient list is not in English, so some ingredients may not be recognised.',
  'product.source': 'Product data: Open Food Facts (open database, may contain errors).',

  'verdict.halal': 'Halal',
  'verdict.doubtful': 'Doubtful',
  'verdict.haram': 'Haram',
  'verdict.unknown': 'Unknown',
  'verdict.halal.sub': 'No haram or doubtful ingredients found',
  'verdict.doubtful.sub': 'Some ingredients have an unclear source',
  'verdict.haram.sub': 'Contains ingredients that are not halal',
  'verdict.unknown.sub': 'Nothing to analyse',

  'flagged.title': 'Flagged ingredients',
  'flagged.label': 'On the label: "{ingredient}"',
  'flagged.unreviewed': 'Database entry not yet reviewed, so it is shown as doubtful.',

  'why.title': 'Why this verdict',
  'why.no-ingredients': 'There was no ingredient list to analyse.',
  'why.nothing-flagged': 'We checked {count} ingredients and none matched a haram or doubtful ingredient in our database.',
  'why.haram-found': 'Not halal: {names}.',
  'why.doubtful-found': 'Source unclear: {names}. Check the certification or contact the manufacturer.',
  'why.unreviewed-entries': 'Some ingredients are shown as doubtful because our database entry has not been reviewed by a scholar yet.',

  'certification.title': 'Certification',
  'certification.halalLabel': 'The package data lists a halal label. Check the logo on the pack to confirm who certified it.',
  'certification.none': 'No halal certification found in the product data.',
  'certification.note': 'Certification and the ingredient check are separate. A certified product can still show doubtful ingredients, and the other way round.',

  'testBuild.banner': 'Test build: the ingredient database has not been reviewed by a scholar yet.',

  'disclaimer':
    'Decision-support tool based on listed ingredients. Formulas and sourcing change. Check certification or contact the manufacturer when in doubt. Not a religious ruling.',
} as const;

export type StringKey = keyof typeof en;
