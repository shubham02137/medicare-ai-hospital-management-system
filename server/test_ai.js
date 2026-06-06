const http = require('http');

const API_BASE = 'http://localhost:5001/api';

async function postRequest(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const data = JSON.stringify(body);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(responseBody)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseBody
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Logging in to obtain Auth Token ---');
  try {
    const loginRes = await postRequest('/auth/login', {
      email: 'patient@medicare.com',
      password: 'patient123'
    });
    
    if (loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes);
      return;
    }
    
    const token = loginRes.data.data.token;
    console.log('Login successful! Token acquired.');
    
    // --- Test 1: Chatbot ---
    console.log('\n--- Testing AI Chatbot ---');
    const chatInput1 = { message: 'What are the symptoms of high cholesterol?', history: [] };
    const chatRes1 = await postRequest('/ai/chat', chatInput1, token);
    console.log('Input 1:', chatInput1.message);
    console.log('Output 1:', JSON.stringify(chatRes1.data, null, 2));

    const chatInput2 = { message: 'Can you help me book an appointment?', history: [] };
    const chatRes2 = await postRequest('/ai/chat', chatInput2, token);
    console.log('Input 2:', chatInput2.message);
    console.log('Output 2:', JSON.stringify(chatRes2.data, null, 2));

    // --- Test 2: Symptom Checker ---
    console.log('\n--- Testing AI Symptom Checker ---');
    const symptomInput1 = { symptoms: ['chest pain', 'shortness of breath'] };
    const symptomRes1 = await postRequest('/ai/symptom-check', symptomInput1, token);
    console.log('Input 1:', symptomInput1.symptoms);
    console.log('Output 1:', JSON.stringify(symptomRes1.data, null, 2));

    const symptomInput2 = { symptoms: ['skin rash', 'itchy skin'] };
    const symptomRes2 = await postRequest('/ai/symptom-check', symptomInput2, token);
    console.log('Input 2:', symptomInput2.symptoms);
    console.log('Output 2:', JSON.stringify(symptomRes2.data, null, 2));

    // --- Test 3: Medical Report Summarizer ---
    console.log('\n--- Testing AI Medical Report Summarizer ---');
    const reportInput1 = { report_text: 'Patient Lipid Profile: Total Cholesterol = 245 mg/dL (High), Triglycerides = 180 mg/dL, HDL = 35 mg/dL (Low), LDL = 174 mg/dL (High).' };
    const reportRes1 = await postRequest('/ai/summarize', reportInput1, token);
    console.log('Input 1:', reportInput1.report_text);
    console.log('Output 1:', JSON.stringify(reportRes1.data, null, 2));

    const reportInput2 = { report_text: 'Complete Blood Count: WBC = 12.5 K/uL, Hemoglobin = 11.2 g/dL, Platelets = 140 K/uL.' };
    const reportRes2 = await postRequest('/ai/summarize', reportInput2, token);
    console.log('Input 2:', reportInput2.report_text);
    console.log('Output 2:', JSON.stringify(reportRes2.data, null, 2));

  } catch (err) {
    console.error('Error during AI tests:', err);
  }
}

runTests();
