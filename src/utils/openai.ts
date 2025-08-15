import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

export async function generateTestPrompt() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `Generate a unique IELTS Academic Writing test with Task 1 and Task 2. 
        
        For Task 1: Create a data visualization task with specific chart data that can be used to generate charts. Include chart type (line-chart, bar-chart, pie-chart), title, data points, and a detailed prompt.
        
        For Task 2: Create an essay question on current topics like technology, education, environment, society, etc.
        
        Return the response in this exact JSON format:
        {
          "task1": {
            "type": "line-chart|bar-chart|pie-chart",
            "title": "Chart title",
            "description": "Brief description of what the chart shows",
            "chartData": {
              "labels": ["Label1", "Label2", "Label3"],
              "datasets": [
                {
                  "label": "Dataset name",
                  "data": [value1, value2, value3],
                  "backgroundColor": "color",
                  "borderColor": "color"
                }
              ]
            },
            "prompt": "You should spend about 20 minutes on this task. [Detailed prompt describing what to analyze]"
          },
          "task2": {
            "type": "opinion|discussion|problem-solution|advantages-disadvantages",
            "topic": "Topic area",
            "prompt": "You should spend about 40 minutes on this task. [Detailed essay question] Write at least 250 words."
          }
        }`
      }],
      temperature: 0.9,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');
    
    return parseJSONFromContent(content);
  } catch (error) {
    console.error('Error generating test prompt:', error);
    // Fallback to a default test
    return getDefaultTest();
  }
}

