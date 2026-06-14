const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5001/api';

async function postRequest(pathUrl, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + pathUrl);
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPersistenceTest() {
  console.log('======================================================');
  console.log('         MEDICARE AI - PERSISTENCE TESTS              ');
  console.log('======================================================\n');

  const testEmail = `persist_${Date.now()}@medicare.com`;
  const testPassword = 'password123';

  console.log(`[1] Registering a new user: ${testEmail}`);
  try {
    const registerRes = await postRequest('/auth/register', {
      email: testEmail,
      password: testPassword,
      full_name: 'Test Persistence User',
      phone: '+91-1111111111',
      role: 'patient'
    });

    if (registerRes.statusCode !== 201) {
      console.error('[FAIL] Registration failed:', registerRes);
      process.exit(1);
    }
    console.log('[PASS] Registration successful! User created.');

    // Trigger backend restart by touching index.ts
    console.log('\n[2] Triggering backend server restart via file touch...');
    const indexPath = path.join(__dirname, 'src', 'index.ts');
    let content = fs.readFileSync(indexPath, 'utf-8');
    // Append or update a restart timestamp comment
    content = content.replace(/\/\/ Restart timestamp: .*/g, '');
    content += `\n// Restart timestamp: ${new Date().toISOString()}`;
    fs.writeFileSync(indexPath, content, 'utf-8');

    console.log('Waiting 10 seconds for backend to compile and restart...');
    await delay(10000);

    console.log('\n[3] Attempting login with the same credentials after restart...');
    const loginRes = await postRequest('/auth/login', {
      email: testEmail,
      password: testPassword
    });

    console.log(`Login response status: ${loginRes.statusCode}`);
    if (loginRes.statusCode === 200 && loginRes.data.success) {
      console.log('[PASS] Login successful! User survived restart.');
      console.log('\n======================================================');
      console.log('        RESULT: PERSISTENCE IS WORKING! 🎉             ');
      console.log('======================================================');
      process.exit(0);
    } else {
      console.error('[FAIL] Login failed after restart:', loginRes);
      console.log('\n======================================================');
      console.log('        RESULT: PERSISTENCE FAILED! ❌                 ');
      console.log('======================================================');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during persistence test:', err);
    process.exit(1);
  }
}

runPersistenceTest();
