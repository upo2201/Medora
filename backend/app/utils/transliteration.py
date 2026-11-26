"""
South Asian Name Transliteration Engine for Medora
Translates English romanized South Asian personal names into Bengali (bn) and Hindi/Devanagari (hi) scripts.
Uses a high-precision curated name dictionary with phonetic rule-based fallback.
Preserves user's exact manual inputs if provided.
"""

from typing import Dict, Tuple

# Curated South Asian given names and surnames dictionary
NAME_DICTIONARY: Dict[str, Dict[str, str]] = {
    # Common First Names
    "ananya": {"bn": "অনন্যা", "hi": "अनन्या"},
    "sen": {"bn": "সেন", "hi": "सेन"},
    "ritu": {"bn": "ঋতু", "hi": "ऋतु"},
    "devika": {"bn": "দেবিকা", "hi": "देविका"},
    "amit": {"bn": "অমিত", "hi": "अमित"},
    "rahul": {"bn": "রাহুল", "hi": "राहुल"},
    "rohit": {"bn": "রোহিত", "hi": "रोहित"},
    "priya": {"bn": "প্রিয়া", "hi": "प्रिया"},
    "pooja": {"bn": "পূজা", "hi": "पूजा"},
    "puja": {"bn": "পূজা", "hi": "पूजा"},
    "neha": {"bn": "নেহা", "hi": "नेहा"},
    "sneha": {"bn": "স্নেহা", "hi": "स्नेहा"},
    "anita": {"bn": "অনিতা", "hi": "अनीता"},
    "sunita": {"bn": "সুনীতা", "hi": "सुनीता"},
    "rajesh": {"bn": "রাজেশ", "hi": "राजेश"},
    "suresh": {"bn": "সুরেশ", "hi": "सुरेश"},
    "ramesh": {"bn": "রমেশ", "hi": "रमेश"},
    "vikram": {"bn": "বিক্রম", "hi": "विक्रम"},
    "sanjay": {"bn": "সঞ্জয়", "hi": "संजय"},
    "vijay": {"bn": "বিজয়", "hi": "विजय"},
    "ajay": {"bn": "অজয়", "hi": "अजय"},
    "deepa": {"bn": "দীপা", "hi": "दीपा"},
    "deepak": {"bn": "দীপক", "hi": "दीपक"},
    "manoj": {"bn": "মনোজ", "hi": "मनोज"},
    "arvind": {"bn": "অরবিন্দ", "hi": "अरविंद"},
    "ashish": {"bn": "আশিস", "hi": "आशीष"},
    "alok": {"bn": "অলোক", "hi": "आलोक"},
    "abhiram": {"bn": "অভিরাম", "hi": "अभिराम"},
    "debashis": {"bn": "দেবাশীষ", "hi": "देबाशीष"},
    "subhash": {"bn": "সুভাষ", "hi": "सुभाष"},
    "swapan": {"bn": "স্বপন", "hi": "स्वपन"},
    "tanmay": {"bn": "তন্ময়", "hi": "तन्मय"},
    "sourav": {"bn": "সৌরভ", "hi": "सौरव"},
    "joy": {"bn": "জয়", "hi": "जॉय"},
    "kalyan": {"bn": "কল্যাণ", "hi": "कल्याण"},
    "madhumita": {"bn": "মধুমিতা", "hi": "मधुमिता"},
    "sarmistha": {"bn": "শর্মিষ্ঠা", "hi": "शर्मिष्ठा"},
    "kakali": {"bn": "কাকলী", "hi": "काकली"},
    "aparna": {"bn": "অপর্ণা", "hi": "अपर्णा"},
    "sushmita": {"bn": "সুস্মিতা", "hi": "सुष्मिता"},
    "shreya": {"bn": "শ্রেয়া", "hi": "श्रेया"},
    "tanushree": {"bn": "তনুশ্রী", "hi": "तनुश्री"},
    "mousumi": {"bn": "মৌসুমী", "hi": "मौसमी"},
    "monalisa": {"bn": "মোনালিসা", "hi": "मोनालीसा"},
    "pradip": {"bn": "প্রদীপ", "hi": "प्रदीप"},
    "sandip": {"bn": "সন্দীপ", "hi": "संदीप"},
    "sujit": {"bn": "সুজিত", "hi": "सुजीत"},
    "arijit": {"bn": "অরিজিৎ", "hi": "अरिजीत"},
    "indranil": {"bn": "ইন্দ্রনীল", "hi": "इंद्रनील"},
    "sayantani": {"bn": "সায়ন্তনী", "hi": "सायंतनी"},
    "anirban": {"bn": "অনির্বাণ", "hi": "अनिर्बान"},
    "arun": {"bn": "অরুণ", "hi": "अरुण"},
    "varun": {"bn": "বরুণ", "hi": "वरुण"},
    "tarun": {"bn": "তরুণ", "hi": "तरुण"},
    "kiran": {"bn": "কিরণ", "hi": "किरण"},
    "meera": {"bn": "মীরা", "hi": "मीरा"},
    "geeta": {"bn": "গীতা", "hi": "गीता"},
    "seema": {"bn": "সীমা", "hi": "सीमा"},
    "reena": {"bn": "রীনা", "hi": "रीना"},
    "kabir": {"bn": "কবীর", "hi": "कबीर"},
    "rohan": {"bn": "রোহন", "hi": "रोहन"},
    "aaditya": {"bn": "আদিত্য", "hi": "आदित्य"},
    "aditya": {"bn": "আদিত্য", "hi": "आदित्य"},

    # Common Surnames
    "ghosh": {"bn": "ঘোষ", "hi": "घोष"},
    "roy": {"bn": "রায়", "hi": "राय"},
    "ray": {"bn": "রায়", "hi": "राय"},
    "banerjee": {"bn": "ব্যানার্জী", "hi": "बनर्जी"},
    "mukherjee": {"bn": "মুখার্জী", "hi": "मुखर्जी"},
    "chatterjee": {"bn": "চ্যাটার্জী", "hi": "चटर्जी"},
    "bhattacharya": {"bn": "ভট্টাচার্য", "hi": "भट्टाचार्य"},
    "chakraborty": {"bn": "চক্রবর্তী", "hi": "चक्रवर्ती"},
    "das": {"bn": "দাস", "hi": "दास"},
    "dass": {"bn": "দাস", "hi": "दास"},
    "dutta": {"bn": "দত্ত", "hi": "दत्ता"},
    "datta": {"bn": "দত্ত", "hi": "दत्ता"},
    "bose": {"bn": "বসু", "hi": "बसु"},
    "basu": {"bn": "বসু", "hi": "बसु"},
    "guha": {"bn": "গুহ", "hi": "गुहा"},
    "mitra": {"bn": "মিত্র", "hi": "मित्रा"},
    "sarkar": {"bn": "সরকার", "hi": "सरकार"},
    "biswas": {"bn": "বিশ্বাস", "hi": "विश्वास"},
    "paul": {"bn": "পাল", "hi": "पाल"},
    "pal": {"bn": "পাল", "hi": "पाल"},
    "majumdar": {"bn": "মজুমদার", "hi": "मजूमदार"},
    "mazumdar": {"bn": "মজুমদার", "hi": "मजूमदार"},
    "mondal": {"bn": "মণ্ডল", "hi": "मंडल"},
    "mandal": {"bn": "মণ্ডল", "hi": "मंडल"},
    "barman": {"bn": "বর্মন", "hi": "बर्मन"},
    "de": {"bn": "দে", "hi": "दे"},
    "dey": {"bn": "দে", "hi": "दे"},
    "sharma": {"bn": "শর্মা", "hi": "शर्मा"},
    "verma": {"bn": "বর্মা", "hi": "वर्मा"},
    "gupta": {"bn": "গুপ্ত", "hi": "गुप्ता"},
    "singh": {"bn": "সিং", "hi": "सिंह"},
    "kumar": {"bn": "কুমার", "hi": "कुमार"},
    "mishra": {"bn": "মিশ্র", "hi": "मिश्रा"},
    "pandey": {"bn": "পান্ডে", "hi": "पांडे"},
    "tiwari": {"bn": "তিওয়ারি", "hi": "तिवारी"},
    "joshi": {"bn": "জোশী", "hi": "जोशी"},
    "mehta": {"bn": "মেহতা", "hi": "मेहता"},
    "patel": {"bn": "প্যাটেল", "hi": "पटेल"},
    "shah": {"bn": "শাহ", "hi": "शाह"},
    "agarwal": {"bn": "আগরওয়াল", "hi": "अग्रवाल"},
    "yadav": {"bn": "যাদব", "hi": "यादव"},
    "malhotra": {"bn": "মালহোত্রা", "hi": "मल्होत्रा"},
    "kapoor": {"bn": "কাপুর", "hi": "कपूर"},
    "khanna": {"bn": "খান্না", "hi": "खन्ना"},
    "chopra": {"bn": "চোপড়া", "hi": "चोपड़ा"},
    "bhatia": {"bn": "ভাটিয়া", "hi": "भाटिया"},
    "saxena": {"bn": "সাক্সেনা", "hi": "सक्सेना"},
    "rao": {"bn": "রাও", "hi": "राव"},
    "reddy": {"bn": "রেড্ডি", "hi": "रेड्डी"},
    "nair": {"bn": "নায়ার", "hi": "नायर"},
    "pillai": {"bn": "পিল্লাই", "hi": "पिल्लई"},
    "iyer": {"bn": "আইয়ার", "hi": "अय्यर"},
    "iyengar": {"bn": "আয়েঙ্গার", "hi": "अयंगर"},
}

