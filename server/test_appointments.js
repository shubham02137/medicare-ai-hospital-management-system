const http = require('http');

const API_BASE = 'http://localhost:5001/api';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const data = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
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
    
    if (body) {
      req.write(data);
    }
    req.end();
  });
}

async function runWorkflow() {
  try {
    console.log('--- Step 1: Logging in as Patient ---');
    const patientLogin = await request('POST', '/auth/login', {
      email: 'patient@medicare.com',
      password: 'patient123'
    });
    if (patientLogin.statusCode !== 200) {
      console.error('Patient login failed:', patientLogin);
      return;
    }
    const patientToken = patientLogin.data.data.token;
    const patientUser = patientLogin.data.data.user;
    console.log(`Logged in as patient: ${patientUser.full_name} (${patientUser.id})`);

    console.log('\n--- Step 2: Fetching Patient Details ---');
    const patientProfile = await request('GET', '/auth/profile', null, patientToken);
    console.log('Patient profile:', JSON.stringify(patientProfile.data, null, 2));

    // Wait, let's list patients to find patientId
    const patientsList = await request('GET', '/patients', null, patientToken);
    console.log('Patients count:', patientsList.data?.data?.length);
    const patientRecord = patientsList.data?.data?.find(p => p.user_id === patientUser.id);
    if (!patientRecord) {
      console.error('Could not find patient record for user_id:', patientUser.id);
      return;
    }
    const patientId = patientRecord.id;
    console.log(`Found patient record ID: ${patientId}`);

    console.log('\n--- Step 3: Fetching Doctors List ---');
    const doctorsList = await request('GET', '/doctors', null, patientToken);
    console.log(`Available doctors: ${doctorsList.data?.data?.length}`);
    const targetDoc = doctorsList.data?.data?.[0]; // e.g. Dr. Priya Sharma
    if (!targetDoc) {
      console.error('No doctors available.');
      return;
    }
    console.log(`Selected Doctor: ${targetDoc.full_name} (ID: ${targetDoc.id}, User ID: ${targetDoc.user_id})`);

    console.log('\n--- Step 4: Booking an Appointment ---');
    const bookPayload = {
      patient_id: patientId,
      doctor_id: targetDoc.id,
      date: '2026-06-10',
      time_slot: '10:00-10:30',
      notes: 'Testing appointment sync workflow'
    };
    const bookingRes = await request('POST', '/appointments', bookPayload, patientToken);
    console.log('Booking Response:', JSON.stringify(bookingRes.data, null, 2));
    if (bookingRes.statusCode !== 201) {
      console.error('Booking failed!');
      return;
    }
    const appointmentId = bookingRes.data.data.id;
    console.log(`Appointment created with ID: ${appointmentId}`);

    console.log('\n--- Step 5: Logging in as Doctor ---');
    const doctorLogin = await request('POST', '/auth/login', {
      email: targetDoc.email, // 'doctor@medicare.com'
      password: 'doctor123'
    });
    if (doctorLogin.statusCode !== 200) {
      console.error('Doctor login failed:', doctorLogin);
      return;
    }
    const doctorToken = doctorLogin.data.data.token;
    const doctorUser = doctorLogin.data.data.user;
    console.log(`Logged in as doctor: ${doctorUser.full_name} (${doctorUser.id})`);

    // Let's resolve the doctor record in the DB
    const doctorProfileList = await request('GET', '/doctors', null, doctorToken);
    const docRecord = doctorProfileList.data?.data?.find(d => d.user_id === doctorUser.id);
    if (!docRecord) {
      console.error('Doctor record not found for user_id:', doctorUser.id);
      return;
    }
    const doctorId = docRecord.id;
    console.log(`Found doctor record ID: ${doctorId}`);

    console.log('\n--- Step 6: Querying Doctor\'s Appointments ---');
    const doctorAppointments = await request('GET', `/appointments/doctor/${doctorId}`, null, doctorToken);
    console.log('Doctor Appointments Response:', JSON.stringify(doctorAppointments.data, null, 2));
    
    const foundAppointment = doctorAppointments.data?.data?.find(a => a.id === appointmentId);
    if (foundAppointment) {
      console.log('SUCCESS: Appointment found in Doctor appointments list!');
    } else {
      console.log('FAILURE: Appointment NOT found in Doctor appointments list!');
    }

  } catch (err) {
    console.error('Error running test:', err);
  }
}

runWorkflow();
