/**
 * TrustCheck scam & risk analysis engine
 * Automated client-side & server-side fallback risk assessment based on known scam/fraud warning signs
 */

const RISK_INDICATORS = {
  URGENCY: {
    id: 'URGENCY',
    title: 'Artificial Urgency',
    description: 'The message creates a false sense of urgency (e.g., "immediate action", "within 24 hours") to pressure you into making hasty decisions.',
    keywords: [
      /immediately/i, /urgent/i, /action required/i, /blocked/i, /suspended/i, 
      /verify now/i, /within 24 hours/i, /hurry/i, /last chance/i, /final notice/i, 
      /unauthorized login/i, /security alert/i, /expires/i, /restrict/i
    ]
  },
  CREDENTIALS: {
    id: 'CREDENTIALS',
    title: 'Sensitive Information Request',
    description: 'Requests sensitive security items such as OTPs, passwords, PINs, or credentials. Legitimate organizations never request these over text or email.',
    keywords: [
      /otp/i, /one-time password/i, /password/i, /security code/i, /passcode/i, 
      /credentials/i, /2fa/i, /verification code/i, /pin number/i, /cvv/i, /login/i, /sign in/i
    ]
  },
  REWARDS: {
    id: 'REWARDS',
    title: 'Unrealistic Rewards',
    description: 'Promises unexpected gains, lotteries, prizes, or inheritance to entice you. If it sounds too good to be true, it almost certainly is.',
    keywords: [
      /lottery/i, /won/i, /prize/i, /cash prize/i, /million/i, /gift card/i, 
      /reward/i, /winner/i, /inheritance/i, /free entry/i, /jackpot/i, /payout/i,
      /selected to receive/i, /claims code/i
    ]
  },
  PAYMENT: {
    id: 'PAYMENT',
    title: 'Suspicious Payment Request',
    description: 'Demands upfront payment, processing fees, wire transfers, or cryptocurrency deposits under suspicious pretexts.',
    keywords: [
      /wire transfer/i, /payment/i, /bank transfer/i, /credit card details/i, 
      /fee/i, /invoice/i, /btc/i, /bitcoin/i, /crypto/i, /send money/i, 
      /western union/i, /moneygram/i, /giftcard/i, /gift card/i, /prepaid card/i
    ]
  },
  THREATS: {
    id: 'THREATS',
    title: 'Coercive Threats',
    description: 'Uses fear tactics, threat of legal action, fines, or account termination to frighten you into compliance.',
    keywords: [
      /suspend/i, /block/i, /freeze/i, /terminate/i, /police/i, /court/i, 
      /legal action/i, /arrest/i, /jail/i, /fine/i, /lawsuit/i, /prosecuted/i,
      /delinquent/i, /irs/i, /tax collector/i
    ]
  },
  IMPERSONATION: {
    id: 'IMPERSONATION',
    title: 'Brand Impersonation',
    description: 'Impersonates recognizable brands, shipping couriers, or banks to leverage pre-existing trust.',
    keywords: [
      /support-team/i, /customer service/i, /bank support/i, /paypal-security/i, 
      /netflix-billing/i, /amazon-shipping/i, /dhl-tracking/i, /fedex-delivery/i,
      /usp-delivery/i, /chase-alert/i, /wells-fargo/i, /bofa/i
    ]
  },
  SHORTENERS: {
    id: 'SHORTENERS',
    title: 'Obfuscated Link',
    description: 'Uses a URL shortener or masked domain to hide the final, actual destination of the hyperlink.',
    keywords: [
      /bit\.ly/i, /tinyurl\.com/i, /t\.co/i, /goo\.gl/i, /rebrand\.ly/i, 
      /ow\.ly/i, /is\.gd/i, /buff\.ly/i, /t\.me/i
    ]
  }
};

const DEFAULT_RECOMMENDATIONS = [
  'Do not share OTPs, passwords, or PINs with anyone.',
  'Verify the claims independently using official contacts from the brand\'s website.',
  'Avoid clicking on links or downloading files from unexpected messages.',
  'Legitimate banks or services will never request payments or transfer actions via SMS/WhatsApp.'
];

/**
 * Analyze a message text for risk warning signs
 * @param {string} text 
 * @returns {object} Normalized TrustCheck result
 */
