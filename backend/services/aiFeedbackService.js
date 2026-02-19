const OpenAI = require('openai');

/**
 * AI Feedback Generation Service using OpenAI API
 * Provides automated evaluation and feedback for student assignments
 */

class AIFeedbackService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured. AI feedback will be disabled.');
      this.isEnabled = false;
    } else {
      this.isEnabled = true;
    }
  }

  /**
   * Generate comprehensive feedback for student assignment
   * @param {string} assignmentText - The student's assignment text
   * @param {Object} options - Additional options for feedback generation
   * @returns {Promise<Object>} Generated feedback with score
   */
  async generateFeedback(assignmentText, options = {}) {
    if (!this.isEnabled) {
      return this.getFallbackFeedback(assignmentText);
    }

    if (!assignmentText || assignmentText.trim().length < 10) {
      return {
        feedback: 'Assignment text is too short to provide meaningful feedback.',
        score: 0,
        strengths: [],
        improvements: [],
        detailedAnalysis: 'Insufficient content for analysis.'
      };
    }

    try {
      const prompt = this.buildPrompt(assignmentText, options);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational evaluator providing constructive feedback on student assignments. Be encouraging but honest. Focus on learning and improvement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const feedbackText = response.choices[0].message.content;
      return this.parseFeedbackResponse(feedbackText);

    } catch (error) {
      console.error('Error generating AI feedback:', error);
      return this.getFallbackFeedback(assignmentText);
    }
  }

  /**
   * Build the prompt for OpenAI API
   * @param {string} assignmentText - Student's assignment text
   * @param {Object} options - Additional options
   * @returns {string} Complete prompt
   */
  buildPrompt(assignmentText, options) {
    const maxLength = 2000; // Limit text length to avoid token limits
    const truncatedText = assignmentText.length > maxLength 
      ? assignmentText.substring(0, maxLength) + '...' 
      : assignmentText;

    return `Please evaluate the following student assignment and provide structured feedback.

Assignment Text:
"""
${truncatedText}
"""

Please provide your response in the following format:

FEEDBACK: [3-5 lines of constructive feedback]

STRENGTHS: [2-3 bullet points of what the student did well]

IMPROVEMENTS: [2-3 bullet points of areas for improvement]

SCORE: [A numerical score from 0-100]

DETAILED_ANALYSIS: [A brief analysis of the assignment quality]

Focus on:
- Content quality and depth
- Critical thinking and analysis
- Organization and structure
- Clarity of expression
- Originality and creativity

Be fair, constructive, and educational in your assessment.`;
  }

  /**
   * Parse the structured response from OpenAI
   * @param {string} responseText - Raw response from OpenAI
   * @returns {Object} Parsed feedback object
   */
  parseFeedbackResponse(responseText) {
    try {
      const result = {
        feedback: '',
        score: 50, // Default score
        strengths: [],
        improvements: [],
        detailedAnalysis: ''
      };

      // Parse each section
      const feedbackMatch = responseText.match(/FEEDBACK:\s*(.+?)(?=\n\n|\nSTRENGTHS:|$)/s);
      if (feedbackMatch) {
        result.feedback = feedbackMatch[1].trim();
      }

      const strengthsMatch = responseText.match(/STRENGTHS:\s*(.+?)(?=\n\n|\nIMPROVEMENTS:|$)/s);
      if (strengthsMatch) {
        result.strengths = strengthsMatch[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').trim());
      }

      const improvementsMatch = responseText.match(/IMPROVEMENTS:\s*(.+?)(?=\n\n|\nSCORE:|$)/s);
      if (improvementsMatch) {
        result.improvements = improvementsMatch[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').trim());
      }

      const scoreMatch = responseText.match(/SCORE:\s*(\d+)/);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        result.score = Math.min(100, Math.max(0, score)); // Ensure score is between 0-100
      }

      const analysisMatch = responseText.match(/DETAILED_ANALYSIS:\s*(.+?)(?=$)/s);
      if (analysisMatch) {
        result.detailedAnalysis = analysisMatch[1].trim();
      }

      // If no structured feedback found, use the entire response as feedback
      if (!result.feedback && responseText.trim()) {
        result.feedback = responseText.trim();
      }

      return result;

    } catch (error) {
      console.error('Error parsing AI feedback response:', error);
      return {
        feedback: responseText.substring(0, 500), // Use first 500 chars as feedback
        score: 50,
        strengths: [],
        improvements: [],
        detailedAnalysis: 'Error parsing detailed analysis.'
      };
    }
  }

  /**
   * Get fallback feedback when AI service is unavailable
   * @param {string} assignmentText - Assignment text
   * @returns {Object} Fallback feedback
   */
  getFallbackFeedback(assignmentText) {
    const wordCount = assignmentText.split(/\s+/).length;
    let score = 50; // Base score
    let feedback = 'Assignment submitted successfully. ';

    // Basic scoring based on length
    if (wordCount < 50) {
      score = 30;
      feedback += 'The assignment is quite short and could benefit from more detail and explanation.';
    } else if (wordCount < 200) {
      score = 60;
      feedback += 'The assignment shows basic understanding but could be expanded with more depth.';
    } else if (wordCount < 500) {
      score = 75;
      feedback += 'Good effort with substantial content. Consider adding more critical analysis.';
    } else {
      score = 85;
      feedback += 'Comprehensive assignment with good detail. Well done!';
    }

    return {
      feedback,
      score,
      strengths: ['Submitted on time', 'Followed assignment requirements'],
      improvements: ['Consider adding more examples', 'Include deeper analysis'],
      detailedAnalysis: 'Basic analysis based on submission length and structure. AI feedback service is currently unavailable.'
    };
  }

  /**
   * Generate quick feedback summary (for notifications)
   * @param {Object} feedback - Full feedback object
   * @returns {string} Brief summary
   */
  generateSummary(feedback) {
    if (!feedback) return 'No feedback available';
    
    const score = feedback.score || 0;
    let summary = `Score: ${score}/100. `;
    
    if (score >= 80) {
      summary += 'Excellent work!';
    } else if (score >= 60) {
      summary += 'Good effort with room for improvement.';
    } else if (score >= 40) {
      summary += 'Needs significant improvement.';
    } else {
      summary += 'Requires substantial revision.';
    }

    return summary;
  }

  /**
   * Check if the AI service is available
   * @returns {boolean} Service availability status
   */
  isServiceAvailable() {
    return this.isEnabled && !!process.env.OPENAI_API_KEY;
  }
}

// Create singleton instance
const aiFeedbackService = new AIFeedbackService();

/**
 * Generate AI feedback for a submission
 * @param {string} assignmentText - The assignment text to evaluate
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Generated feedback
 */
const generateFeedback = async (assignmentText, options = {}) => {
  try {
    const result = await aiFeedbackService.generateFeedback(assignmentText, options);
    
    // Add metadata
    return {
      ...result,
      feedback: aiFeedbackService.generateSummary(result),
      generatedAt: new Date().toISOString(),
      serviceUsed: aiFeedbackService.isServiceAvailable() ? 'openai' : 'fallback'
    };
  } catch (error) {
    console.error('Error in AI feedback generation:', error);
    return aiFeedbackService.getFallbackFeedback(assignmentText);
  }
};

module.exports = {
  generateFeedback,
  AIFeedbackService
};
