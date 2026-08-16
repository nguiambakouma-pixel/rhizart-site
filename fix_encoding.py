import sys

with open(r'c:\Users\THE BIG BOSS\Documents\RHIZART\translations.js', 'rb') as f:
    raw = f.read()

# Remove BOM if present
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]
    print("Removed BOM")

text = raw.decode('utf-8')

replacements = [
    ('\u00e2\u20ac\u201c', '\u2014'),   # â€" -> em dash
    ('\u00e2\u20ac\u2122', '\u2019'),   # â€™ -> right single quote '
    ('\u00e2\u20ac\u0153', '\u201c'),   # â€œ -> left double quote "
    ('\u00e2\u20ac\u009d', '\u201d'),   # â€ -> right double quote "
    ('\u00e2\u20ac\u00a6', '\u2026'),   # â€¦ -> ellipsis …
    ('\u00e2\u20ac\u00a2', '\u2022'),   # â€¢ -> bullet •
    ('\u00c3\u00a9', '\u00e9'),         # Ã© -> é
    ('\u00c3\u00a8', '\u00e8'),         # Ã¨ -> è
    ('\u00c3\u00a0', '\u00e0'),         # Ã  -> à
    ('\u00c3\u00a2', '\u00e2'),         # Ã¢ -> â
    ('\u00c3\u00ae', '\u00ee'),         # Ã® -> î
    ('\u00c3\u00b4', '\u00f4'),         # Ã´ -> ô
    ('\u00c3\u00bb', '\u00fb'),         # Ã» -> û
    ('\u00c3\u00ab', '\u00eb'),         # Ã« -> ë
    ('\u00c3\u00af', '\u00ef'),         # Ã¯ -> ï
    ('\u00c3\u00bc', '\u00fc'),         # Ã¼ -> ü
    ('\u00c3\u00a7', '\u00e7'),         # Ã§ -> ç
    ('\u00c3\u0089', '\u00c9'),         # Ã‰ -> É
    ('\u00c3\u20ac', '\u00c0'),         # À
    ('\u00c3\u201e', '\u00c2'),         # Â
    ('\u00c3\u02c6', '\u00ca'),         # Ê
    ('\u00c3\u02dc', '\u00da'),         # Ú
    ('\u00c3\u2014', '\u00d4'),         # Ô
    ('\u00c3\u00b1', '\u00f1'),         # Ã± -> ñ
    ('\u00c3\u00b9', '\u00f9'),         # Ã¹ -> ù
    ('\u00c3\u00a1', '\u00e1'),         # Ã¡ -> á
    ('\u00c3\u00a3', '\u00e3'),         # Ã£ -> ã
    ('\u00c3\u00a4', '\u00e4'),         # Ã¤ -> ä
    ('\u00c3\u00a5', '\u00e5'),         # Ã¥ -> å
    ('\u00c3\u00aa', '\u00ea'),         # Ãª -> ê
    ('\u00c3\u00ac', '\u00ec'),         # Ã¬ -> ì
    ('\u00c3\u00ad', '\u00ed'),         # Ã­ -> í
    ('\u00c3\u00a6', '\u00e6'),         # Ã¦ -> æ
    ('\u00c3\u00b2', '\u00f2'),         # Ã² -> ò
    ('\u00c3\u00b3', '\u00f3'),         # Ã³ -> ó
    ('\u00c3\u00b6', '\u00f6'),         # Ã¶ -> ö
    ('\u00c3\u00b8', '\u00f8'),         # Ã¸ -> ø
    ('\u00c3\u00bf', '\u00ff'),         # Ã¿ -> ÿ
    ('\u00c3\u009f', '\u00df'),         # ÃŸ -> ß
    ('\u00c3\u2026', '\u00c5'),         # Ã… -> Å
    ('\u00c3\u2020', '\u00c7'),         # Ã‡ -> Ç
    ('\u00c3\u2022', '\u00d5'),         # Ã• -> Õ
    ('\u00c3\u2013', '\u00d3'),         # Ã" -> Ó
    ('\u00c3\u2019', '\u00d9'),         # Ã™ -> Ù
    ('\u00c3\u0161', '\u00da'),         # Ãš -> Ú
    ('\u00c3\u203a', '\u00db'),         # Ã› -> Û
    ('\u00c3\u0152', '\u00dc'),         # Ãœ -> Ü
    ('\u00c3\u017e', '\u00fe'),         # Ã¾ -> þ
    ('\u00c3\u0092', '\u00d2'),         # Ã' -> Ò
    ('\u00c3\u0093', '\u00d3'),         # Ã" -> Ó
    ('\u00c3\u0091', '\u00d1'),         # Ã' -> Ñ
    ('\u00c3\u2021', '\u00c8'),         # Ãˆ -> È
    ('\u00c3\u0160', '\u00d8'),         # Ã˜ -> Ø
    ('\u00c3\u2014', '\u00d7'),         # Ã— -> ×
    ('\u00c3\u0153', '\u00d6'),         # Ã– -> Ö
    ('\u00c3\u008b', '\u00cb'),         # Ã‹ -> Ë
    ('\u00c3\u008c', '\u00cc'),         # ÃŒ -> Ì
    ('\u00c3\u008e', '\u00ce'),         # ÃŽ -> Î
    ('\u00c2\u00a9', '\u00a9'),         # Â© -> ©
    ('\u00c2\u00b7', '\u00b7'),         # Â· -> ·
    ('\u00c2\u00ab', '\u00ab'),         # Â« -> «
    ('\u00c2\u00bb', '\u00bb'),         # Â» -> »
    ('\u00c2\u00b0', '\u00b0'),         # Â° -> °
    ('\u00c2\u00a0', '\u00a0'),         # Â  -> non-breaking space
    ('\u00c2\u00a3', '\u00a3'),         # Â£ -> £
    ('\u00c2\u00a7', '\u00a7'),         # Â§ -> §
    ('\u00c2\u00b2', '\u00b2'),         # Â² -> ²
    ('\u00c2\u00b3', '\u00b3'),         # Â³ -> ³
    ('\u00c3\u0086', '\u00c6'),         # Ã† -> Æ
    ('\u00c3\u008a', '\u00ca'),         # ÃŠ -> Ê
    ('\u00c3\u201a', '\u00c2'),         # Ã‚ -> Â
    ('\u00c3\u20ac', '\u00c0'),         # Ã€ -> À
    ('\u00c2', ''),                     # stray Â leftover
    ('\u00f0\u009f\u0094\u00a5', '\U0001f525'),  # fire emoji
]

count = 0
for bad, good in replacements:
    occurrences = text.count(bad)
    if occurrences > 0:
        text = text.replace(bad, good)
        count += occurrences
        print(f"Fixed {occurrences}x: {repr(bad)} -> {repr(good)}")

print(f"\nTotal fixes: {count}")

with open(r'c:\Users\THE BIG BOSS\Documents\RHIZART\translations.js', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(text)

print("\nVerification (lines 14-23):")
lines = text.split('\n')
for line in lines[13:23]:
    sys.stdout.buffer.write((line.rstrip() + '\n').encode('utf-8'))
