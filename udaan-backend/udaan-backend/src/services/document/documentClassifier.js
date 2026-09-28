const { documentRules } = require('./documentFingerprintService');
const { DOCUMENT_TYPES } = require('./documentRegistry');

// 1. Keyword / heading evidence = 25 points
// 2. Identifier pattern evidence = 20 points
// 3. Required-field evidence = 25 points
// 4. Layout / structural evidence = 20 points
// 5. Visual evidence = 10 points
// Negative penalty = -15 per indicator

function classifyDocument(text) {
  if (!text || text.trim() === '') {
    return { detectedType: null, confidence: 0, matches: [] };
  }
  
  const matches = [];

  for (const type of Object.values(DOCUMENT_TYPES)) {
    if (!documentRules[type]) continue;
    const rule = documentRules[type];
    
    let score = 0;
    
    // 1. Keyword match (max 25)
    let keywordHits = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        keywordHits++;
      }
    }
    const keywordScore = rule.keywords.length > 0 
      ? Math.min(25, (keywordHits / rule.keywords.length) * 25) 
      : (type === DOCUMENT_TYPES.SIGNBOARD_PHOTO ? 0 : 10);
    score += keywordScore;
    
    // 2. Identifier pattern match (max 20)
    let idScore = 0;
    if (rule.identifierPatterns.length > 0) {
      for (const pattern of rule.identifierPatterns) {
        if (pattern.test(text.toUpperCase())) {
          idScore = 20;
          break;
        }
      }
    } else {
      idScore = 20; // If no identifier expected, give full points to not penalize
    }
    score += idScore;
    
    // 3. Required fields (max 25)
    let fieldHits = 0;
    for (const field of rule.requiredFields) {
      if (text.includes(field.toLowerCase())) {
        fieldHits++;
      }
    }
    const fieldScore = rule.requiredFields.length > 0
      ? Math.min(25, (fieldHits / rule.requiredFields.length) * 25)
      : 25;
    score += fieldScore;
    
    // 4. Layout/Structural evidence (max 20)
    let layoutHits = 0;
    for (const layout of rule.layoutFeatures) {
      if (text.includes(layout.toLowerCase())) {
        layoutHits++;
      }
    }
    const layoutScore = rule.layoutFeatures.length > 0
      ? Math.min(20, (layoutHits / rule.layoutFeatures.length) * 20)
      : 20;
    score += layoutScore;
    
    // 5. Visual features (max 10)
    // We are only doing OCR for now, so we'll give default points unless it's a strictly visual doc
    let visualScore = 10; 
    if (type === DOCUMENT_TYPES.SIGNBOARD_PHOTO || type === DOCUMENT_TYPES.FIRE_FIGHTING_LAYOUT) {
      visualScore = 0; // Requires actual visual model, will get 0 via OCR
    }
    score += visualScore;
    
    // Penalties
    let penalty = 0;
    for (const neg of rule.negativeIndicators) {
      if (text.includes(neg.toLowerCase())) {
        penalty += 15;
      }
    }
    score -= penalty;
    
    matches.push({
      type,
      score: Math.max(0, score),
      details: { keywordScore, idScore, fieldScore, layoutScore, visualScore, penalty }
    });
  }

  // Sort by highest score
  matches.sort((a, b) => b.score - a.score);

  const topMatch = matches[0];
  const secondMatch = matches[1];

  let confidence = topMatch.score;
  let detectedType = topMatch.type;
  
  // MIN_SCORE_GAP Check (Ambiguity)
  if (secondMatch && (topMatch.score - secondMatch.score < 10) && topMatch.score > 0) {
    // Top 2 are too close -> ambiguous
    // Keep top type, but we'll flag it for review
  }

  return { detectedType, confidence, matches };
}

module.exports = { classifyDocument };
