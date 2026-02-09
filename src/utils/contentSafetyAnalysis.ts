// Utility function to analyze content safety
// This can be called programmatically from form submission

import { getPlainText } from "@/utils/textUtils";

interface SafetyAnalysis {
  overallScore: number;
  isSafe: boolean;
  issues: Array<{
    type: string;
    severity: "high" | "medium" | "low";
    message: string;
    suggestion?: string;
  }>;
}

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || "";

const analyzeWithModel = async (text: string, model: string) => {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    if (!response.ok) throw new Error(`Model ${model} failed`);
    return await response.json();
  } catch (error) {
    console.error(`Model ${model} error:`, error);
    return null;
  }
};

const analyzeTextToxicity = async (text: string) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/unitary/multilingual-toxic-xlm-roberta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    if (!response.ok) throw new Error("Toxicity analysis failed");
    return await response.json();
  } catch (error) {
    console.error("Text toxicity error:", error);
    return null;
  }
};

const detectProfanityDynamically = async (text: string): Promise<{ score: number; matches: any[] }> => {
  try {
    const [toxicResult, hateResult, insultResult] = await Promise.all([
      analyzeWithModel(text, "unitary/multilingual-toxic-xlm-roberta"),
      analyzeWithModel(text, "facebook/roberta-hate-speech-dynabench-r4-target"),
      analyzeWithModel(text, "cardiffnlp/twitter-roberta-base-offensive")
    ]);

    const matches: any[] = [];
    let totalScore = 0;

    // Process toxic content
    if (toxicResult && Array.isArray(toxicResult[0])) {
      toxicResult[0].forEach((item: any) => {
        if (item.score > 0.3) {
          const severity = item.score > 0.7 ? "high" : item.score > 0.5 ? "medium" : "low";
          matches.push({
            type: "toxicity",
            word: item.label,
            severity,
            score: item.score * 100,
          });
          totalScore += item.score * (severity === "high" ? 20 : severity === "medium" ? 10 : 5);
        }
      });
    }

    // Process hate speech
    if (hateResult && Array.isArray(hateResult[0])) {
      hateResult[0].forEach((item: any) => {
        if (item.score > 0.3) {
          matches.push({
            type: "hate_speech",
            word: item.label,
            severity: "high",
            score: item.score * 100,
          });
          totalScore += item.score * 25;
        }
      });
    }

    // Process insults
    if (insultResult && Array.isArray(insultResult[0])) {
      insultResult[0].forEach((item: any) => {
        if (item.score > 0.3) {
          const severity = item.score > 0.7 ? "high" : "medium";
          matches.push({
            type: "profanity",
            word: item.label,
            severity,
            score: item.score * 100,
          });
          totalScore += item.score * (severity === "high" ? 15 : 8);
        }
      });
    }

    return { score: Math.min(100, totalScore), matches };
  } catch (error) {
    console.error("Profanity detection error:", error);
    return { score: 0, matches: [] };
  }
};

const analyzeContentComplexity = (text: string) => {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgSentenceLength = words / Math.max(sentences, 1);
  
  const uniqueWords = new Set(text.toLowerCase().split(/\W+/)).size;
  const lexicalDiversity = (uniqueWords / words) * 100;
  
  const complexityScore = Math.min(100, (avgSentenceLength * 3) + (lexicalDiversity * 0.5));

  const matureThemes = ['death', 'violence', 'fear', 'danger', 'hate', 'kill', 'weapon', 'blood', 'terror', 'attack', 'fight', 'war'];
  const themeCount = matureThemes.reduce((count, theme) => {
    return count + (text.toLowerCase().match(new RegExp(theme, 'gi'))?.length || 0);
  }, 0);
  
  const matureThemeScore = Math.min(100, (themeCount / words) * 5000);

  const positiveWords = ['happy', 'good', 'nice', 'love', 'friend', 'help', 'kind', 'fun', 'joy', 'peace', 'beautiful', 'wonderful', 'amazing', 'great'];
  const positiveCount = positiveWords.reduce((count, word) => {
    return count + (text.toLowerCase().match(new RegExp(word, 'gi'))?.length || 0);
  }, 0);
  
  const positiveScore = Math.min(100, (positiveCount / words) * 3000);

  return {
    complexity: Math.round(complexityScore),
    matureThemes: Math.round(matureThemeScore),
    positiveScore: Math.round(positiveScore),
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    wordCount: words,
    sentenceCount: sentences
  };
};