export async function evaluateWriting(task: number, prompt: string, response: string, imageUrl?: string) {
  try {
    // Validate response is not empty or too short
    const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minWords = task === 1 ? 150 : 250;
    
    if (!response.trim()) {
      return {
        [task === 1 ? "taskAchievement" : "taskResponse"]: { 
          score: 0, 
          feedback: "No response provided. Cannot evaluate empty submission." 
        },
        coherenceCohesion: { 
          score: 0, 
          feedback: "No response to evaluate for coherence and cohesion." 
        },
        lexicalResource: { 
          score: 0, 
          feedback: "No vocabulary usage to assess." 
        },
        grammaticalRange: { 
          score: 0, 
          feedback: "No grammatical structures to evaluate." 
        },
        overallScore: 0,
        generalFeedback: "No response submitted. Please provide a written response to receive evaluation."
      };
    }
    
    if (wordCount < 50) {
      return {
        [task === 1 ? "taskAchievement" : "taskResponse"]: { 
          score: 1, 
          feedback: `Response is too short (${wordCount} words). Minimum requirement is ${minWords} words.` 
        },
        coherenceCohesion: { 
          score: 1, 
          feedback: "Insufficient content to assess coherence and cohesion." 
        },
        lexicalResource: { 
          score: 1, 
          feedback: "Limited vocabulary range due to very short response." 
        },
        grammaticalRange: { 
          score: 1, 
          feedback: "Insufficient content to assess grammatical range and accuracy." 
        },
        overallScore: 1,
        generalFeedback: `Response is significantly under the word limit (${wordCount}/${minWords} words). Please write a complete response.`
      };
    }

    const systemMessage = task === 1
      ? `You are an expert IELTS Academic examiner with 20+ years of experience. Evaluate this IELTS Academic Writing Task 1 response according to official IELTS standards.
      
      CRITICAL EVALUATION PRIORITY:
      1. RELEVANCE CHECK FIRST: Does the response describe the EXACT visual data shown in the image?
      2. DATA ACCURACY: Are the figures, trends, and comparisons mentioned correct?
      3. If response is about different data or completely wrong visual = Band 1-2 MAXIMUM
      4. If response is irrelevant to the task = Band 1-2 MAXIMUM
      
      IMPORTANT: Use ONLY valid IELTS band scores: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0
      NO other decimal scores are allowed (like 5.3, 6.7, etc.)
      
      STRICT IELTS STANDARDS - Most responses should be Band 4-6:
      - Band 9: Perfect response with expert analysis (very rare)
      - Band 8: Excellent with minor issues (rare)
      - Band 7: Good response with clear analysis (uncommon)
      - Band 6: Adequate response with some issues (common)
      - Band 5: Limited response with problems (common)
      - Band 4: Basic response with major issues (common)
      - Band 3: Poor response with serious problems
      - Band 2: Very poor, barely understandable
      - Band 1: Extremely poor or irrelevant
      
      TASK ACHIEVEMENT EVALUATION:
      - Must describe the EXACT visual data shown
      - Must identify correct trends and patterns
      - Must use accurate data from the image
      - Must provide appropriate overview
      - WRONG DATA = Band 1-2 regardless of language quality`
      : `You are an expert IELTS Academic examiner with 20+ years of experience. Evaluate this IELTS Academic Writing Task 2 response according to official IELTS standards.
      
      CRITICAL EVALUATION PRIORITY:
      1. RELEVANCE CHECK FIRST: Does the response address the EXACT essay question asked?
      2. TOPIC ADHERENCE: Is the content relevant to the specific topic?
      3. If response is off-topic or irrelevant = Band 1-2 MAXIMUM
      4. If response doesn't answer the question = Band 1-2 MAXIMUM
      
      IMPORTANT: Use ONLY valid IELTS band scores: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0
      NO other decimal scores are allowed (like 5.3, 6.7, etc.)
      
      STRICT IELTS STANDARDS - Most responses should be Band 4-6:
      - Band 9: Perfect essay with expert argumentation (very rare)
      - Band 8: Excellent with sophisticated ideas (rare)
      - Band 7: Good essay with clear position (uncommon)
      - Band 6: Adequate essay with relevant ideas (common)
      - Band 5: Limited essay with basic ideas (common)
      - Band 4: Basic essay with simple ideas (common)
      - Band 3: Poor essay with unclear ideas
      - Band 2: Very poor, difficult to follow
      - Band 1: Extremely poor or irrelevant
      
      TASK RESPONSE EVALUATION:
      - Must directly answer the specific question
      - Must stay on the given topic
      - Must present relevant ideas and examples
      - Must have clear position (if required)
      - OFF-TOPIC = Band 1-2 regardless of language quality`;

    const messages = [
      {
        role: "system",
        content: `${systemMessage}
        
        MANDATORY EVALUATION RULES:
        1. CHECK RELEVANCE FIRST: Is the content relevant to the task/question?
        2. IRRELEVANT CONTENT = Band 1-2 MAXIMUM (even with perfect grammar)
        3. WRONG VISUAL DATA = Band 1-2 MAXIMUM (Task 1)
        4. OFF-TOPIC ESSAY = Band 1-2 MAXIMUM (Task 2)
        5. Use ONLY valid IELTS bands: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0
        6. Most responses should be Band 4-6 (be realistic)
        7. Band 7+ only for genuinely good responses
        8. CONTENT RELEVANCE overrides language quality
        
        Return your evaluation in this exact JSON format (no additional text):
        {
          "${task === 1 ? 'taskAchievement' : 'taskResponse'}": { "score": 5.5, "feedback": "Detailed feedback..." },
          "coherenceCohesion": { "score": 5.0, "feedback": "Detailed feedback..." },
          "lexicalResource": { "score": 5.5, "feedback": "Detailed feedback..." },
          "grammaticalRange": { "score": 5.0, "feedback": "Detailed feedback..." },
          "overallScore": 5.0,
          "generalFeedback": "Overall assessment and suggestions for improvement..."
        }`
      }
    ];

    if (task === 1 && imageUrl) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `TASK 1 EVALUATION - CRITICAL VISUAL DATA ANALYSIS

Task Prompt: ${prompt}

Student Response (${wordCount} words): ${response}

EVALUATION PRIORITY ORDER:
1. EXAMINE THE IMAGE: What exactly does the visual data show?
2. RELEVANCE CHECK: Does the student's response describe THIS specific visual data?
3. ACCURACY CHECK: Are the figures, trends, and patterns mentioned correct?
4. COMPLETENESS: Are key features identified and compared?

CRITICAL RULES:
- If response describes different data = Band 1-2 MAXIMUM
- If response has wrong figures/trends = Band 1-3 MAXIMUM  
- If response is irrelevant to image = Band 1-2 MAXIMUM
- Perfect grammar cannot save irrelevant content
- Only responses about THIS image can score well

Evaluate strictly based on how accurately the response describes the PROVIDED visual data.`
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `${task === 1 ? 'TASK 1' : 'TASK 2'} EVALUATION - RELEVANCE CHECK

Task Prompt: ${prompt}

Student Response (${wordCount} words): ${response}


EVALUATION PRIORITY ORDER:
1. RELEVANCE CHECK: Does the response address the specific ${task === 1 ? 'visual data task' : 'essay question'}?
2. CONTENT ACCURACY: Is the content appropriate and on-topic?
3. LANGUAGE ASSESSMENT: Evaluate grammar, vocabulary, coherence only if content is relevant

CRITICAL RULES:
- Off-topic response = Band 1-2 MAXIMUM
- Irrelevant content = Band 1-2 MAXIMUM
- Wrong task interpretation = Band 1-2 MAXIMUM
- Perfect language cannot save irrelevant content
- Most responses should be Band 4-6 (be realistic)

Evaluate strictly according to IELTS Academic standards with content relevance as priority.`
      });
    }

    const response_ai = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: messages,
      temperature: 0.1,
      max_tokens: 1500
    });

    const content = response_ai.choices[0].message.content;
    if (!content) throw new Error('No evaluation received from OpenAI');
    
    return parseJSONFromContent(content);
  } catch (error) {
    console.error('Error evaluating writing:', error);
    return getDefaultEvaluation(task);
  }
}

