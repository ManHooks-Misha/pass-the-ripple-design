import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Eye, Lightbulb, AlertCircle, Info, X, FileText, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getPlainText } from "@/utils/textUtils";

interface SafetyIssue {
  type: "toxicity" | "profanity" | "hate_speech" | "image" | "complexity";
  severity: "high" | "medium" | "low";
  message: string;
  originalText?: string;
  suggestion?: string;
  example?: string;
  location?: string;
}

interface AgeGroupDetail {
  score: number;
  suitable: boolean;
  reasons: string[];
  improvements: string[];
  blockers: {
    issue: string;
    impact: string;
    fix: string;
  }[];
}

interface SafetyAnalysis {
  overallScore: number;
  isSafe: boolean;
  ageGroups: {
    "0-4": AgeGroupDetail;
    "5-7": AgeGroupDetail;
    "8-12": AgeGroupDetail;
    "13-17": AgeGroupDetail;
    "18+": AgeGroupDetail;
  };
  bestAgeGroup: string;
  textAnalysis: {
    toxicity: number;
    profanity: number;
    hateSpeech: number;
    inappropriate: number;
  };
  imageAnalysis: {
    safe: boolean;
    nsfwScore: number;
    detectedObjects?: string[];
    caption?: string;
  } | null;
  issues: SafetyIssue[];
  improvements: {
    original: string;
    suggested: string;
    reason: string;
  }[];
  contentAnalysis?: {
    complexity: number;
    matureThemes: number;
    positiveScore: number;
    avgSentenceLength: number;
  };
}

interface WordSuggestion {
  originalWord: string;
  suggestedWords: string[];
  reason: string;
  severity: "high" | "medium" | "low";
  position: { start: number; end: number };
  inTitle: boolean;
}

