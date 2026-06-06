const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'medicare-ai-default-secret-change-me'; // default from config/env

const testUsers = [
  { email: 'admin@medicare.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'doctor@medicare.com', password: 'doctor123', expectedRole: 'doctor' },
  { email: 'nurse@medicare.com', password: 'nurse123', expectedRole: 'nurse' },
  { email: 'reception@medicare.com', password: 'reception123', expectedRole: 'receptionist' },
  { email: 'patient@medicare.com', password: 'patient123', expectedRole: 'patient' },
  { email: 'pharma@medicare.com', password: 'pharma123', expectedRole: 'pharmacist' },
  { email: 'lab@medicare.com', password: 'lab123', expectedRole: 'lab_technician' }
];

function makeRequest(path, method, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAudit() {
  const results = [];
  let allPassed = true;

  console.log('Starting MediCare AI Authentication Audit...');

  // Test 1: Verify all 7 default users can login and tokens are valid
  for (const user of testUsers) {
    const testResult = {
      name: `Login: ${user.email} (${user.expectedRole})`,
      passed: false,
      details: ''
    };

    try {
      const loginRes = await makeRequest('/api/auth/login', 'POST', {
        email: user.email,
        password: user.password
      });

      if (loginRes.statusCode !== 200) {
        testResult.details = `Failed with status code ${loginRes.statusCode}: ${JSON.stringify(loginRes.body)}`;
      } else if (!loginRes.body.success) {
        testResult.details = `API returned success=false: ${loginRes.body.error}`;
      } else {
        const data = loginRes.body.data;
        if (!data || !data.token || !data.user) {
          testResult.details = `Missing token or user data in response: ${JSON.stringify(loginRes.body)}`;
        } else if (data.user.role !== user.expectedRole) {
          testResult.details = `Role mismatch: expected ${user.expectedRole}, got ${data.user.role}`;
        } else {
          // Verify JWT
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            if (decoded.role !== user.expectedRole) {
              testResult.details = `JWT role mismatch: expected ${user.expectedRole}, got ${decoded.role}`;
            } else if (decoded.email !== user.email) {
              testResult.details = `JWT email mismatch: expected ${user.email}, got ${decoded.email}`;
            } else {
              testResult.passed = true;
              testResult.details = `Successfully logged in. Token generated & validated. Role matches '${user.expectedRole}'.`;
            }
          } catch (jwtErr) {
            testResult.details = `JWT Verification failed: ${jwtErr.message}`;
          }
        }
      }
    } catch (err) {
      testResult.details = `Network or Connection Error: ${err.message}`;
    }

    if (!testResult.passed) allPassed = false;
    results.push(testResult);
  }

  // Test 2: Case-insensitive email login
  const caseInsensitiveTest = {
    name: 'Case-insensitive Email Login',
    passed: false,
    details: ''
  };
  try {
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'Admin@Medicare.com',
      password: 'admin123'
    });
    if (loginRes.statusCode === 200 && loginRes.body.success) {
      caseInsensitiveTest.passed = true;
      caseInsensitiveTest.details = 'Successfully logged in with mixed-case email.';
    } else {
      caseInsensitiveTest.details = `Failed with status ${loginRes.statusCode}: ${loginRes.body.error || 'Unknown error'}`;
    }
  } catch (err) {
    caseInsensitiveTest.details = `Error: ${err.message}`;
  }
  if (!caseInsensitiveTest.passed) allPassed = false;
  results.push(caseInsensitiveTest);

  // Test 3: Invalid password validation
  const invalidPasswordTest = {
    name: 'Invalid Password Validation',
    passed: false,
    details: ''
  };
  try {
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@medicare.com',
      password: 'wrongpassword'
    });
    if (loginRes.statusCode === 401 && !loginRes.body.success) {
      invalidPasswordTest.passed = true;
      invalidPasswordTest.details = 'Rejected invalid password correctly with 401 Unauthorized.';
    } else {
      invalidPasswordTest.details = `Incorrect behavior: got status ${loginRes.statusCode}`;
    }
  } catch (err) {
    invalidPasswordTest.details = `Error: ${err.message}`;
  }
  if (!invalidPasswordTest.passed) allPassed = false;
  results.push(invalidPasswordTest);

  // Print summary to console
  console.log('\n--- AUDIT RESULTS ---');
  results.forEach(r => {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name}`);
    console.log(`      Details: ${r.details}`);
  });

  const fs = require('fs');
  const reportPath = '/Users/shubhamkumar/.gemini/antigravity/scratch/auth_audit_report.json';
  fs.writeFileSync(reportPath, JSON.stringify({ allPassed, results }, null, 2));
  console.log(`\nAudit JSON written to ${reportPath}`);
}

runAudit();