# Phonetic syllable tables for fallback transliteration
PHONETIC_CONSONANTS = [
    ("sh", ("শ", "श")),
    ("ch", ("চ", "च")),
    ("kh", ("খ", "ख")),
    ("gh", ("ঘ", "घ")),
    ("th", ("থ", "थ")),
    ("dh", ("ধ", "ध")),
    ("ph", ("ফ", "फ")),
    ("bh", ("ভ", "भ")),
    ("jh", ("ঝ", "झ")),
    ("k", ("ক", "क")),
    ("g", ("গ", "ग")),
    ("c", ("ক", "क")),
    ("j", ("জ", "ज")),
    ("t", ("ট", "ट")),
    ("d", ("ড", "ड")),
    ("n", ("ন", "न")),
    ("p", ("প", "प")),
    ("f", ("ফ", "फ")),
    ("b", ("ব", "ब")),
    ("v", ("ভ", "व")),
    ("m", ("ম", "म")),
    ("y", ("য", "य")),
    ("r", ("র", "र")),
    ("l", ("ল", "ल")),
    ("w", ("ওয়", "व")),
    ("s", ("স", "स")),
    ("h", ("হ", "ह")),
    ("z", ("জ", "ज़")),
]

# Vowel initial (when starting a word or following a vowel)
VOWEL_INITIAL = [
    ("aa", ("আ", "आ")),
    ("ee", ("ঈ", "ई")),
    ("oo", ("ঊ", "ऊ")),
    ("ai", ("ঐ", "ऐ")),
    ("au", ("ঔ", "औ")),
    ("a", ("আ", "आ")),
    ("i", ("ই", "इ")),
    ("u", ("উ", "उ")),
    ("e", ("এ", "ए")),
    ("o", ("ও", "ओ")),
]

