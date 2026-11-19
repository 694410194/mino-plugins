# 7+1 Dimension Analysis Framework

Detailed methodology for measuring each dimension of writing style. All measurements must be **quantified** — avoid vague qualitative descriptions.

---

## Dimension 1: Lexical (词汇特征)

### Measurements
- **Word frequency** — Top 30 most frequent words (exclude function words for Chinese; include function words for English register analysis)
- **Fingerprint words** — 10-15 words/phrases that appear significantly more often than in a general corpus. Calculate: (frequency in author corpus) / (frequency in reference corpus) > 2.0
- **Collocations** — 2-3 word pairs that recur (e.g., "cold calculation", "quiet desperation"). Use PMI (Pointwise Mutual Information) > 3.0 threshold
- **Neologism/Archaism** — Detection of internet-era coinages vs. classical/literary vocabulary
- **Lexical richness** — Type-Token Ratio (TTR) for segments of 500+ words; MATTR for variable-length texts
- **Specific vs. abstract nouns** — Ratio of concrete/specific nouns to abstract/general ones across articles

### Thresholds
| Measure | Signal Weak | Signal Strong |
|---------|-------------|---------------|
| Fingerprint word prominence | 2-3x general | 5x+ general |
| Collocation PMI | 3-5 | 8+ |
| TTR (English, 500-word) | <0.45 (dense) | >0.60 (varied) |
| Concrete/abstract ratio | ~1:1 | >2:1 concrete |

---

## Dimension 2: Syntactic (句法特征)

### Measurements
- **Average sentence length** — Mean words/chars per sentence, with stddev
- **Sentence length distribution** — Histogram bins: <8 words, 8-15, 15-25, 25-40, 40+ (or char-equivalent for Chinese)
- **Clause type ratios** — % simple sentences / % compound / % complex / % compound-complex
- **Punctuation fingerprint** — Frequency per 1000 chars: dashes (—), colons (:), semicolons (;), ellipsis (...), exclamation marks (!), question marks (?), quotation marks ("")
- **Paragraph length** — Mean paragraph length + distribution (bins: 1 sentence, 2-3, 4-6, 7-10, 10+)
- **Sentence opening patterns** — % starting with conjunction, adverb, pronoun, article/determiner, verb, noun

### Thresholds
| Measure | Terse | Moderate | Expansive |
|---------|-------|----------|-----------|
| Avg sentence (English) | <15 words | 15-25 | 25+ |
| Dash frequency per 1000 | <2 | 2-5 | 5+ |
| Paragraph (sentences) | <3 avg | 3-6 avg | 6+ avg |

---

## Dimension 3: Tonal (语气特征)

### Measurements
- **Colloquialism index** — Ratio of colloquial/informal markers per 1000 chars: contractions, slang, filler words, regional expressions, discourse markers ("well", "you know", "like", "actually")
- **Formality score** — Based on ratio of formal vocabulary vs. casual alternatives
- **Sentence-length volatility** — Coefficient of variation (stddev/mean) of sentence length. High volatility = dramatic rhythm; low = measured pace
- **Lexical diversity** — MATTR (Moving Average Type-Token Ratio, window=500)
- **Hedging markers** — Frequency of "maybe", "perhaps", "sort of", "kind of", "likely", "seems" per 1000 words
- **Certainty markers** — Frequency of "clearly", "obviously", "must", "certainly", "undoubtedly", "absolutely", "always", "never"
- **Directness score** — Ratio of declarative sentences vs. interrogative/conditional/hedged statements

### Interpretation
| Profile | Characteristics |
|---------|----------------|
| Conversational | High colloquialism, high volatility, low formality |
| Authoritative | Low hedging, high certainty, low colloquialism |
| Academic | Low colloquialism, low volatility, moderate hedging |
| Lyrical | High volatility, moderate colloquialism, varied certainty |

---

## Dimension 4: Discourse (篇章结构)

### Measurements
- **Opening type classification** — For each article, classify the opening move: Anecdote / Data-Stat / Question / Declaration / Scene-Setting / Quote / Reference / Other
- **Closing pattern classification** — Summary / Call-to-Action / Reflection / Loop-Back (returns to opening) / Abrupt / Question-Open / Quote
- **Paragraph length rhythm** — Sequence analysis: detect patterns like "long-short-long", "short-short-long", "all-medium"
- **Logic flow type** — Deductive (claim → evidence) vs. Inductive (evidence → claim) vs. Causal (A leads to B leads to C) vs. Narrative (chronological) vs. Dialectic (thesis → antithesis → synthesis)
- **Transition density** — Frequency of explicit transitions ("however", "therefore", "meanwhile", "in addition") per 1000 words
- **Section demarcation** — Use of subheadings, horizontal rules, numbered sections, or pure paragraph flow

### Analysis Questions
1. Does the author favor a consistent opening type across articles?
2. Is the closing weak (trailing off) or strong (memorable)?
3. Does the author use paragraph length for rhythm or purely for content organization?
4. Is there a recognizable "architecture" to their pieces?

---

## Dimension 5: Rhetoric & Expression (修辞表达)

