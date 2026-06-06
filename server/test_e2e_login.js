const puppeteer = require('puppeteer');

const testUsers = [
  { email: 'admin@medicare.com', password: 'admin123', expectedRole: 'admin', expectedDashboard: '/admin' },
  { email: 'doctor@medicare.com', password: 'doctor123', expectedRole: 'doctor', expectedDashboard: '/doctor' },
  { email: 'nurse@medicare.com', password: 'nurse123', expectedRole: 'nurse', expectedDashboard: '/nurse/monitoring' },
  { email: 'reception@medicare.com', password: 'reception123', expectedRole: 'receptionist', expectedDashboard: '/receptionist/register' },
  { email: 'patient@medicare.com', password: 'patient123', expectedRole: 'patient', expectedDashboard: '/patient' },
  { email: 'pharma@medicare.com', password: 'pharma123', expectedRole: 'pharmacist', expectedDashboard: '/pharmacy/inventory' },
  { email: 'lab@medicare.com', password: 'lab123', expectedRole: 'lab_technician', expectedDashboard: '/lab/requests' }
];

async function runE2ETests() {
  console.log('Launching browser for E2E Authentication Tests...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=./chrome_profile', '--headless=new']
  });

  const results = [];

  for (const testUser of testUsers) {
    const page = await browser.newPage();
    console.log(`\nTesting login for ${testUser.email} (${testUser.expectedRole})...`);

    // Capture console messages
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.text()}`));

    // Capture response for login API
    let loginResponse = null;
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        loginResponse = response;
      }
    });

    try {
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

      // Clear fields and type credentials
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle2' });

      await page.type('input[placeholder="Enter your email"]', testUser.email);
      await page.type('input[placeholder="Enter your password"]', testUser.password);

      // Click Sign In button
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 3000 }).catch(() => {})
      ]);

      // Wait for React Router clientside redirects to complete
      await new Promise(r => setTimeout(r, 1000));

      const finalUrl = page.url();
      let responseBody = 'No response captured';
      let responseStatus = 'N/A';

      if (loginResponse) {
        responseStatus = loginResponse.status();
        try {
          responseBody = await loginResponse.json();
        } catch {
          responseBody = await loginResponse.text();
        }
      }

      console.log(`Login API Response Status: ${responseStatus}`);
      console.log(`Login API Response Body:`, JSON.stringify(responseBody));
      console.log(`Final URL after login action: ${finalUrl}`);

      const passed = finalUrl.includes(testUser.expectedDashboard) || finalUrl.includes(testUser.expectedRole);
      results.push({
        email: testUser.email,
        role: testUser.expectedRole,
        apiStatus: responseStatus,
        apiResponse: responseBody,
        finalUrl: finalUrl,
        passed: passed
      });

    } catch (err) {
      console.error(`Error during testing ${testUser.email}:`, err.message);
      results.push({
        email: testUser.email,
        role: testUser.expectedRole,
        passed: false,
        error: err.message
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n================ E2E AUDIT RESULTS ================');
  let allPassed = true;
  results.forEach(r => {
    const statusStr = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${statusStr}] User: ${r.email} (${r.role})`);
    console.log(`       API Status: ${r.apiStatus}`);
    console.log(`       Final URL:  ${r.finalUrl}`);
    if (r.error) console.log(`       Error:      ${r.error}`);
  });
  console.log('===================================================');

  const fs = require('fs');
  fs.writeFileSync('/Users/shubhamkumar/.gemini/antigravity/scratch/auth_e2e_report.json', JSON.stringify({ allPassed, results }, null, 2));
  console.log('Written report to /Users/shubhamkumar/.gemini/antigravity/scratch/auth_e2e_report.json');
}

runE2ETests().catch(err => {
  console.error('Fatal E2E test execution error:', err);
});
