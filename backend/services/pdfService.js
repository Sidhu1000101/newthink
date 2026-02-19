const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('PDF file not found');
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}"'\/\\]/g, '') // Remove special characters except punctuation
    .trim();
};

module.exports = {
  extractTextFromPDF,
  cleanText
};