export function analyzeMessage(text) {
  if (!text || text.trim().length === 0) {
    return {
      riskScore: 0,
      riskLevel: 'Low apparent risk',
      summary: 'No text content was provided for analysis.',
      warningSigns: [],
      recommendedActions: DEFAULT_RECOMMENDATIONS
    };
  }

  const warningSigns = [];
  let baseScore = 0;

  // Run through keywords
  Object.keys(RISK_INDICATORS).forEach((key) => {
    const indicator = RISK_INDICATORS[key];
    let matched = false;
    
    for (const regex of indicator.keywords) {
      if (regex.test(text)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      warningSigns.push({
        title: indicator.title,
        description: indicator.description
      });
      baseScore += 25;
    }
  });

  // Caps and shouting
  const uppercaseWords = (text.match(/[A-Z]{3,}/g) || []).length;
  if (uppercaseWords > 2) {
    baseScore += 10;
  }

  // Links in text
  const linkRegex = /(https?:\/\/[^\s]+)/gi;
  if (linkRegex.test(text)) {
    baseScore += 10;
  }

  let riskScore = Math.max(5, Math.min(98, baseScore));

  if (riskScore > 10 && riskScore < 95) {
    const variance = Math.floor(Math.random() * 5) - 2;
    riskScore += variance;
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let riskLevel = 'Low apparent risk';
  let summary = 'No major scam indicators were identified in the submitted content.';

  if (riskScore >= 70) {
    riskLevel = 'High risk indicators';
    summary = 'Multiple suspicious patterns associated with scams and phishing were identified.';
  } else if (riskScore >= 35) {
    riskLevel = 'Caution';
    summary = 'Some suspicious language patterns were identified. Exercise caution.';
  }

  const recommendedActions = [...DEFAULT_RECOMMENDATIONS];
  if (warningSigns.some(s => s.title.includes('Sensitive Information'))) {
    recommendedActions.unshift('Immediately change credentials if you have already disclosed any passwords or security codes.');
  }
  if (warningSigns.some(s => s.title.includes('Payment'))) {
    recommendedActions.unshift('Contact your financial institution immediately if you authorized a transfer or shared card details.');
  }

  return {
    riskScore,
    riskLevel,
    summary,
    warningSigns,
    recommendedActions: [...new Set(recommendedActions)]
  };
}

/**
 * Analyze a URL for risk warning signs
 * @param {string} urlString 
 * @returns {object} Normalized TrustCheck result
 */
export function analyzeLink(urlString) {
  if (!urlString || urlString.trim().length === 0) {
    return {
      riskScore: 0,
      riskLevel: 'Low apparent risk',
      summary: 'No web link was provided for analysis.',
      warningSigns: [],
      recommendedActions: DEFAULT_RECOMMENDATIONS
    };
  }

  const warningSigns = [];
  let score = 10;
  const textToScan = urlString.toLowerCase();

  if (textToScan.startsWith('http://')) {
    score += 30;
    warningSigns.push({
      title: 'Unsecured Connection (HTTP)',
      description: 'The link uses HTTP instead of HTTPS, meaning data transfer is unencrypted and vulnerable to interception.'
    });
  }

  let isShortened = false;
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rebrand.ly', 'ow.ly', 'is.gd', 't.me'];
  for (const s of shorteners) {
    if (textToScan.includes(s)) {
      isShortened = true;
      break;
    }
  }

  if (isShortened) {
    score += 35;
    warningSigns.push({
      title: 'Obfuscated Link Address',
      description: 'The address uses a URL shortener service to hide the final, actual domain name of the destination website.'
    });
  }

  const scamKeywords = ['login', 'verify', 'security', 'secure', 'signin', 'update', 'account', 'banking', 'support', 'billing', 'free', 'giftcard', 'claims'];
  let matchedKeyword = false;
  
  for (const word of scamKeywords) {
    if (textToScan.includes(word)) {
      matchedKeyword = true;
      score += 15;
    }
  }

  if (matchedKeyword) {
    warningSigns.push({
      title: 'Deceptive Domains/Keywords',
      description: 'The address contains keywords typically used in phishing scams (like "verify", "secure", "signin") to mimic authentic portals.'
    });
  }

  const ipRegex = /\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipRegex.test(urlString)) {
    score += 40;
    warningSigns.push({
      title: 'Raw IP Address Used',
      description: 'The link points to a raw numeric IP address instead of a registered domain name, which is highly unusual for official services.'
    });
  }

  let riskScore = Math.max(5, Math.min(99, score));
  let riskLevel = 'Low apparent risk';
  let summary = 'No major link obfuscation or risk patterns were found.';

  if (riskScore >= 70) {
    riskLevel = 'High risk indicators';
    summary = 'The link contains domain patterns associated with deceptive phishing portals.';
  } else if (riskScore >= 35) {
    riskLevel = 'Caution';
    summary = 'The link exhibits features such as HTTP or redirection that require caution.';
  }

  const recommendedActions = [
    'Do not enter log-in details, passwords, or credit card details on this website.',
    'If you need to visit this provider, type the official address yourself in your browser.',
    'Use a security scanning site like VirusTotal to cross-reference the safety of the web page.',
    'Verify if the domain matches the brand\'s public official communication channels.'
  ];

  return {
    riskScore,
    riskLevel,
    summary,
    warningSigns,
    recommendedActions
  };
}

/**
 * Pre-defined mock scenarios for high-fidelity screenshots scan demos
 */
export const SCREENSHOT_SCENARIOS = [
  {
    id: 'bank_sms',
    name: 'Suspicious Bank SMS',
    fileName: 'screenshot_bank_alert.png',
    text: 'URGENT: Your Chase card has been temporarily frozen due to suspicious activity. Verify immediately at http://chase-secure-profile.com/update to prevent permanent closure.',
    previewColor: 'from-red-500/20 to-cyber-bg'
  },
  {
    id: 'crypto_giveaway',
    name: 'Crypto Giveaway Post',
    fileName: 'telegram_crypto_promo.jpg',
    text: 'ELON MUSK GIVEAWAY! To celebrate the new Tesla release, I am giving away 1000 BTC. Send between 0.1 BTC to 5 BTC to the official address below and get 2x back instantly! Only 12 hours left!',
    previewColor: 'from-yellow-500/20 to-cyber-bg'
  },
  {
    id: 'amazon_billing',
    name: 'Amazon Billing Update Link',
    fileName: 'amazon_billing_issue.png',
    text: 'Amazon Notice: Your recent payment was declined. We will cancel your Prime membership if you do not update your credit card details immediately. Click the short link: bit.ly/amz-verify-bill',
    previewColor: 'from-orange-500/20 to-cyber-bg'
  },
  {
    id: 'safe_dashboard',
    name: 'Safe Workspace Dashboard',
    fileName: 'my_jira_backlog.jpg',
    text: 'TrustCheck dashboard. Standard software dev project backlog: Refactor navigation component, write unit tests, review pull request #115.',
    previewColor: 'from-emerald-500/20 to-cyber-bg'
  }
];

/**
 * Analyze a screenshot based on filename/mock text extraction
 * @param {string} fileName 
 * @param {string} extractedText 
 * @returns {object} Normalized TrustCheck result
 */
export function analyzeScreenshot(fileName, extractedText = '') {
  const preset = SCREENSHOT_SCENARIOS.find(p => p.fileName === fileName || p.name === fileName);
  if (preset) {
    return analyzeMessage(preset.text);
  }

  if (extractedText && extractedText.trim().length > 0) {
    return analyzeMessage(extractedText);
  }

  let riskScore = 15;
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.includes('bank') || nameLower.includes('alert') || nameLower.includes('scam') || nameLower.includes('verification') || nameLower.includes('otp')) {
    riskScore = 45;
  }
  
  let riskLevel = 'Low apparent risk';
  let summary = 'Screenshot metadata did not reveal immediate high-risk scam patterns.';

  if (riskScore >= 70) {
    riskLevel = 'High risk indicators';
    summary = 'The screenshot context matches high-risk scam patterns.';
  } else if (riskScore >= 35) {
    riskLevel = 'Caution';
    summary = 'The screenshot filename matches keywords associated with sensitive security codes or alerts.';
  }

  const warningSigns = riskScore >= 35 ? [{
    title: 'Potentially Risky File Context',
    description: 'The file name matches keywords associated with transactional screenshots or OTP confirmations.'
  }] : [];

  return {
    riskScore,
    riskLevel,
    summary,
    warningSigns,
    recommendedActions: [
      'Do not share passwords, screenshots containing 2FA keys, or OTP lists.',
      'Check if the screen displays security codes or billing addresses before sharing it.',
      'Delete the image if it shows account numbers or bank login credentials.'
    ]
  };
}
