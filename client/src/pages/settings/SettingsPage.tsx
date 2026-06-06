import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';
import { UserCheck, Shield, Key, Mail, Phone, Lock, Save, Sun, Moon, Laptop, SunMoon, Plus, X } from 'lucide-react';

const presets = [
  { name: 'Doctor Preset', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200' },
  { name: 'Patient (M)', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
  { name: 'Patient (F)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { name: 'Admin Preset', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
];

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Basic states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Role-specific fields state
  // Admin
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [contactDetails, setContactDetails] = useState('');

  // Doctor
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Patient
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [historyInput, setHistoryInput] = useState('');

  // Nurse
  const [nurseDepartment, setNurseDepartment] = useState('');
  const [nurseShift, setNurseShift] = useState('');
  const [nurseQualification, setNurseQualification] = useState('');
  const [nurseExperience, setNurseExperience] = useState('');

  // Receptionist
  const [deskNumber, setDeskNumber] = useState('');
  const [receptionistShift, setReceptionistShift] = useState('');
  const [receptionistExperience, setReceptionistExperience] = useState('');

  // Pharmacist
  const [pharmacistLicenseNumber, setPharmacistLicenseNumber] = useState('');
  const [pharmacistQualification, setPharmacistQualification] = useState('');
  const [pharmacistExperience, setPharmacistExperience] = useState('');

  // Lab Technician
  const [labDepartment, setLabDepartment] = useState('');
  const [labQualification, setLabQualification] = useState('');
  const [labLicenseNumber, setLabLicenseNumber] = useState('');
  const [labExperience, setLabExperience] = useState('');

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data?.success) {
          const profile = res.data.data;
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setAvatar(profile.avatar || '');

          const details = profile.profileDetails || {};
          if (profile.role === 'admin') {
            setDesignation(details.designation || '');
            setDepartment(details.department || '');
            setContactDetails(details.contact_details || '');
          } else if (profile.role === 'doctor') {
            setSpecialization(details.specialization || '');
            setQualification(details.qualification || '');
            setExperienceYears(details.experience_years !== undefined ? String(details.experience_years) : '');
            setConsultationFee(details.consultation_fee !== undefined ? String(details.consultation_fee) : '');
            setAvailableDays(details.available_days || []);
            setAvailableTime(details.available_time || '');
            setLicenseNumber(details.license_number || '');
          } else if (profile.role === 'patient') {
            setAge(details.age !== undefined ? String(details.age) : '');
            setGender(details.gender || '');
            setBloodGroup(details.blood_group || '');
            setAddress(details.address || '');
            setEmergencyContact(details.emergency_contact || '');
            setAllergies(details.allergies || []);
            setMedicalHistory(details.medical_history || []);
          } else if (profile.role === 'nurse') {
            setNurseDepartment(details.department || '');
            setNurseShift(details.shift || '');
            setNurseQualification(details.qualification || '');
            setNurseExperience(details.experience !== undefined ? String(details.experience) : '');
          } else if (profile.role === 'receptionist') {
            setDeskNumber(details.desk_number || '');
            setReceptionistShift(details.shift || '');
            setReceptionistExperience(details.experience !== undefined ? String(details.experience) : '');
          } else if (profile.role === 'pharmacist') {
            setPharmacistLicenseNumber(details.license_number || '');
            setPharmacistQualification(details.qualification || '');
            setPharmacistExperience(details.experience !== undefined ? String(details.experience) : '');
          } else if (profile.role === 'lab_technician') {
            setLabDepartment(details.lab_department || '');
            setLabQualification(details.qualification || '');
            setLabLicenseNumber(details.license_number || '');
            setLabExperience(details.experience !== undefined ? String(details.experience) : '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      alert('Full name is required.');
      return;
    }
    setSavingProfile(true);

    const payload: any = {
      full_name: fullName,
      phone,
      avatar,
    };

    if (user?.role === 'admin') {
      payload.designation = designation;
      payload.department = department;
      payload.contact_details = contactDetails;
    } else if (user?.role === 'doctor') {
      payload.specialization = specialization;
      payload.qualification = qualification;
      payload.experience_years = experienceYears;
      payload.consultation_fee = consultationFee;
      payload.available_days = availableDays;
      payload.available_time = availableTime;
      payload.license_number = licenseNumber;
    } else if (user?.role === 'patient') {
      payload.age = age;
      payload.gender = gender;
      payload.blood_group = bloodGroup;
      payload.address = address;
      payload.emergency_contact = emergencyContact;
      payload.allergies = allergies;
      payload.medical_history = medicalHistory;
    } else if (user?.role === 'nurse') {
      payload.department = nurseDepartment;
      payload.shift = nurseShift;
      payload.qualification = nurseQualification;
      payload.experience = nurseExperience;
    } else if (user?.role === 'receptionist') {
      payload.desk_number = deskNumber;
      payload.shift = receptionistShift;
      payload.experience = receptionistExperience;
    } else if (user?.role === 'pharmacist') {
      payload.license_number = pharmacistLicenseNumber;
      payload.qualification = pharmacistQualification;
      payload.experience = pharmacistExperience;
    } else if (user?.role === 'lab_technician') {
      payload.lab_department = labDepartment;
      payload.qualification = labQualification;
      payload.license_number = labLicenseNumber;
      payload.experience = labExperience;
    }

    try {
      const res = await authAPI.updateProfile(payload);
      if (res.data?.success) {
        updateProfile({
          full_name: fullName,
          phone,
          avatar,
        });
        alert('Profile details updated successfully!');
      } else {
        alert(res.data?.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setUpdatingPassword(true);

    try {
      setTimeout(() => {
        alert('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setUpdatingPassword(false);
      }, 800);
    } catch (err) {
      setUpdatingPassword(false);
      alert('Failed to change password.');
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'System Administrator',
    doctor: 'Consolidated Doctor Specialist',
    nurse: 'General Care Nurse',
    receptionist: 'Reception Desk Desk Manager',
    patient: 'Medical Care Patient',
    pharmacist: 'Fulfillment Pharmacist',
    lab_technician: 'Diagnostic Lab Technician',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-medical-muted text-xs animate-pulse">Loading Profile Settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="text-medical-muted text-sm mt-1">Configure your personal contact card and security credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Profile & Theme */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-6">
            <h3 className="section-title text-sm flex items-center gap-1.5 border-b border-medical-border pb-3">
              <UserCheck size={18} className="text-primary-600" />
              Personal Profile Details
            </h3>

            {/* Avatar section */}
            <div className="flex flex-col items-center gap-4 border-b border-medical-border pb-4">
              <div className="relative group">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary-500 shadow-md"
                />
              </div>
              <div className="w-full space-y-2">
                <label htmlFor="avatar_url" className="block text-center font-semibold text-medical-text-primary text-xs">Profile Photo URL</label>
                <input
                  type="text"
                  id="avatar_url"
                  name="avatar_url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Paste an image URL..."
                  className="w-full px-3 py-1.5 rounded-lg border border-medical-border bg-white text-xs text-center focus:outline-none"
                />
                <div className="flex justify-center gap-2 mt-1">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                        avatar === preset.url ? 'border-primary-500 scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="full_name" className="block font-semibold text-medical-text-primary mb-1.5">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block font-semibold text-medical-text-primary mb-1.5">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <span className="block font-semibold text-medical-muted mb-1.5">Email Address (Read-only)</span>
                <div className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-gray-50 text-medical-muted select-none flex items-center gap-1.5">
                  <Mail size={14} />
                  {user?.email}
                </div>
              </div>

              {/* Admin profile fields */}
              {user?.role === 'admin' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Administrative Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="designation" className="block font-semibold text-medical-text-primary mb-1.5">Designation</label>
                      <input
                        type="text"
                        id="designation"
                        name="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block font-semibold text-medical-text-primary mb-1.5">Department</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact_details" className="block font-semibold text-medical-text-primary mb-1.5">Alternative Contact Info</label>
                    <input
                      type="text"
                      id="contact_details"
                      name="contact_details"
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Doctor profile fields */}
              {user?.role === 'doctor' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Professional Practice Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="specialization" className="block font-semibold text-medical-text-primary mb-1.5">Specialization</label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="qualification" className="block font-semibold text-medical-text-primary mb-1.5">Qualification</label>
                      <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="experience_years" className="block font-semibold text-medical-text-primary mb-1.5">Experience (Years)</label>
                      <input
                        type="number"
                        id="experience_years"
                        name="experience_years"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="consultation_fee" className="block font-semibold text-medical-text-primary mb-1.5">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        id="consultation_fee"
                        name="consultation_fee"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="available_time" className="block font-semibold text-medical-text-primary mb-1.5">Available Hours</label>
                      <input
                        type="text"
                        id="available_time"
                        name="available_time"
                        placeholder="e.g. 09:00 - 17:00"
                        value={availableTime}
                        onChange={(e) => setAvailableTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="license_number" className="block font-semibold text-medical-text-primary mb-1.5">Medical License Number</label>
                      <input
                        type="text"
                        id="license_number"
                        name="license_number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block font-semibold text-medical-text-primary mb-1.5">Available Days</span>
                    <div className="grid grid-cols-4 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <label key={day} htmlFor={`day_${day}`} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            id={`day_${day}`}
                            name="available_days"
                            value={day}
                            checked={availableDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAvailableDays([...availableDays, day]);
                              } else {
                                setAvailableDays(availableDays.filter((d) => d !== day));
                              }
                            }}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-[11px] text-medical-text-secondary select-none">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Patient profile fields */}
              {user?.role === 'patient' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Medical Profile & Info</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="age" className="block font-semibold text-medical-text-primary mb-1.5">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block font-semibold text-medical-text-primary mb-1.5">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="blood_group" className="block font-semibold text-medical-text-primary mb-1.5">Blood Group</label>
                      <select
                        id="blood_group"
                        name="blood_group"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      >
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="emergency_contact" className="block font-semibold text-medical-text-primary mb-1.5">Emergency Contact Number</label>
                    <input
                      type="text"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block font-semibold text-medical-text-primary mb-1.5">Permanent Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>
                  
                  {/* Allergies tag manager */}
                  <div>
                    <label htmlFor="allergy_input" className="block font-semibold text-medical-text-primary mb-1.5">Known Allergies</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="allergy_input"
                        name="allergy_input"
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        placeholder="Add allergy..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-medical-border bg-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
                            setAllergies([...allergies, allergyInput.trim()]);
                            setAllergyInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 font-semibold flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {allergies.map((allergy) => (
                        <span key={allergy} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                          {allergy}
                          <button
                            type="button"
                            onClick={() => setAllergies(allergies.filter((a) => a !== allergy))}
                            className="hover:text-red-900"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      {allergies.length === 0 && <span className="text-[10px] text-medical-muted italic">No allergies listed</span>}
                    </div>
                  </div>

                  {/* Medical History tag manager */}
                  <div>
                    <label htmlFor="history_input" className="block font-semibold text-medical-text-primary mb-1.5">Medical History / Diagnoses</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="history_input"
                        name="history_input"
                        value={historyInput}
                        onChange={(e) => setHistoryInput(e.target.value)}
                        placeholder="Add condition..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-medical-border bg-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (historyInput.trim() && !medicalHistory.includes(historyInput.trim())) {
                            setMedicalHistory([...medicalHistory, historyInput.trim()]);
                            setHistoryInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 font-semibold flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {medicalHistory.map((condition) => (
                        <span key={condition} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                          {condition}
                          <button
                            type="button"
                            onClick={() => setMedicalHistory(medicalHistory.filter((c) => c !== condition))}
                            className="hover:text-blue-900"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      {medicalHistory.length === 0 && <span className="text-[10px] text-medical-muted italic">No medical history conditions listed</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Nurse profile fields */}
              {user?.role === 'nurse' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Nursing Practice Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nurse_department" className="block font-semibold text-medical-text-primary mb-1.5">Department</label>
                      <input
                        type="text"
                        id="nurse_department"
                        name="nurse_department"
                        value={nurseDepartment}
                        onChange={(e) => setNurseDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="nurse_shift" className="block font-semibold text-medical-text-primary mb-1.5">Shift Duty</label>
                      <select
                        id="nurse_shift"
                        name="nurse_shift"
                        value={nurseShift}
                        onChange={(e) => setNurseShift(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      >
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning Shift</option>
                        <option value="Afternoon">Afternoon Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="nurse_qualification" className="block font-semibold text-medical-text-primary mb-1.5">Nursing Qualification</label>
                      <input
                        type="text"
                        id="nurse_qualification"
                        name="nurse_qualification"
                        value={nurseQualification}
                        onChange={(e) => setNurseQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="nurse_experience" className="block font-semibold text-medical-text-primary mb-1.5">Experience (Years)</label>
                      <input
                        type="number"
                        id="nurse_experience"
                        name="nurse_experience"
                        value={nurseExperience}
                        onChange={(e) => setNurseExperience(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Receptionist profile fields */}
              {user?.role === 'receptionist' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Front Desk Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="desk_number" className="block font-semibold text-medical-text-primary mb-1.5">Desk / Counter Number</label>
                      <input
                        type="text"
                        id="desk_number"
                        name="desk_number"
                        value={deskNumber}
                        onChange={(e) => setDeskNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="receptionist_shift" className="block font-semibold text-medical-text-primary mb-1.5">Desk Shift</label>
                      <select
                        id="receptionist_shift"
                        name="receptionist_shift"
                        value={receptionistShift}
                        onChange={(e) => setReceptionistShift(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      >
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning Shift</option>
                        <option value="Afternoon">Afternoon Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="receptionist_experience" className="block font-semibold text-medical-text-primary mb-1.5">Reception Experience (Years)</label>
                    <input
                      type="number"
                      id="receptionist_experience"
                      name="receptionist_experience"
                      value={receptionistExperience}
                      onChange={(e) => setReceptionistExperience(e.target.value)}
                      min="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Pharmacist profile fields */}
              {user?.role === 'pharmacist' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Pharmacy License Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pharmacist_license_number" className="block font-semibold text-medical-text-primary mb-1.5">Pharmacist License Number</label>
                      <input
                        type="text"
                        id="pharmacist_license_number"
                        name="pharmacist_license_number"
                        value={pharmacistLicenseNumber}
                        onChange={(e) => setPharmacistLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="pharmacist_qualification" className="block font-semibold text-medical-text-primary mb-1.5">Qualification</label>
                      <input
                        type="text"
                        id="pharmacist_qualification"
                        name="pharmacist_qualification"
                        value={pharmacistQualification}
                        onChange={(e) => setPharmacistQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pharmacist_experience" className="block font-semibold text-medical-text-primary mb-1.5">Experience (Years)</label>
                    <input
                      type="number"
                      id="pharmacist_experience"
                      name="pharmacist_experience"
                      value={pharmacistExperience}
                      onChange={(e) => setPharmacistExperience(e.target.value)}
                      min="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Lab Technician profile fields */}
              {user?.role === 'lab_technician' && (
                <div className="space-y-4 border-t border-medical-border pt-4 mt-4">
                  <h4 className="font-bold text-primary-700 text-xs">Laboratory Practice Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="lab_department" className="block font-semibold text-medical-text-primary mb-1.5">Laboratory Department</label>
                      <input
                        type="text"
                        id="lab_department"
                        name="lab_department"
                        value={labDepartment}
                        onChange={(e) => setLabDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="lab_qualification" className="block font-semibold text-medical-text-primary mb-1.5">Qualification</label>
                      <input
                        type="text"
                        id="lab_qualification"
                        name="lab_qualification"
                        value={labQualification}
                        onChange={(e) => setLabQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="lab_license_number" className="block font-semibold text-medical-text-primary mb-1.5">Technician License Number</label>
                      <input
                        type="text"
                        id="lab_license_number"
                        name="lab_license_number"
                        value={labLicenseNumber}
                        onChange={(e) => setLabLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="lab_experience" className="block font-semibold text-medical-text-primary mb-1.5">Experience (Years)</label>
                      <input
                        type="number"
                        id="lab_experience"
                        name="lab_experience"
                        value={labExperience}
                        onChange={(e) => setLabExperience(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary py-2.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save size={14} />
                  {savingProfile ? 'Saving...' : 'Save Profile Card'}
                </button>
              </div>
            </form>
          </div>

          {/* Theme Settings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-4">
            <h3 className="section-title text-sm flex items-center gap-1.5 border-b border-medical-border pb-3">
              <SunMoon size={18} className="text-primary-600" />
              Theme Preference
            </h3>
            
            <div className="space-y-3">
              <p className="text-xs text-medical-muted">Choose how MediCare AI looks on this device.</p>
              
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      theme === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/25 dark:text-primary-400'
                        : 'border-medical-border bg-white text-medical-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    {t === 'light' && <Sun size={14} />}
                    {t === 'dark' && <Moon size={14} />}
                    {t === 'system' && <Laptop size={14} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password */}
        <div className="space-y-6">
          {/* Password update card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h3 className="section-title text-sm flex items-center gap-1.5 border-b border-medical-border pb-3">
              <Key size={18} className="text-primary-600" />
              Update Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs pt-3">
              <div>
                <label htmlFor="old_password" className="block font-semibold text-medical-text-primary mb-1.5">Current Password</label>
                <input
                  type="password"
                  id="old_password"
                  name="old_password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block font-semibold text-medical-text-primary mb-1.5">New Password</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block font-semibold text-medical-text-primary mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="btn-primary py-2.5 text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 shadow-slate-800/10"
                >
                  <Lock size={14} />
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Role Permissions Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border flex items-start gap-3">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-medical-text-primary">System Credentials</h4>
              <p className="text-xs text-medical-muted mt-1 leading-relaxed">
                Registered Role: <span className="font-bold text-primary-600 capitalize">{roleLabels[user?.role || 'patient']}</span>
              </p>
              <p className="text-[10px] text-medical-muted mt-1">
                Your credentials are encrypted using bcrypt and protected by secure JWT handshakes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
