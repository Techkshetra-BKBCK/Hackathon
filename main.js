import './style.css'
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the GROQ model
const initializeGroq = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your-api-key') {
    throw new Error('Please set a valid GROQ API key in your .env file');
  }

  return new ChatGroq({
    apiKey,
    model: "mixtral-8x7b-32768",
    temperature: 0
  });
};

// Create the system message for social engineering detection
const createSystemMessage = () => new SystemMessage(
"You are a social engineer and a human psychology expert, your job is to analyse email and SMS chats. Now since you are expert in social engineering and human psychology your job is to detect whether there is possible phishing, pretexting or baiting attempt made, remember to not underestimate pretexting and baiting, as they might be chained to phishing as a follow up scam. You need to return the answer in a structured way which is given below:" + 

"1) Is there an attempt of phishing(all types), pretexting or baiting? If yes then which one and how much percent you can assure that you are right and explain why you think it is that particular type." + 
"2) Name of the manipulation tactic(eg: Scarcity, Urgency) and their definition:" + 
"3) How did you identify the attempt and the tactic used:" + 
"4) How do I identify such attempts and tactics in the future, i.e. tips and tricks to spot them:" + 
"5) How to avoid such things in future, what steps should be taken." + 
"6) How to respond to such incidents." + 
"7) What is the appropriate response in the given case." + 

"You are responsible for the security of the organisation from such social engineering attacks, make sure to analyse the input thoroughly, even analysing subtle linguistic inconsistencies like spelling errors or grammatical errors, take spoofing risks into consideration also and categorize the type of phishing(eg: smishing, whaling, etc) wherever necessary and make an unbiased and proper judgement along with in-depth analyses in such a way that the employee understands it clearly.Give a comprehensive analysis for each point."
);