const calculateAgeGroupScores = (
  text: string,
  toxicityScore: number,
  profanityMatches: any[],
  contentAnalysis: any
) => {
  const ageGroupConfig = {
    "8-12": { 
      maxToxicity: 20, 
      maxComplexity: 50,
      themeTolerance: 0.5,
      minPositive: 20
    },
  };

  const ageGroup = ageGroupConfig["8-12"];
  let score = 100;
  const issues: any[] = [];

  // Toxicity penalty
  if (toxicityScore > ageGroup.maxToxicity) {
    const penalty = (toxicityScore - ageGroup.maxToxicity) * 2;
    score -= penalty;
    issues.push({
      type: "toxicity",
      severity: toxicityScore > 50 ? "high" : "medium",
      message: `Found some words that might not be appropriate for kids`,
      suggestion: "Try using more positive and kind words"
    });
  }

  // Complexity penalty
  if (contentAnalysis.complexity > ageGroup.maxComplexity) {
    const penalty = (contentAnalysis.complexity - ageGroup.maxComplexity) * 0.5;
    score -= penalty;
    issues.push({
      type: "complexity",
      severity: "medium",
      message: `Your story might be a bit hard for younger kids to understand`,
      suggestion: "Try using simpler words and shorter sentences"
    });
  }

  // Theme appropriateness
  if (contentAnalysis.matureThemes > ageGroup.themeTolerance * 100) {
    const penalty = contentAnalysis.matureThemes * 0.3;
    score -= penalty;
    issues.push({
      type: "mature_themes",
      severity: "high",
      message: `Your story mentions topics that might not be suitable for kids`,
      suggestion: "Focus on positive and happy stories about kindness"
    });
  }

  // Profanity matches penalty
  const highSeverityMatches = profanityMatches.filter(m => m.severity === "high");
  if (highSeverityMatches.length > 0) {
    const penalty = highSeverityMatches.length * 15;
    score -= penalty;
    issues.push({
      type: "profanity",
      severity: "high",
      message: `Found words that are not appropriate for kids`,
      suggestion: "Please remove any bad words and use kind language instead"
    });
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    issues
  };
};

/**
 * Analyze content safety for kids
 * Returns analysis with overallScore and isSafe flag
 * isSafe is true if overallScore >= 70
 */
export const analyzeContentSafety = async (
  title: string,
  description: string
): Promise<SafetyAnalysis> => {
  if (!HF_API_KEY || HF_API_KEY === "") {
    // If no API key, return safe by default (but log warning)
    console.warn("HuggingFace API key not found. Content safety check skipped.");
    return {
      overallScore: 100,
      isSafe: true,
      issues: []
    };
  }

  try {
    const combinedText = `${title} ${description}`.trim();
    const plainText = getPlainText(combinedText);

    if (!plainText || plainText.length < 3) {
      return {
        overallScore: 100,
        isSafe: true,
        issues: []
      };
    }

    // Run analyses in parallel
    const [toxicityResult, profanityAnalysis, contentAnalysis] = await Promise.all([
      analyzeTextToxicity(plainText),
      detectProfanityDynamically(plainText),
      Promise.resolve(analyzeContentComplexity(plainText))
    ]);

    // Extract toxicity scores
    let toxicityScore = 0;
    let hateSpeechScore = 0;

    if (toxicityResult && Array.isArray(toxicityResult[0])) {
      const toxic = toxicityResult[0].find((item: any) => item.label === "toxic");
      const hate = toxicityResult[0].find((item: any) => item.label === "hate");
      toxicityScore = toxic ? toxic.score * 100 : 0;
      hateSpeechScore = hate ? hate.score * 100 : 0;
    }

    // Calculate age group scores (focusing on 8-12 age group for kids)
    const ageGroupResult = calculateAgeGroupScores(
      plainText,
      toxicityScore,
      profanityAnalysis.matches,
      contentAnalysis
    );

    // Overall score is the age group score
    const overallScore = ageGroupResult.score;

    // Add hate speech issues
    if (hateSpeechScore > 25) {
      ageGroupResult.issues.push({
        type: "hate_speech",
        severity: hateSpeechScore > 50 ? "high" : "medium",
        message: `Found language that might hurt others' feelings`,
        suggestion: "Use kind and respectful words that include everyone"
      });
    }

    // Determine if safe (70% threshold)
    const isSafe = overallScore >= 70 && 
                   ageGroupResult.issues.filter(i => i.severity === "high").length === 0;

    return {
      overallScore,
      isSafe,
      issues: ageGroupResult.issues
    };
  } catch (error) {
    console.error("Content safety analysis error:", error);
    // On error, allow submission but log warning
    return {
      overallScore: 100,
      isSafe: true,
      issues: []
    };
  }
};