# Matras (vowel signs following consonants)
VOWEL_MATRAS = [
    ("aa", ("া", "ा")),
    ("ee", ("ী", "ी")),
    ("oo", ("ূ", "ू")),
    ("ai", ("ৈ", "ै")),
    ("au", ("ৌ", "ौ")),
    ("a", ("", "")),       # Inherited schwa in Indic scripts
    ("i", ("ি", "ि")),
    ("u", ("ু", "ु")),
    ("e", ("ে", "े")),
    ("o", ("ো", "ो")),
]

def _transliterate_word_phonetic(word: str, lang_idx: int) -> str:
    """Phonetic rule-based transliterator for an unlisted word."""
    w = word.lower()
    res = []
    i = 0
    n = len(w)
    last_was_consonant = False

    while i < n:
        # Check vowels first if following a consonant
        if last_was_consonant:
            matched_matra = False
            for v_str, signs in VOWEL_MATRAS:
                if w.startswith(v_str, i):
                    res.append(signs[lang_idx])
                    i += len(v_str)
                    matched_matra = True
                    last_was_consonant = False
                    break
            if matched_matra:
                continue

        # Check multi-char and single consonants
        matched_cons = False
        for c_str, signs in PHONETIC_CONSONANTS:
            if w.startswith(c_str, i):
                res.append(signs[lang_idx])
                i += len(c_str)
                matched_cons = True
                last_was_consonant = True
                break
        if matched_cons:
            continue

        # Check initial/independent vowels
        matched_vowel = False
        for v_str, signs in VOWEL_INITIAL:
            if w.startswith(v_str, i):
                res.append(signs[lang_idx])
                i += len(v_str)
                matched_vowel = True
                last_was_consonant = False
                break
        if matched_vowel:
            continue

        # If unknown character (punctuation, digit, etc.)
        res.append(w[i])
        i += 1
        last_was_consonant = False

    return "".join(res)

def transliterate_name(full_name: str, target_lang: str) -> str:
    """
    Translates an English Romanized personal name to Bengali (target_lang='bn')
    or Hindi (target_lang='hi').
    Returns the transliterated string. Returns original if target_lang is not bn/hi or name is empty.
    """
    if not full_name or target_lang not in ("bn", "hi"):
        return full_name or ""

    lang_idx = 0 if target_lang == "bn" else 1
    words = full_name.strip().split()
    output_words = []

    for word in words:
        clean_key = word.lower().strip(",.()[]{}'\"")
        if clean_key in NAME_DICTIONARY:
            trans = NAME_DICTIONARY[clean_key][target_lang]
            output_words.append(trans)
        else:
            # Phonetic rule-based fallback
            trans = _transliterate_word_phonetic(clean_key, lang_idx)
            output_words.append(trans if trans else word)

    return " ".join(output_words)