### Measurements
- **Metaphor/simile density** — Instances per 1000 words; classify as novel vs. cliché
- **Parallelism frequency** — Instances of parallel structure per 1000 words (anaphora, epistrophe, isocolon, tricolon)
- **Rhetorical questions** — Instances per article
- **Concrete/abstract ratio** — Count concrete nouns/sensory descriptions vs. abstract concepts/ideas
- **Figurative language palette** — Dominant domains for metaphor (nature, war, sports, technology, body, architecture, etc.)
- **Cliches and idioms** — Frequency of set phrases, proverbs, conventional metaphors
- **Contrast devices** — Use of antithesis, juxtaposition, "not X but Y" structures

### Signal Levels
| Device | Light User | Heavy User |
|--------|------------|------------|
| Metaphor | <3 per 1000 words | 8+ per 1000 words |
| Parallelism | Occasional, incidental | Structural, repeated |
| Rhetorical questions | <1 per article | 3+ per article |

---

## Dimension 6: Emotion & Attitude (情感态度)

### Measurements
- **Polarity distribution** — % positive / % negative / % neutral sentences or clauses
- **Emotional arc** — Sentiment trajectory across articles: rising / falling / U-shaped / inverted-U / stable / volatile
- **Stance markers** — Epistemic stance (certainty vs. doubt), attitude markers (what author likes/dislikes), engagement markers (directly addressing reader)
- **Intensity modifiers** — Frequency of intensifiers ("very", "extremely", "deeply", "remarkably") vs. downtoners ("somewhat", "fairly", "slightly", "rather")
- **Emotional vocabulary** — Density of emotion-bearing words per category: joy, sadness, anger, fear, surprise, disgust
- **Humor/sarcasm markers** — Detectable irony, understatement, hyperbole, wordplay

### Emotional Arc Types
| Arc Type | Description |
|----------|-------------|
| Rising | Starts neutral/cool, builds to emotional crescendo |
| Falling | Starts hot/emotionally charged, settles into reflection |
| U-shaped | Opens with tension, resolves to uplift |
| Inverted-U | Starts neutral, rises to peak, falls back |
| Stable | Consistent emotional register throughout |
| Volatile | Frequent shifts between polarities |

---

## Dimension 7: Content Perspective (内容视角)

### Measurements
- **Theme clusters** — Recurring topics, motifs, and preoccupations across the corpus. Use topic modeling or manual thematic coding
- **Imagery density** — Sensory words per 1000 words: visual, auditory, tactile, olfactory, gustatory
- **Pronoun profile** — % first-person singular (I, me, my), first-person plural (we, us, our), second-person (you, your), third-person (he, she, they, it)
- **Value-word clusters** — Words that signal the author's values system: "freedom", "discipline", "beauty", "truth", "efficiency", "justice", etc.
- **Example/reference sources** — Where does the author draw examples from? Personal experience / historical / pop culture / literature / scientific / current events
- **Temporal orientation** — % past / present / future references in article body
- **Scope** — % micro (personal, specific) vs. meso (community, organizational) vs. macro (societal, universal) references

### Perspective Archetypes
| Archetype | Signal |
|-----------|--------|
| Confessional | High 1st-person singular, personal experiences as evidence |
| Guide | High 2nd-person, imperative mood, instructional frame |
| Observer | Low pronoun use, passive constructions, third-person |
| Prophet | High value-word density, macro scope, declarative certainty |
| Scholar | High references to sources, third-person, moderate hedging |

---

## Dimension 8: Format Adaptation (格式适配)

### Measurement
- **Structural inertia score** (1-10) — How rigidly the author follows genre conventions. 1 = completely free-form, 10 = strict format adherence
- **Capability matching** — For each genre/format, assess whether the author's style can adapt: "天生适合" (born fit), "可以驾驭" (can handle), "不太适合" (poor fit), "冲突" (actively clashes)
- **Formula compatibility** — For each of the 14 writing formulas in `references/writing-formulas.md`, rate compatibility on the same 4-point scale.

### Analysis Dimensions for Fit
1. Does the author's typical length range match the format?
2. Does their sentence rhythm work for the format's pacing requirements?
3. Does their pronoun profile match the format's expected voice?
4. Do their rhetorical patterns align with the format's persuasion strategy?
5. Does their structure approach accommodate the format's structural expectations?

---

## Cross-Dimensional Validation Rules

When synthesizing across dimensions, follow these rules:

1. **A feature is a "writing gene" only if** it's supported by ≥2 dimensions. E.g., short sentences (syntactic) + high colloquialism (tonal) + high 2nd-person pronouns (perspective) → conversational gene.

2. **Contradictory signals are findings, not errors.** If Lexical shows rich vocabulary but Tonal shows low certainty, that's a specific author profile (scholarly but hesitant), not a measurement failure.

3. **Frequency thresholds always win over intuition.** If you feel the author uses many dashes but the count is 1.2 per 1000 words (below the "moderate" threshold of 2), the data wins.

4. **Flag, don't fabricate.** If a dimension lacks sufficient data (e.g., only 3 short articles), flag it as "insufficient data" rather than guessing.