function parseJSONFromContent(content: string): any {
  // Trim whitespace
  const trimmedContent = content.trim();
  
  // Check if content is wrapped in markdown code block
  const markdownJsonMatch = trimmedContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (markdownJsonMatch) {
    try {
      return JSON.parse(markdownJsonMatch[1]);
    } catch (error) {
      console.warn('Failed to parse JSON from markdown block:', error);
    }
  }
  
  // Try to parse the entire content as JSON
  try {
    return JSON.parse(trimmedContent);
  } catch (error) {
    console.warn('Failed to parse entire content as JSON:', error);
  }
  
  // Extract JSON by finding the outermost curly braces
  const firstBrace = trimmedContent.indexOf('{');
  const lastBrace = trimmedContent.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON found in response');
  }
  
  const jsonString = trimmedContent.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to parse extracted JSON: ' + error);
  }
}

function getDefaultTest() {
  return {
    task1: {
      type: "line-chart",
      title: "Internet Users by Age Group (2010-2023)",
      description: "The chart shows the percentage of internet users across different age groups over time",
      chartData: {
        labels: ["2010", "2015", "2020", "2023"],
        datasets: [
          {
            label: "18-29 years",
            data: [85, 92, 96, 98],
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 2
          },
          {
            label: "30-49 years",
            data: [70, 82, 88, 92],
            backgroundColor: "rgba(16, 163, 74, 0.2)",
            borderColor: "rgba(16, 163, 74, 1)",
            borderWidth: 2
          },
          {
            label: "50-64 years",
            data: [45, 65, 75, 82],
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            borderColor: "rgba(249, 115, 22, 1)",
            borderWidth: 2
          }
        ]
      },
      prompt: "You should spend about 20 minutes on this task. The line chart shows the percentage of internet users by age group from 2010 to 2023. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words."
    },
    task2: {
      type: "opinion",
      topic: "Technology and Education",
      prompt: "You should spend about 40 minutes on this task. Some people believe that online learning is more effective than traditional classroom learning, while others argue that face-to-face instruction is irreplaceable. Discuss both views and give your own opinion. Write at least 250 words."
    }
  };
}

function getDefaultEvaluation(task: number) {
  return {
    [task === 1 ? "taskAchievement" : "taskResponse"]: { score: 4.0, feedback: "Unable to evaluate due to technical error. Please try again." },
    coherenceCohesion: { score: 4.0, feedback: "Unable to evaluate due to technical error." },
    lexicalResource: { score: 4.0, feedback: "Unable to evaluate due to technical error." },
    grammaticalRange: { score: 4.0, feedback: "Unable to evaluate due to technical error." },
    overallScore: 4.0,
    generalFeedback: "Technical error occurred during evaluation. Please resubmit your response."
  };
}