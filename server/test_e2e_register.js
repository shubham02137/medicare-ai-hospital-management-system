const puppeteer = require('puppeteer');
const fs = require('fs');

const testRegisterUsers = [
  {
    fullName: 'New E2E Patient',
    email: 'new_patient_e2e@medicare.com',
    phone: '+91-9999988888',
    role: 'patient',
    password: 'password123',
    expectedDashboard: '/patient'
  },
  {
    fullName: 'New E2E Doctor',
    email: 'new_doctor_e2e@medicare.com',
    phone: '+91-9999977777',
    role: 'doctor',
    password: 'password123',
    expectedDashboard: '/doctor'
  }
];

async function runRegisterE2ETests() {
  console.log('Launching browser for E2E Registration and Login Tests...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=./chrome_profile', '--headless=new']
  });

  const results = [];

  for (const testUser of testRegisterUsers) {
    const uniqueEmail = testUser.email.replace('@', `_${Date.now()}@`);
    const page = await browser.newPage();
    console.log(`\n--- Testing Registration for ${testUser.fullName} (${testUser.role}) ---`);

    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.text()}`));

    let registerResponse = null;
    page.on('response', response => {
      if (response.url().includes('/api/auth/register')) {
        registerResponse = response;
      }
    });

    try {
      // Go to login first to clear session, then go to register
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });

      // Wait for lazy loaded elements
      await page.waitForSelector('input[placeholder="Enter your full name"]', { timeout: 5000 });

      // Fill out registration form
      await page.type('input[placeholder="Enter your full name"]', testUser.fullName);
      await page.type('input[placeholder="Enter your email"]', uniqueEmail);
      await page.type('input[placeholder="+1-555-0000"]', testUser.phone);
      
      // Select role
      await page.select('select', testUser.role);

      await page.type('input[placeholder="Min 6 characters"]', testUser.password);
      await page.type('input[placeholder="Confirm your password"]', testUser.password);

      // Click Create Account
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 4000 }).catch(() => {})
      ]);

      await new Promise(r => setTimeout(r, 1500));

      const finalUrlAfterRegister = page.url();
      let responseBody = 'No response captured';
      let responseStatus = 'N/A';

      if (registerResponse) {
        responseStatus = registerResponse.status();
        try {
          responseBody = await registerResponse.json();
        } catch {
          responseBody = await registerResponse.text();
        }
      }

      console.log(`Registration API Response Status: ${responseStatus}`);
      console.log(`Registration API Response Body:`, JSON.stringify(responseBody));
      console.log(`URL after registration: ${finalUrlAfterRegister}`);

      const registerPassed = finalUrlAfterRegister.includes(testUser.expectedDashboard) || finalUrlAfterRegister.includes(testUser.role);
      console.log(`Registration result: ${registerPassed ? 'PASS' : 'FAIL'}`);

      // 2. Perform Logout
      console.log('Logging out...');
      await page.evaluate(() => {
        localStorage.clear();
      });

      // 3. Go to login page and test logging in with new credentials
      console.log(`Testing login for newly registered user ${uniqueEmail}...`);
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

      let loginResponse = null;
      page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
          loginResponse = response;
        }
      });

      await page.type('input[placeholder="Enter your email"]', uniqueEmail);
      await page.type('input[placeholder="Enter your password"]', testUser.password);

      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 4000 }).catch(() => {})
      ]);

      await new Promise(r => setTimeout(r, 1500));

      const finalUrlAfterLogin = page.url();
      let loginResponseBody = 'No response captured';
      let loginResponseStatus = 'N/A';

      if (loginResponse) {
        loginResponseStatus = loginResponse.status();
        try {
          loginResponseBody = await loginResponse.json();
        } catch {
          loginResponseBody = await loginResponse.text();
        }
      }

      console.log(`Login API Response Status: ${loginResponseStatus}`);
      console.log(`Login API Response Body:`, JSON.stringify(loginResponseBody));
      console.log(`URL after login: ${finalUrlAfterLogin}`);

      const loginPassed = finalUrlAfterLogin.includes(testUser.expectedDashboard) || finalUrlAfterLogin.includes(testUser.role);
      console.log(`Login result: ${loginPassed ? 'PASS' : 'FAIL'}`);

      results.push({
        email: uniqueEmail,
        role: testUser.role,
        registerStatus: responseStatus,
        registerPassed: registerPassed,
        loginStatus: loginResponseStatus,
        loginPassed: loginPassed,
        passed: registerPassed && loginPassed
      });

    } catch (err) {
      console.error(`Error during testing ${uniqueEmail}:`, err.message);
      results.push({
        email: uniqueEmail,
        role: testUser.role,
        passed: false,
        error: err.message
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n================ NEW USER E2E AUDIT RESULTS ================');
  let allPassed = true;
  results.forEach(r => {
    const statusStr = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${statusStr}] User: ${r.email} (${r.role})`);
    console.log(`       Register Status: ${r.registerStatus} (${r.registerPassed ? 'PASS' : 'FAIL'})`);
    console.log(`       Login Status:    ${r.loginStatus} (${r.loginPassed ? 'PASS' : 'FAIL'})`);
    if (r.error) console.log(`       Error:           ${r.error}`);
  });
  console.log('===========================================================');

  fs.writeFileSync('/Users/shubhamkumar/.gemini/antigravity/scratch/new_user_e2e_report.json', JSON.stringify({ allPassed, results }, null, 2));
  console.log('Written report to /Users/shubhamkumar/.gemini/antigravity/scratch/new_user_e2e_report.json');
}

runRegisterE2ETests().catch(err => {
  console.error('Fatal E2E registration test execution error:', err);
});