interface ContentSafetyCheckerProps {
  title: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  onAnalysisComplete: (analysis: SafetyAnalysis) => void;
  onTitleChange?: (newTitle: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
  autoAnalyze?: boolean;
  className?: string;
}

export const ContentSafetyChecker: React.FC<ContentSafetyCheckerProps> = ({
  title,
  description,
  imageFile,
  imagePreview,
  onAnalysisComplete,
  onTitleChange,
  onDescriptionChange,
  autoAnalyze = false,
  className = "",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<SafetyAnalysis[]>([]);
  const [wordSuggestions, setWordSuggestions] = useState<WordSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI || "";

  useEffect(() => {
    if (autoAnalyze && (title || description)) {
      const timer = setTimeout(() => {
        handleAnalyzeContent();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [title, description, imageFile, autoAnalyze]);

  // === OPENAI CONTENT ANALYSIS ===

  const analyzeTextWithOpenAI = async (text: string) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/moderations",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: text,
            model: "text-moderation-latest"
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI moderation failed: ${error.error?.message || 'Unknown error'}`);
      }
      return await response.json();
    } catch (error) {
      console.error("OpenAI moderation error:", error);
      return null;
    }
  };

  const analyzeImageWithOpenAI = async (imageBase64: string) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this image for content safety. Rate the following on a scale of 0-100: 1) NSFW content (nudity, violence, gore), 2) Appropriateness for children (0-4 years), 3) Appropriateness for ages 5-7, 4) Appropriateness for ages 8-12, 5) Appropriateness for ages 13-17. Also list any detected objects or themes. Respond in JSON format: {\"nsfw_score\": number, \"age_0_4\": number, \"age_5_7\": number, \"age_8_12\": number, \"age_13_17\": number, \"detected_objects\": string[], \"concerns\": string[]}"
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64
                    }
                  }
                ]
              }
            ],
            max_tokens: 500
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI vision failed: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (content) {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          return JSON.parse(jsonStr);
        }
      }

      return null;
    } catch (error) {
      console.error("OpenAI vision error:", error);
      return null;
    }
  };

  const generateKidProofSuggestions = async (text: string, isTitle: boolean): Promise<WordSuggestion[]> => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that makes text child-friendly and appropriate for all ages (0-17 years). Identify words or phrases that might be inappropriate for children, including: violent language, scary words, mature themes, strong emotions that might frighten kids, negative language, or anything not suitable for young audiences. Be thorough but reasonable - focus on truly problematic content."
              },
              {
                role: "user",
                content: `Analyze this ${isTitle ? 'title' : 'description'} for words that are inappropriate for children:\n\n"${text}"\n\nFor each inappropriate word/phrase found, provide:\n1. The EXACT original word/phrase as it appears in the text\n2. 3-5 kid-friendly alternatives\n3. Brief reason why it's inappropriate for children\n4. Severity level (high/medium/low)\n\nIMPORTANT: Only include the "original" word itself, not surrounding text.\n\nRespond in JSON format:\n{\n  "suggestions": [\n    {\n      "original": "exact word only",\n      "alternatives": ["kid-friendly word 1", "kid-friendly word 2", "kid-friendly word 3"],\n      "reason": "why it's inappropriate for children",\n      "severity": "high|medium|low"\n    }\n  ]\n}\n\nIf no inappropriate words are found, return:\n{\n  "suggestions": []\n}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI suggestions failed: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (content) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(jsonStr);

          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions
              .filter((s: any) => s.original && s.alternatives && s.alternatives.length > 0)
              .map((s: any) => ({
                originalWord: s.original.trim(),
                suggestedWords: s.alternatives || [],
                reason: s.reason || "Inappropriate for children",
                severity: s.severity || "medium",
                position: { start: 0, end: 0 }, // Not used anymore
                inTitle: isTitle
              }));
          }
        }
      }

      return [];
    } catch (error) {
      console.error("Kid-proof suggestions failed:", error);
      return [];
    }
  };

  const detectContentIssues = async (text: string): Promise<{ score: number; matches: any[] }> => {
    try {
      const moderationResult = await analyzeTextWithOpenAI(text);

      const matches: any[] = [];
      let totalScore = 0;

      if (!moderationResult || !moderationResult.results || !moderationResult.results[0]) {
        return { score: 0, matches: [] };
      }

      const result = moderationResult.results[0];
      const categories = result.categories;
      const categoryScores = result.category_scores;

      // Map OpenAI categories to our issue types
      const categoryMap: Record<string, { type: string; label: string; suggestion: string; alternatives: string[] }> = {
        "hate": {
          type: "hate_speech",
          label: "Hate speech",
          suggestion: "Remove discriminatory language and focus on positive messaging",
          alternatives: ["inclusive language", "respectful terms", "positive messaging"]
        },
        "hate/threatening": {
          type: "hate_speech",
          label: "Threatening hate speech",
          suggestion: "Remove threatening or violent language",
          alternatives: ["peaceful communication", "constructive dialogue", "respectful expression"]
        },
        "harassment": {
          type: "toxicity",
          label: "Harassment",
          suggestion: "Use respectful and constructive language",
          alternatives: ["polite expressions", "constructive feedback", "respectful communication"]
        },
        "harassment/threatening": {
          type: "toxicity",
          label: "Threatening harassment",
          suggestion: "Remove threatening language and communicate respectfully",
          alternatives: ["calm communication", "non-threatening language", "respectful dialogue"]
        },
        "self-harm": {
          type: "profanity",
          label: "Self-harm content",
          suggestion: "Avoid content that promotes self-harm. Consider positive alternatives",
          alternatives: ["positive coping strategies", "supportive resources", "constructive content"]
        },
        "sexual": {
          type: "profanity",
          label: "Sexual content",
          suggestion: "Use age-appropriate language suitable for all audiences",
          alternatives: ["family-friendly language", "appropriate expressions", "suitable content"]
        },
        "sexual/minors": {
          type: "profanity",
          label: "Sexual content involving minors",
          suggestion: "Remove any content involving minors in inappropriate contexts",
          alternatives: ["age-appropriate content", "child-safe material", "appropriate topics"]
        },
        "violence": {
          type: "toxicity",
          label: "Violent content",
          suggestion: "Reduce violent themes and use peaceful language",
          alternatives: ["peaceful resolution", "non-violent alternatives", "constructive approach"]
        },
        "violence/graphic": {
          type: "toxicity",
          label: "Graphic violence",
          suggestion: "Remove graphic descriptions and use gentler language",
          alternatives: ["mild descriptions", "non-graphic content", "appropriate language"]
        }
      };

      // Process each category
      Object.entries(categories).forEach(([category, flagged]) => {
        const score = categoryScores[category] || 0;

        // Only flag if score is above threshold or flagged by OpenAI
        if (flagged || score > 0.5) {
          const mapping = categoryMap[category];
          if (mapping) {
            const severity = score > 0.8 ? "high" : score > 0.5 ? "medium" : "low";
            matches.push({
              type: mapping.type,
              word: mapping.label,
              severity,
              score: score * 100,
              context: `AI-detected: ${mapping.label}`,
              suggestion: mapping.suggestion,
              alternatives: mapping.alternatives
            });
            totalScore += score * 100 * (severity === "high" ? 1.5 : severity === "medium" ? 1.0 : 0.5);
          }
        }
      });

      return {
        score: Math.min(totalScore, 100),
        matches
      };
    } catch (error) {
      console.error("OpenAI content detection failed:", error);
      return { score: 0, matches: [] };
    }
  };


  // === CONTENT COMPLEXITY ANALYSIS ===

  const analyzeContentComplexity = async (text: string) => {
    // Calculate basic readability metrics
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgSentenceLength = words / Math.max(sentences, 1);
    
    // Simple complexity score based on sentence length and word variety
    const uniqueWords = new Set(text.toLowerCase().split(/\W+/)).size;
    const lexicalDiversity = (uniqueWords / words) * 100;
    
    const complexityScore = Math.min(100, (avgSentenceLength * 3) + (lexicalDiversity * 0.5));

    // Detect mature themes (simple keyword-based approach)
    const matureThemes = ['death', 'violence', 'fear', 'danger', 'hate', 'kill', 'weapon', 'blood', 'terror', 'attack', 'fight', 'war'];
    const themeCount = matureThemes.reduce((count, theme) => {
      return count + (text.toLowerCase().match(new RegExp(theme, 'gi'))?.length || 0);
    }, 0);
    
    const matureThemeScore = Math.min(100, (themeCount / words) * 5000);

    // Positive sentiment detection
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

  // === DYNAMIC AGE GROUP SCORING ===

  const calculateDynamicAgeGroupScores = async (
    text: string,
    toxicityScore: number,
    profanityMatches: any[],
    imageNsfw: number,
    contentAnalysis: any
  ) => {
    const ageGroupConfig = {
      "0-4": { 
        maxToxicity: 5, 
        maxComplexity: 20,
        themeTolerance: 0.1,
        imageTolerance: 5,
        minPositive: 30
      },
      "5-7": { 
        maxToxicity: 10, 
        maxComplexity: 35,
        themeTolerance: 0.3,
        imageTolerance: 10,
        minPositive: 25
      },
      "8-12": { 
        maxToxicity: 20, 
        maxComplexity: 50,
        themeTolerance: 0.5,
        imageTolerance: 20,
        minPositive: 20
      },
      "13-17": { 
        maxToxicity: 35, 
        maxComplexity: 70,
        themeTolerance: 0.7,
        imageTolerance: 35,
        minPositive: 15
      },
      "18+": { 
        maxToxicity: 50, 
        maxComplexity: 90,
        themeTolerance: 0.9,
        imageTolerance: 50,
        minPositive: 10
      }
    };

    const ageGroups: any = {};

    for (const [ageGroup, config] of Object.entries(ageGroupConfig)) {
      let score = 100;
      const reasons: string[] = [];
      const improvements: string[] = [];
      const blockers: any[] = [];

      // Toxicity penalty
      if (toxicityScore > config.maxToxicity) {
        const penalty = (toxicityScore - config.maxToxicity) * 2;
        score -= penalty;
        reasons.push(`Toxicity level (${Math.round(toxicityScore)}%) exceeds safe limit for ${ageGroup}`);
        blockers.push({
          issue: `High toxicity: ${Math.round(toxicityScore)}%`,
          impact: `-${Math.round(penalty)}% score`,
          fix: "Remove aggressive language and use positive, constructive tone"
        });
      }

      // Complexity penalty
      if (contentAnalysis.complexity > config.maxComplexity) {
        const penalty = (contentAnalysis.complexity - config.maxComplexity) * 0.5;
        score -= penalty;
        reasons.push(`Content complexity too high (${contentAnalysis.complexity}%) for ${ageGroup} audience`);
        improvements.push("Simplify language and use shorter sentences");
      }

      // Theme appropriateness
      if (contentAnalysis.matureThemes > config.themeTolerance * 100) {
        const penalty = contentAnalysis.matureThemes * 0.3;
        score -= penalty;
        reasons.push(`Mature themes detected (${Math.round(contentAnalysis.matureThemes)}%)`);
        improvements.push("Consider reducing mature themes for younger audiences");
      }

      // Positive content bonus
      if (contentAnalysis.positiveScore > config.minPositive) {
        const bonus = Math.min(10, (contentAnalysis.positiveScore - config.minPositive) * 0.2);
        score += bonus;
        reasons.push("Positive and constructive tone detected");
      }

      // Profanity matches penalty
      const highSeverityMatches = profanityMatches.filter(m => m.severity === "high");
      const mediumSeverityMatches = profanityMatches.filter(m => m.severity === "medium");
      
      if (highSeverityMatches.length > 0) {
        const penalty = highSeverityMatches.length * (ageGroup <= "12" ? 15 : 8);
        score -= penalty;
        reasons.push(`Found ${highSeverityMatches.length} high-severity inappropriate terms`);
        
        highSeverityMatches.forEach(match => {
          blockers.push({
            issue: `Inappropriate term: "${match.word}"`,
            impact: `-${ageGroup <= "12" ? 15 : 8}% score`,
            fix: `Replace with: "${match.alternatives[0]}"`
          });
        });
      }
      
      if (mediumSeverityMatches.length > 0 && ageGroup <= "7") {
        const penalty = mediumSeverityMatches.length * 8;
        score -= penalty;
        reasons.push(`Found ${mediumSeverityMatches.length} moderate-severity inappropriate terms`);
      }

      // Image safety penalty
      if (imageNsfw > config.imageTolerance) {
        const penalty = (imageNsfw - config.imageTolerance) * 1.5;
        score -= penalty;
        reasons.push(`Image content (${Math.round(imageNsfw)}% NSFW) inappropriate for ${ageGroup}`);
        blockers.push({
          issue: `Image safety: ${Math.round(imageNsfw)}% NSFW`,
          impact: `-${Math.round(penalty)}% score`,
          fix: "Use age-appropriate images: educational, nature, positive activities"
        });
      }

      // Content length considerations
      if (ageGroup <= "7" && contentAnalysis.wordCount > 200) {
        score -= 5;
        reasons.push("Content may be too long for young audiences");
        improvements.push("Consider breaking content into smaller sections");
      }

      ageGroups[ageGroup] = {
        score: Math.max(0, Math.min(100, Math.round(score))),
        suitable: score >= (ageGroup === "0-4" ? 85 : ageGroup === "5-7" ? 80 : ageGroup === "8-12" ? 75 : ageGroup === "13-17" ? 70 : 65),
        reasons,
        improvements: improvements.slice(0, 3),
        blockers
      };
    }

    return ageGroups;
  };

  // === ENHANCED IMAGE ANALYSIS WITH OPENAI ===

  const analyzeImageComprehensive = async (imageBase64: string) => {
    try {
      const analysisResult = await analyzeImageWithOpenAI(imageBase64);

      if (!analysisResult) {
        return {
          safe: true,
          nsfwScore: 0,
          detectedObjects: [],
          hasRiskyObjects: false
        };
      }

      const nsfwScore = analysisResult.nsfw_score || 0;
      const safe = nsfwScore < 30;
      const detectedObjects = analysisResult.detected_objects || [];
      const concerns = analysisResult.concerns || [];

      return {
        safe,
        nsfwScore: Math.round(nsfwScore),
        detectedObjects: detectedObjects.slice(0, 10),
        hasRiskyObjects: concerns.length > 0,
        ageScores: {
          "0-4": analysisResult.age_0_4 || 100,
          "5-7": analysisResult.age_5_7 || 100,
          "8-12": analysisResult.age_8_12 || 100,
          "13-17": analysisResult.age_13_17 || 100
        }
      };
    } catch (error) {
      console.error("OpenAI image analysis failed:", error);
      return {
        safe: true,
        nsfwScore: 0,
        detectedObjects: [],
        hasRiskyObjects: false
      };
    }
  };


  // === WORD REPLACEMENT FUNCTION ===

  const handleReplaceWord = (suggestion: WordSuggestion, replacementWord: string) => {
    try {
      if (suggestion.inTitle) {
        // Replace in title
        const currentTitle = title;
        const originalWord = suggestion.originalWord;

        // Find and replace the word (case-insensitive but preserve case)
        const regex = new RegExp(originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const newTitle = currentTitle.replace(regex, replacementWord);

        if (onTitleChange) {
          onTitleChange(newTitle);

          toast({
            title: "✅ Title Updated!",
            description: `Changed "${originalWord}" to "${replacementWord}"`,
          });
        }
      } else {
        // Replace in description
        const currentDescription = description;
        const plainDescription = getPlainText(currentDescription);
        const originalWord = suggestion.originalWord;

        // Find and replace the word
        const regex = new RegExp(originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        // For rich text, we need to replace in the HTML content
        let newDescription = currentDescription;

        // If it's plain text
        if (currentDescription === plainDescription) {
          newDescription = currentDescription.replace(regex, replacementWord);
        } else {
          // If it's HTML/rich text, replace in the text nodes
          newDescription = currentDescription.replace(regex, replacementWord);
        }

        if (onDescriptionChange) {
          onDescriptionChange(newDescription);

          toast({
            title: "✅ Description Updated!",
            description: `Changed "${originalWord}" to "${replacementWord}"`,
          });
        }
      }

      // Remove this suggestion from the list
      setWordSuggestions(prev => prev.filter(s => s !== suggestion));

    } catch (error) {
      console.error("Error replacing word:", error);
      toast({
        title: "⚠️ Replacement Failed",
        description: "Could not replace the word. Please try editing manually.",
        variant: "destructive",
      });
    }
  };

  // === AUTO-GENERATE SUGGESTIONS AFTER ANALYSIS ===

  const generateSuggestionsForContent = async () => {
    if (!title && !description) return;

    setIsGeneratingSuggestions(true);

    try {
      const [titleSuggestions, descriptionSuggestions] = await Promise.all([
        title ? generateKidProofSuggestions(title, true) : Promise.resolve([]),
        description ? generateKidProofSuggestions(getPlainText(description), false) : Promise.resolve([])
      ]);

      const allSuggestions = [...titleSuggestions, ...descriptionSuggestions];
      setWordSuggestions(allSuggestions);

      if (allSuggestions.length > 0) {
        toast({
          title: "✨ Suggestions Found!",
          description: `Found ${allSuggestions.length} word(s) that could be improved for kids`,
        });
      } else {
        toast({
          title: "🎉 Great Job!",
          description: "Your content looks kid-friendly! No inappropriate words found.",
        });
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast({
        title: "⚠️ Analysis Failed",
        description: "Could not analyze content. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // === MAIN ANALYSIS FUNCTION ===

  const handleAnalyzeContent = async () => {
    if (!title && !description) {
      toast({
        title: "Nothing to analyze",
        description: "Please enter title or description first",
        variant: "destructive",
      });
      return;
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "") {
      toast({
        title: "API Key Missing",
        description: "Please add VITE_OPEN_AI to your .env file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setShowReport(true);

    try {
      const combinedText = `${title} ${description}`.trim();

      // Run all analyses in parallel using OpenAI
      const [contentIssues, imageAnalysis, contentAnalysis] = await Promise.all([
        detectContentIssues(combinedText),
        imagePreview ? analyzeImageComprehensive(imagePreview) : Promise.resolve(null),
        analyzeContentComplexity(combinedText)
      ]);

      // Extract scores from OpenAI moderation results
      let toxicityScore = 0;
      let hateSpeechScore = 0;
      let profanityScore = 0;

      // Calculate scores based on detected issues
      contentIssues.matches.forEach((match: any) => {
        if (match.type === "hate_speech") {
          hateSpeechScore = Math.max(hateSpeechScore, match.score);
        } else if (match.type === "toxicity") {
          toxicityScore = Math.max(toxicityScore, match.score);
        } else if (match.type === "profanity") {
          profanityScore = Math.max(profanityScore, match.score);
        }
      });

      // Calculate dynamic age group scores
      const ageGroups = await calculateDynamicAgeGroupScores(
        combinedText,
        toxicityScore,
        contentIssues.matches,
        imageAnalysis?.nsfwScore || 0,
        contentAnalysis
      );

      // Determine best age group
      const bestAge = Object.entries(ageGroups)
        .filter(([_, data]) => data.suitable)
        .sort((a, b) => a[0].localeCompare(b[0]))[0]?.[0] || "18+";

      // Calculate overall score
      const overallScore = Math.round(
        Object.values(ageGroups).reduce((sum, g) => sum + g.score, 0) / 5
      );

      // Generate issues from dynamic analysis
      const issues: SafetyIssue[] = [];

      // Add toxicity issues
      if (toxicityScore > 30) {
        issues.push({
          type: "toxicity",
          severity: toxicityScore > 60 ? "high" : toxicityScore > 30 ? "medium" : "low",
          message: `Toxic content detected (${Math.round(toxicityScore)}% confidence)`,
          suggestion: "Use positive, constructive language instead of negative expressions",
          example: 'Instead of "This is terrible", try "This could be improved in these ways..."'
        });
      }

      // Add hate speech issues
      if (hateSpeechScore > 25) {
        issues.push({
          type: "hate_speech",
          severity: hateSpeechScore > 50 ? "high" : "medium",
          message: `Hate speech indicators detected (${Math.round(hateSpeechScore)}% confidence)`,
          suggestion: "Remove any discriminatory language and focus on inclusive messaging",
          example: "Focus on describing situations rather than targeting groups"
        });
      }

      // Add content issues from OpenAI moderation
      contentIssues.matches.forEach((match: any) => {
        issues.push({
          type: match.type as any,
          severity: match.severity,
          message: `Inappropriate content detected: ${match.word}`,
          originalText: match.context,
          suggestion: match.suggestion,
          example: `Try: "${match.alternatives[0]}"`
        });
      });

      // Add image issues
      if (imageAnalysis && !imageAnalysis.safe) {
        issues.push({
          type: "image",
          severity: imageAnalysis.nsfwScore > 60 ? "high" : "medium",
          message: `Image may contain inappropriate content (${imageAnalysis.nsfwScore}% NSFW)`,
          suggestion: "Choose a different, age-appropriate image",
          example: "Use images showing positive activities, nature, or educational content"
        });
      }

      // Add complexity issues for young age groups
      if (contentAnalysis.complexity > 70 && !ageGroups["0-4"].suitable) {
        issues.push({
          type: "complexity",
          severity: "medium",
          message: "Content may be too complex for young readers",
          suggestion: "Simplify language and use shorter sentences",
          example: "Break down complex ideas into simpler concepts"
        });
      }

      const analysis: SafetyAnalysis = {
        overallScore,
        isSafe: overallScore >= 70 && issues.filter(i => i.severity === "high").length === 0,
        ageGroups,
        bestAgeGroup: bestAge,
        textAnalysis: {
          toxicity: Math.round(toxicityScore),
          profanity: Math.round(profanityScore),
          hateSpeech: Math.round(hateSpeechScore),
          inappropriate: Math.round((toxicityScore + profanityScore + hateSpeechScore) / 3),
        },
        imageAnalysis: imageAnalysis ? {
          safe: imageAnalysis.safe,
          nsfwScore: imageAnalysis.nsfwScore,
          detectedObjects: imageAnalysis.detectedObjects,
          caption: imageAnalysis.detectedObjects?.join(", ") || "No objects detected"
        } : null,
        issues,
        improvements: contentIssues.matches.map((match: any) => ({
          original: match.word,
          suggested: match.alternatives[0],
          reason: match.suggestion
        })).slice(0, 5),
        contentAnalysis
      };

      setSafetyAnalysis(analysis);
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 4)]); // Keep last 5 analyses
      onAnalysisComplete(analysis);

      toast({
        title: analysis.isSafe ? "Content is Safe! ✅" : "Issues Found ⚠️",
        description: analysis.isSafe 
          ? `Overall safety score: ${analysis.overallScore}% - Best for ${analysis.bestAgeGroup}`
          : `Found ${issues.length} issue(s). Click age groups for details.`,
        variant: analysis.isSafe ? "default" : "destructive",
      });

    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete safety check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const SeverityBadge: React.FC<{ severity: "high" | "medium" | "low" }> = ({ severity }) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      low: "bg-blue-100 text-blue-700 border-blue-300"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const clearAnalysis = () => {
    setSafetyAnalysis(null);
    setShowReport(false);
    setSelectedAgeGroup(null);
  };

  // === UI RENDER ===
  return (
    <div className={`w-full space-y-3 sm:space-y-4 ${className}`}>
      {/* Compact Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={handleAnalyzeContent}
          disabled={isAnalyzing || (!title && !description)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="font-semibold">Analyzing Safety...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              <span className="font-semibold">Check Safety Score</span>
            </>
          )}
        </Button>
        <Button
          onClick={generateSuggestionsForContent}
          disabled={isGeneratingSuggestions || (!title && !description)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          size="lg"
        >
          {isGeneratingSuggestions ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="font-semibold">Finding Words...</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              <span className="font-semibold">Get Word Suggestions</span>
            </>
          )}
        </Button>
      </div>

      {/* Quick Info Banner */}
      {(title || description) && !wordSuggestions.length && !safetyAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-3 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Ready to make your content kid-safe!</p>
              <p className="text-xs text-blue-700 mt-1">
                Click <strong>"Check Safety Score"</strong> for detailed analysis or <strong>"Get Word Suggestions"</strong> to find & fix inappropriate words instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Word Suggestions Section - Enhanced UI */}
      {wordSuggestions.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-green-500 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3 border-b border-green-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">Word Suggestions Found!</span>
                    <p className="text-xs font-normal text-green-600 mt-0.5">
                      {wordSuggestions.length} word{wordSuggestions.length !== 1 ? 's' : ''} to improve
                    </p>
                  </div>
                </CardTitle>
                <Button
                  onClick={() => setWordSuggestions([])}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 p-3 bg-white/60 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>How it works:</strong> Click any green button below to instantly replace inappropriate words with kid-friendly alternatives!</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {wordSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="group bg-white border-2 border-green-200 rounded-xl p-4 hover:border-green-400 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="space-y-3">
                    {/* Header with badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                          {suggestion.inTitle ? (
                            <><FileText className="w-3 h-3" /> In Title</>
                          ) : (
                            <><FileText className="w-3 h-3" /> In Description</>
                          )}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                          suggestion.severity === 'high' ? 'bg-red-100 text-red-700' :
                          suggestion.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {suggestion.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Original Word */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">❌ Inappropriate Word</p>
                      <p className="text-xl font-bold text-red-700 line-through">
                        "{suggestion.originalWord}"
                      </p>
                    </div>

                    {/* Reason */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                      <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Why This Word is Flagged
                      </p>
                      <p className="text-sm text-amber-800">{suggestion.reason}</p>
                    </div>

                    {/* Replacement Options */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                        ✨ Click to Replace with Kid-Friendly Words:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.suggestedWords.map((word, wordIdx) => (
                          <Button
                            key={wordIdx}
                            onClick={() => handleReplaceWord(suggestion, word)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-green-600"
                            size="lg"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            "{word}"
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Report */}
      {showReport && safetyAnalysis && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {safetyAnalysis.isSafe ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <span>Safety Report</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearAnalysis}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Overall Safety Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{safetyAnalysis.overallScore}%</p>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  Best for: {safetyAnalysis.bestAgeGroup} years | 
                  Words: {safetyAnalysis.contentAnalysis?.wordCount} | 
                  Sentences: {safetyAnalysis.contentAnalysis?.sentenceCount}
                </p>
              </div>
              <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap ${
                safetyAnalysis.isSafe 
                  ? "bg-green-100 text-green-700 border-2 border-green-300" 
                  : "bg-red-100 text-red-700 border-2 border-red-300"
              }`}>
                {safetyAnalysis.isSafe ? "✅ Safe to Post" : "⚠️ Needs Review"}
              </div>
            </div>

            {/* Age Groups - Clickable */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Eye className="w-4 h-4 flex-shrink-0" />
                <h4 className="font-semibold text-sm sm:text-base">Age Group Suitability</h4>
                <span className="text-xs text-muted-foreground">(Click to see details)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(safetyAnalysis.ageGroups).map(([age, data]) => (
                  <button
                    key={age}
                    onClick={() => setSelectedAgeGroup(selectedAgeGroup === age ? null : age)}
                    className={`p-2 sm:p-3 rounded-lg text-center border-2 transition-all cursor-pointer hover:scale-105 ${
                      selectedAgeGroup === age
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : ""
                    } ${
                      data.suitable
                        ? "border-green-500 bg-green-50"
                        : data.score >= 50
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-muted-foreground">{age}</p>
                    <p className="text-lg sm:text-xl font-bold my-1">{data.score}%</p>
                    <p className="text-base sm:text-lg">
                      {data.suitable ? "✅" : data.score >= 50 ? "⚠️" : "❌"}
                    </p>
                    <Info className="w-3 h-3 mx-auto mt-1 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Details Panel */}
            {selectedAgeGroup && safetyAnalysis.ageGroups[selectedAgeGroup as keyof typeof safetyAnalysis.ageGroups] && (
              <Card className="border-2 border-blue-500 bg-blue-50/50">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="text-sm sm:text-base">📊 {selectedAgeGroup} Years Analysis</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAgeGroup(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                  {(() => {
                    const ageData = safetyAnalysis.ageGroups[selectedAgeGroup as keyof typeof safetyAnalysis.ageGroups];
                    
                    return (
                      <>
                        {/* Score Summary */}
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border">
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Current Score</p>
                            <p className="text-xl sm:text-2xl font-bold text-primary">{ageData.score}%</p>
                          </div>
                          <div className={`text-2xl sm:text-4xl ${ageData.suitable ? "text-green-500" : "text-red-500"}`}>
                            {ageData.suitable ? "✅" : "❌"}
                          </div>
                        </div>

                        {/* Reasons */}
                        {ageData.reasons.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Why This Score?
                            </h5>
                            <div className="space-y-2">
                              {ageData.reasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm bg-white p-2 rounded border">
                                  <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                                  <span className="break-words">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Blockers */}
                        {ageData.blockers.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2 text-red-700">
                              <XCircle className="w-4 h-4" />
                              Issues Lowering Your Score ({ageData.blockers.length})
                            </h5>
                            {ageData.blockers.map((blocker, idx) => (
                              <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-3 rounded-r space-y-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                  <p className="font-semibold text-red-800 text-xs sm:text-sm break-words flex-1">{blocker.issue}</p>
                                  <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded font-semibold whitespace-nowrap">
                                    {blocker.impact}
                                  </span>
                                </div>
                                <div className="bg-white/70 p-2 rounded">
                                  <p className="text-xs text-green-700 font-semibold mb-1">✅ How to Fix:</p>
                                  <p className="text-sm text-green-800">{blocker.fix}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Improvements Checklist */}
                        {ageData.improvements.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2 text-green-700">
                              <Lightbulb className="w-4 h-4" />
                              Improvement Checklist
                            </h5>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                              {ageData.improvements.map((improvement, idx) => (
                                <label key={idx} className="flex items-start gap-3 p-2 hover:bg-green-100 rounded cursor-pointer transition-colors">
                                  <input 
                                    type="checkbox" 
                                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                  <span className="text-sm text-green-800 flex-1">{improvement}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Success Message */}
                        {ageData.suitable && (
                          <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded-r">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-green-800 text-sm">Perfect for {selectedAgeGroup} Age Group!</p>
                                <p className="text-xs text-green-700 mt-1">
                                  Your content meets all safety requirements for this age range.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action needed */}
                        {!ageData.suitable && ageData.score < 50 && (
                          <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded-r">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-orange-800 text-sm">Major Improvements Needed</p>
                                <p className="text-xs text-orange-700 mt-1">
                                  Content needs significant changes to be appropriate for {selectedAgeGroup} age group. 
                                  Please address all issues listed above.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Content Metrics */}
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3">Content Metrics</h4>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Toxicity</p>
                  <p className="text-xl sm:text-2xl font-bold">{safetyAnalysis.textAnalysis.toxicity}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${safetyAnalysis.textAnalysis.toxicity}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Profanity</p>
                  <p className="text-xl sm:text-2xl font-bold">{safetyAnalysis.textAnalysis.profanity}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${safetyAnalysis.textAnalysis.profanity}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Hate Speech</p>
                  <p className="text-xl sm:text-2xl font-bold">{safetyAnalysis.textAnalysis.hateSpeech}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${safetyAnalysis.textAnalysis.hateSpeech}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Complexity</p>
                  <p className="text-xl sm:text-2xl font-bold">{safetyAnalysis.contentAnalysis?.complexity || 0}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${safetyAnalysis.contentAnalysis?.complexity || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Analysis */}
            {safetyAnalysis.imageAnalysis && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Image Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                    safetyAnalysis.imageAnalysis.safe 
                      ? "border-green-500 bg-green-50" 
                      : "border-red-500 bg-red-50"
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                      <span className="font-semibold text-sm sm:text-base">Safety Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        safetyAnalysis.imageAnalysis.safe 
                          ? "bg-green-200 text-green-800" 
                          : "bg-red-200 text-red-800"
                      }`}>
                        {safetyAnalysis.imageAnalysis.safe ? "✅ Safe" : "⚠️ Review Needed"}
                      </span>
                    </div>
                    <p className="text-sm">NSFW Score: {safetyAnalysis.imageAnalysis.nsfwScore}%</p>
                    {safetyAnalysis.imageAnalysis.detectedObjects && safetyAnalysis.imageAnalysis.detectedObjects.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Detected Objects:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {safetyAnalysis.imageAnalysis.detectedObjects.map((obj, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white rounded text-xs border">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="flex justify-center">
                      <img 
                        src={imagePreview} 
                        alt="Analyzed content" 
                        className="max-h-32 rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detailed Issues */}
            {safetyAnalysis.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Issues Found ({safetyAnalysis.issues.length})
                </h4>
                {safetyAnalysis.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={issue.severity} />
                          {issue.location && (
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              In: {issue.location}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-red-800">{issue.message}</p>
                      </div>
                    </div>
                    
                    {issue.originalText && (
                      <div className="bg-white/50 p-2 rounded border border-red-200">
                        <p className="text-xs text-muted-foreground mb-1">Found:</p>
                        <p className="text-sm text-red-700 font-mono">"{issue.originalText}"</p>
                      </div>
                    )}
                    
                    {issue.suggestion && (
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-1">💡 Suggestion:</p>
                        <p className="text-sm text-green-800">{issue.suggestion}</p>
                      </div>
                    )}
                    
                    {issue.example && (
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-1">📝 Example:</p>
                        <p className="text-sm text-blue-800">{issue.example}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Improvements */}
            {safetyAnalysis.improvements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-blue-700">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quick Fixes ({safetyAnalysis.improvements.length})
                </h4>
                <div className="space-y-2">
                  {safetyAnalysis.improvements.slice(0, 5).map((improvement, idx) => (
                    <div key={idx} className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded whitespace-nowrap">
                              REPLACE
                            </span>
                            <span className="text-xs sm:text-sm line-through text-red-600 break-words">"{improvement.original}"</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded whitespace-nowrap">
                              WITH
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-green-700 break-words">"{improvement.suggested}"</span>
                          </div>
                          <p className="text-xs text-muted-foreground italic mt-1">
                            Reason: {improvement.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {safetyAnalysis.isSafe && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Content is Safe! 🎉</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your content meets safety standards for {safetyAnalysis.bestAgeGroup} age group. 
                      You can submit it now!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Helper Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">💡 Pro Tip:</p>
                  <p>Click on any age group above to see detailed reasons why it scored that percentage and get specific improvement suggestions for that age range.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisHistory.map((analysis, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      analysis.isSafe ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className="font-medium">{analysis.overallScore}% Safety</span>
                    <span className="text-sm text-muted-foreground">
                      Best for: {analysis.bestAgeGroup}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSafetyAnalysis(analysis);
                      setShowReport(true);
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};