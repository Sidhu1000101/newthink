const natural = require('natural');

/**
 * TF-IDF Plagiarism Detection Service
 * Uses TF-IDF vectorization and cosine similarity to detect plagiarism
 */

class PlagiarismDetector {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Preprocess text for analysis
   * @param {string} text - Raw text to preprocess
   * @returns {string} Preprocessed text
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate cosine similarity between two text documents
   * @param {string} text1 - First document
   * @param {string} text2 - Second document
   * @returns {number} Cosine similarity (0-1)
   */
  calculateCosineSimilarity(text1, text2) {
    const processedText1 = this.preprocessText(text1);
    const processedText2 = this.preprocessText(text2);

    if (!processedText1 || !processedText2) {
      return 0;
    }

    // Create TF-IDF vectors
    this.tfidf.addDocument(processedText1);
    this.tfidf.addDocument(processedText2);

    // Get document vectors
    const vec1 = this.getDocumentVector(0);
    const vec2 = this.getDocumentVector(1);

    // Calculate cosine similarity
    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Get TF-IDF vector for a document
   * @param {number} docIndex - Document index
   * @returns {Object} TF-IDF vector
   */
  getDocumentVector(docIndex) {
    const vector = {};
    const document = this.tfidf.documents[docIndex];
    
    for (const term of document) {
      vector[term] = this.tfidf.tfidf(term, docIndex);
    }

    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Object} vec1 - First vector
   * @param {Object} vec2 - Second vector
   * @returns {number} Cosine similarity (0-1)
   */
  cosineSimilarity(vec1, vec2) {
    // Get all unique terms
    const terms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const term of terms) {
      const v1 = vec1[term] || 0;
      const v2 = vec2[term] || 0;

      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Detect plagiarism by comparing with previous submissions
   * @param {string} currentText - Current submission text
   * @param {Array} previousSubmissions - Array of previous submission objects
   * @returns {Object} Plagiarism detection result
   */
  async detectPlagiarism(currentText, previousSubmissions) {
    if (!currentText || currentText.trim().length < 10) {
      return {
        riskPercentage: 0,
        riskLevel: 'LOW',
        similarSubmissions: [],
        message: 'Text too short for meaningful analysis'
      };
    }

    if (!previousSubmissions || previousSubmissions.length === 0) {
      return {
        riskPercentage: 0,
        riskLevel: 'LOW',
        similarSubmissions: [],
        message: 'No previous submissions to compare with'
      };
    }

    const similarities = [];
    let maxSimilarity = 0;

    // Compare with each previous submission
    for (const submission of previousSubmissions) {
      if (!submission.content || submission.content.trim().length < 10) {
        continue;
      }

      const similarity = this.calculateCosineSimilarity(currentText, submission.content);
      
      similarities.push({
        submissionId: submission.id,
        similarity: similarity,
        similarityPercentage: Math.round(similarity * 100)
      });

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    // Calculate risk percentage
    const riskPercentage = Math.round(maxSimilarity * 100);

    // Determine risk level
    let riskLevel = 'LOW';
    if (riskPercentage > 70) {
      riskLevel = 'HIGH';
    } else if (riskPercentage > 40) {
      riskLevel = 'MEDIUM';
    }

    // Get top similar submissions
    const similarSubmissions = similarities
      .filter(s => s.similarity > 0.3) // Only include submissions with >30% similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Top 5 similar submissions

    return {
      riskPercentage,
      riskLevel,
      similarSubmissions,
      message: `Compared with ${previousSubmissions.length} previous submissions`
    };
  }

  /**
   * Analyze text patterns for additional plagiarism indicators
   * @param {string} text - Text to analyze
   * @returns {Object} Pattern analysis results
   */
  analyzeTextPatterns(text) {
    const processedText = this.preprocessText(text);
    const words = this.tokenizer.tokenize(processedText) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Calculate average word length
    const avgWordLength = words.length > 0 
      ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
      : 0;

    // Calculate average sentence length
    const avgSentenceLength = sentences.length > 0
      ? words.length / sentences.length
      : 0;

    // Calculate vocabulary richness (unique words / total words)
    const uniqueWords = new Set(words);
    const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0;

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      vocabularyRichness: Math.round(vocabularyRichness * 100) / 100
    };
  }
}

// Create singleton instance
const plagiarismDetector = new PlagiarismDetector();

/**
 * Detect plagiarism in a submission
 * @param {string} currentText - Current submission text
 * @param {Array} previousSubmissions - Array of previous submissions
 * @returns {Promise<Object>} Plagiarism detection result
 */
const detectPlagiarism = async (currentText, previousSubmissions) => {
  try {
    const result = await plagiarismDetector.detectPlagiarism(currentText, previousSubmissions);
    
    // Add text pattern analysis
    const patterns = plagiarismDetector.analyzeTextPatterns(currentText);
    
    return {
      ...result,
      patterns,
      detectedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in plagiarism detection:', error);
    return {
      riskPercentage: 0,
      riskLevel: 'LOW',
      similarSubmissions: [],
      message: 'Error occurred during plagiarism detection',
      error: error.message
    };
  }
};

module.exports = {
  detectPlagiarism,
  PlagiarismDetector
};
