const http = require('http');

const API_BASE = 'http://localhost:5001/api';

// Generic request helper
async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const data = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {}
    };
    
    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
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
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

const getRequest = (path, token = null) => makeRequest('GET', path, null, token);
const postRequest = (path, body, token = null) => makeRequest('POST', path, body, token);
const putRequest = (path, body = null, token = null) => makeRequest('PUT', path, body, token);

async function runE2ETests() {
  console.log('======================================================');
  console.log('      MEDICARE AI - END-TO-END WORKFLOW TESTS         ');
  console.log('======================================================\n');
  
  let successCount = 0;
  let failCount = 0;
  
  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      successCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Login of all default demo users
    // ----------------------------------------------------
    console.log('--- Test 1: Testing Auth and Demo User Logins ---');
    const demoAccounts = [
      { email: 'admin@medicare.com', password: 'admin123', expectedRole: 'admin' },
      { email: 'doctor@medicare.com', password: 'doctor123', expectedRole: 'doctor' },
      { email: 'nurse@medicare.com', password: 'nurse123', expectedRole: 'nurse' },
      { email: 'reception@medicare.com', password: 'reception123', expectedRole: 'receptionist' },
      { email: 'patient@medicare.com', password: 'patient123', expectedRole: 'patient' },
      { email: 'pharma@medicare.com', password: 'pharma123', expectedRole: 'pharmacist' },
      { email: 'lab@medicare.com', password: 'lab123', expectedRole: 'lab_technician' }
    ];

    const tokens = {};
    const userInfo = {};

    for (const acc of demoAccounts) {
      const res = await postRequest('/auth/login', { email: acc.email, password: acc.password });
      assert(res.statusCode === 200, `Login status for ${acc.email} is 200`);
      if (res.statusCode === 200) {
        assert(res.data.success === true, `Login JSON success for ${acc.email}`);
        assert(res.data.data.user.role === acc.expectedRole, `Role matches expected ${acc.expectedRole} for ${acc.email}`);
        assert(!!res.data.data.token, `JWT token returned for ${acc.email}`);
        tokens[acc.expectedRole] = res.data.data.token;
        userInfo[acc.expectedRole] = res.data.data.user;
      }
    }

    // ----------------------------------------------------
    // TEST 2: Doctor Profile Auto-Creation on Registration
    // ----------------------------------------------------
    console.log('\n--- Test 2: Testing Doctor Profile Auto-Creation ---');
    const newDocEmail = `newdoc_${Date.now()}@medicare.com`;
    const regRes = await postRequest('/auth/register', {
      email: newDocEmail,
      password: 'doctor123',
      full_name: 'Dr. John Doe',
      phone: '+91-9999988888',
      role: 'doctor'
    });
    
    assert(regRes.statusCode === 201, 'Registering new doctor account returns 201 Created');
    let newDocToken = '';
    if (regRes.statusCode === 201) {
      newDocToken = regRes.data.data.token;
      assert(!!newDocToken, 'Acquired token for registered doctor');
      
      // Let's verify the doctor profile was created in the doctors list
      const docsRes = await getRequest('/doctors', newDocToken);
      const matchedDoctor = docsRes.data.data.find(d => d.email === newDocEmail);
      assert(!!matchedDoctor, 'Doctor profile was automatically created and found in /doctors list');
      if (matchedDoctor) {
        assert(matchedDoctor.full_name === 'Dr. John Doe', 'Doctor full name matched profile');
        assert(matchedDoctor.phone === '+91-9999988888', 'Doctor phone matched profile');
        assert(matchedDoctor.specialization === 'General Medicine', 'Doctor default specialization assigned');
      }
    }

    // ----------------------------------------------------
    // TEST 3: Appointment Booking & Status Lifecycle Sync
    // ----------------------------------------------------
    console.log('\n--- Test 3: Testing Appointment Sync & Lifecycle (Confirm/Complete) ---');
    const patientToken = tokens['patient'];
    const doctorToken = tokens['doctor'];
    
    // Step A: Find the patient profile id
    const profileRes = await getRequest('/auth/profile', patientToken);
    assert(profileRes.statusCode === 200, 'Patient profile fetched successfully');
    
    // Find matching patient in /patients
    const patientsRes = await getRequest('/patients', patientToken);
    const patientProfile = patientsRes.data.data.find(p => p.user_id === userInfo['patient'].id);
    assert(!!patientProfile, 'Found corresponding patient profile');
    
    // Find matching doctor in /doctors
    const doctorsRes = await getRequest('/doctors', patientToken);
    const doctorProfile = doctorsRes.data.data.find(d => d.user_id === userInfo['doctor'].id);
    assert(!!doctorProfile, 'Found corresponding doctor profile');

    if (patientProfile && doctorProfile) {
      console.log(`Patient Profile ID: ${patientProfile.id}`);
      console.log(`Doctor Profile ID: ${doctorProfile.id}`);

      // Step B: Book an appointment as patient
      const date = '2026-07-20';
      const time_slot = '14:30-15:00';
      const bookingRes = await postRequest('/appointments', {
        patient_id: patientProfile.id,
        doctor_id: doctorProfile.id,
        date: date,
        time_slot: time_slot,
        notes: 'Testing appointment lifecycle sync'
      }, patientToken);

      assert(bookingRes.statusCode === 201, 'Booking returns 201 Created');
      assert(bookingRes.data.data.status === 'pending', 'Appointment has default status of pending');
      const appointmentId = bookingRes.data.data.id;
      assert(!!appointmentId, `Appointment booked with ID: ${appointmentId}`);

      // Step C: Verify patient sees appointment in patient dashboard / list
      const patientAptsRes = await getRequest(`/appointments/patient/${patientProfile.id}`, patientToken);
      const patientApt = patientAptsRes.data.data.find(a => a.id === appointmentId);
      assert(!!patientApt, 'Patient can retrieve the newly booked appointment');
      assert(patientApt.status === 'pending', 'Patient sees appointment status as pending');

      // Step D: Verify doctor sees appointment in doctor dashboard / list
      const doctorAptsRes = await getRequest(`/appointments/doctor/${doctorProfile.id}`, doctorToken);
      const doctorApt = doctorAptsRes.data.data.find(a => a.id === appointmentId);
      assert(!!doctorApt, 'Doctor can retrieve the newly booked appointment (linked via doctor_id)');
      assert(doctorApt.status === 'pending', 'Doctor sees appointment status as pending');

      // Step E: Doctor confirms appointment
      const confirmRes = await putRequest(`/appointments/${appointmentId}/confirm`, null, doctorToken);
      assert(confirmRes.statusCode === 200, 'Doctor confirm appointment returns 200 OK');
      assert(confirmRes.data.data.status === 'confirmed', 'Confirm request updates status to confirmed');

      // Step F: Patient sees updated status immediately
      const patientAptsRes2 = await getRequest(`/appointments/patient/${patientProfile.id}`, patientToken);
      const patientApt2 = patientAptsRes2.data.data.find(a => a.id === appointmentId);
      assert(patientApt2.status === 'confirmed', 'Patient dashboard sync: Patient immediately sees confirmed status');

      // Step G: Doctor completes appointment
      const completeRes = await putRequest(`/appointments/${appointmentId}/complete`, null, doctorToken);
      assert(completeRes.statusCode === 200, 'Doctor complete appointment returns 200 OK');
      assert(completeRes.data.data.status === 'completed', 'Complete request updates status to completed');

      // Step H: Patient sees completed status immediately
      const patientAptsRes3 = await getRequest(`/appointments/patient/${patientProfile.id}`, patientToken);
      const patientApt3 = patientAptsRes3.data.data.find(a => a.id === appointmentId);
      assert(patientApt3.status === 'completed', 'Patient dashboard sync: Patient immediately sees completed status');
    }

    // ----------------------------------------------------
    // TEST 4: Appointment Rejection / Cancellation Workflow
    // ----------------------------------------------------
    console.log('\n--- Test 4: Testing Appointment Rejection Workflow ---');
    if (patientProfile && doctorProfile) {
      // Step A: Patient books another appointment
      const date2 = '2026-07-21';
      const time_slot2 = '15:00-15:30';
      const bookingRes2 = await postRequest('/appointments', {
        patient_id: patientProfile.id,
        doctor_id: doctorProfile.id,
        date: date2,
        time_slot: time_slot2,
        notes: 'Testing reject workflow'
      }, patientToken);

      assert(bookingRes2.statusCode === 201, 'Booking second appointment returns 201 Created');
      const appointmentId2 = bookingRes2.data.data.id;

      // Step B: Doctor rejects the appointment
      const rejectRes = await putRequest(`/appointments/${appointmentId2}/reject`, null, doctorToken);
      assert(rejectRes.statusCode === 200, 'Doctor reject appointment returns 200 OK');
      assert(rejectRes.data.data.status === 'cancelled', 'Reject request updates status to cancelled');

      // Step C: Patient sees cancelled status immediately
      const patientAptsRes4 = await getRequest(`/appointments/patient/${patientProfile.id}`, patientToken);
      const patientApt4 = patientAptsRes4.data.data.find(a => a.id === appointmentId2);
      assert(patientApt4.status === 'cancelled', 'Patient dashboard sync: Patient immediately sees cancelled status');
    }

  } catch (error) {
    console.error('Test execution error:', error);
    failCount++;
  }

  console.log('\n======================================================');
  console.log('                  TEST SUMMARY                        ');
  console.log('======================================================');
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('======================================================');
  
  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests();