const safetyTopics = {
  topics: [
    {
      id: 1,
      title: 'Introduction to Social Engineering',
      description: 'Overview of social engineering tactics and their impact.',
      subtopics: [
        { id: 1, title: 'What is Social Engineering?' },
        { id: 2, title: 'Why Social Engineering Works' },
        { id: 3, title: 'Common Social Engineering Attacks' },
        { id: 4, title: 'The Social Engineering Lifecycle' },
        { id: 5, title: 'Impact of Social Engineering on Individuals and Organizations' },
        { id: 6, title: 'Psychological Principles Used in Social Engineering' }
      ]
    },
    {
      id: 2,
      title: 'Phishing and Smishing',
      description: 'Understanding and identifying phishing emails and SMS attacks.',
      subtopics: [
        { id: 1, title: 'What is Phishing?' },
        { id: 2, title: 'Identifying Phishing Emails' },
        { id: 3, title: 'Types of Phishing Attacks' },
        { id: 4, title: 'What is Smishing?' },
        { id: 5, title: 'Identifying Smishing Texts' },
         { id: 6, title: 'Protecting Yourself from Phishing and Smishing' }

      ]
    },
      {
          id: 3,
          title: 'Baiting',
           description: 'Introduction to baiting and its different forms.',
          subtopics: [
            { id: 1, title: 'Understanding Baiting' },
            { id: 2, title: 'Types of Baits Used' },
            { id: 3, title: 'How Baiting Works' },
            { id: 4, title: 'Risks of Falling for Baits' },
            { id: 5, title: 'Preventing Baiting Attacks' }
          ]
        },
        {
          id: 4,
          title: 'Pretexting',
           description: 'Understanding pretexting and its different forms.',
          subtopics: [
             { id: 1, title: 'What is Pretexting' },
            { id: 2, title: 'Common Pretexting Scenarios' },
            { id: 3, title: 'Building a Believable Pretext' },
            { id: 4, title: 'Identifying Pretexting Attempts' },
            { id: 5, title: 'Protecting Yourself from Pretexting' }
          ]
        },
    {
      id: 5,
      title: 'Quid Pro Quo',
      description: 'Understanding how quid pro quo attacks work.',
       subtopics: [
        { id: 1, title: 'What is Quid Pro Quo' },
        { id: 2, title: 'Examples of Quid Pro Quo Attacks' },
        { id: 3, title: 'Identifying Quid Pro Quo' },
         { id: 4, title: 'Risks and Dangers of Quid Pro Quo' },
        { id: 5, title: 'Preventing Quid Pro Quo Attacks' }

      ]
    },
       {
      id: 6,
      title: 'Tailgating and Piggybacking',
       description: 'Understanding the dangers of physical access social engineering.',
      subtopics: [
          { id: 1, title: 'What is Tailgating and Piggybacking' },
         { id: 2, title: 'How They Work' },
           { id: 3, title: 'Common Scenarios' },
           { id: 4, title: 'Risks of Tailgating' },
          { id: 5, title: 'Preventing Tailgating and Piggybacking' }
        ]
    },
       {
          id: 7,
          title: 'Watering Hole Attacks',
            description: 'Understanding the dangers of watering hole social engineering.',
          subtopics: [
            { id: 1, title: 'What are Watering Hole Attacks' },
            { id: 2, title: 'How Watering Hole Attacks Work' },
              { id: 3, title: 'Targets of Watering Hole Attacks' },
             { id: 4, title: 'Identifying Watering Hole Attacks' },
            { id: 5, title: 'Protecting Against Watering Hole Attacks' }
          ]
        },

    {
      id: 8,
      title: 'Protecting Yourself from Social Engineering',
      description: 'Practical steps to enhance personal and organizational security.',
      subtopics: [
        { id: 1, title: 'Strong Passwords and Multi-Factor Authentication' },
        { id: 2, title: 'Recognizing Suspicious Communications' },
        { id: 3, title: 'Safe Browsing Habits' },
        { id: 4, title: 'Regular Software Updates' },
        { id: 5, title: 'Secure Handling of Sensitive Information' },
          { id: 6, title: 'Reporting Social Engineering Attempts' },
           { id: 7, title: 'Ongoing Security Awareness Training' }
      ]
    }
    // ... (rest of the topics remain the same)
  ]
};

// Render the UI
const renderUI = () => {
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <h1>Social Engineering Detection</h1>
      <div class="input-section">
        <textarea 
          id="userInput" 
          placeholder="Paste your suspicious chat or email content here for analysis..."
          rows="6"
        ></textarea>
        <button id="analyzeBtn">Analyze Content</button>
      </div>
      <div id="result" class="result-section"></div>

      <div class="teacher-section">
        <h2>Social Engineering Teacher</h2>
        <div class="topic-selection">
          <label>
            Select a Topic:
            <select id="topicSelect">
              <option value="">Select a topic</option>
              ${safetyTopics.topics.map(chapter => 
                `<option value="${chapter.id}">${chapter.title}</option>`
              ).join('')}
            </select>
          </label>
        </div>
        <div id="subtopicContainer" class="subtopic-selection" style="display: none;">
          <label>
            Select a Subtopic:
            <select id="subtopicSelect">
              <option value="">Select a subtopic</option>
            </select>
          </label>
        </div>
        <div class="explanation-section">
          <button id="getExplanationBtn" disabled>Get Explanation</button>
          <div id="explanationResult"></div>
        </div>
      </div>
    </div>
  `;
};

// Analyze the content
const analyzeContent = async (model, content) => {
  const messages = [
    createSystemMessage(),
    new HumanMessage(content)
  ];
  
  return await model.invoke(messages);
};

// Initialize the teacher functionality
const initializeTeacher = () => {
  const topicSelect = document.getElementById('topicSelect');
  const subtopicContainer = document.getElementById('subtopicContainer');
  const subtopicSelect = document.getElementById('subtopicSelect');
  const getExplanationBtn = document.getElementById('getExplanationBtn');
  const explanationResult = document.getElementById('explanationResult');

  topicSelect.addEventListener('change', (e) => {
    const selectedTopicId = Number(e.target.value);
    if (selectedTopicId) {
      const topic = safetyTopics.topics.find(t => t.id === selectedTopicId);
      subtopicSelect.innerHTML = `
        <option value="">Select a subtopic</option>
        ${topic.subtopics.map(sub => 
          `<option value="${sub.id}">${sub.title}</option>`
        ).join('')}
      `;
      subtopicContainer.style.display = 'block';
      getExplanationBtn.disabled = true;
    } else {
      subtopicContainer.style.display = 'none';
      getExplanationBtn.disabled = true;
    }
  });

  subtopicSelect.addEventListener('change', (e) => {
    getExplanationBtn.disabled = !e.target.value;
  });

  getExplanationBtn.addEventListener('click', async () => {
    const selectedTopicId = Number(topicSelect.value);
    const selectedSubtopicId = Number(subtopicSelect.value);
    
    if (selectedTopicId && selectedSubtopicId) {
      const topic = safetyTopics.topics.find(t => t.id === selectedTopicId);
      const subtopic = topic.subtopics.find(s => s.id === selectedSubtopicId);
      
      try {
        const genAI = new GoogleGenerativeAI("AIzaSyCyoasSyFVFvbh_wCZX6U6QAiq57nJqbOA"); // Replace with your API key
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Explain ${subtopic.title} and provide 5 key points to look out for when recognizing such attacks.`;
        
        getExplanationBtn.disabled = true;
        getExplanationBtn.textContent = 'Loading...';
        explanationResult.innerHTML = '<div class="loading">Generating explanation...</div>';
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = await response.text();
        
        explanationResult.innerHTML = `
          <h3>Explanation:</h3>
          <div class="explanation-content">
            ${output.split('\n').map(line => 
              `<p>${line}</p>`
            ).join('')}
          </div>
        `;
      } catch (error) {
        explanationResult.innerHTML = `
          <div class="error">
            Error generating explanation: ${error.message}
          </div>
        `;
      } finally {
        getExplanationBtn.disabled = false;
        getExplanationBtn.textContent = 'Get Explanation';
      }
    }
  });
};

// Main application logic
const main = async () => {
  let model;
  
  try {
    model = initializeGroq();
  } catch (error) {
    document.querySelector('#app').innerHTML = `
      <div class="container">
        <div class="error">
          <h2>Configuration Error</h2>
          <p>${error.message}</p>
          <p>Please check your .env file and ensure you have set a valid GROQ API key.</p>
        </div>
      </div>
    `;
    return;
  }

  renderUI();
  initializeTeacher();

  const analyzeBtn = document.querySelector('#analyzeBtn');
  const resultDiv = document.querySelector('#result');
  const userInput = document.querySelector('#userInput');

  analyzeBtn.addEventListener('click', async () => {
    const content = userInput.value.trim();
    
    if (!content) {
      resultDiv.innerHTML = `<div class="error">Please enter some content to analyze</div>`;
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    resultDiv.innerHTML = '<div class="loading">Analyzing your content for potential social engineering threats...</div>';

    try {
      const response = await analyzeContent(model, content);
      resultDiv.innerHTML = `
        <div class="analysis">
          <h3>Analysis Results</h3>
          ${response.content}
        </div>
      `;
    } catch (error) {
      resultDiv.innerHTML = `
        <div class="error">
          <h3>Analysis Error</h3>
          <p>Failed to analyze the content: ${error.message}</p>
          <p>Please try again or check your API key configuration.</p>
        </div>
      `;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze Content';
    }
  });
};

// Initialize the application
main().catch(error => {
  console.error('Application initialization failed:', error);
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <div class="error">
        <h2>Application Error</h2>
        <p>Failed to initialize the application: ${error.message}</p>
      </div>
    </div>
  `;
});