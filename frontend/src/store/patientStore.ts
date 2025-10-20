import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface Patient {
  patient_id: number;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  dob: string;
  gender: string;
  blood_type?: string;
  address: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string;
  profile_picture?: string;
  active: boolean;
  created_at: string;
}

interface PatientState {
  patient: Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (patient: Patient, token: string) => Promise<void>;
  logout: () => void;
  updatePatient: (patient: Patient) => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      patient: null,
      token: null,
      isAuthenticated: false,
      login: async (patient: Patient, token: string) => {
        console.log('🔐 Login: Starting login process for patient:', patient.patient_id);
        
        // Set axios default authorization header
        if (typeof window !== 'undefined') {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Fetch profile picture from the profile service
        try {
          console.log('🔐 Login: Fetching profile picture from profile service...');
          const profileResponse = await fetch(`http://localhost:5000/api/patient-auth/test-profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('🔐 Login: Profile service response status:', profileResponse.status);
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('🔐 Login: Profile data received:', profileData);
            
            if (profileData.profile && profileData.profile.profile_picture) {
              // Update patient with profile picture
              const updatedPatient = {
                ...patient,
                profile_picture: `http://localhost:5000${profileData.profile.profile_picture}`
              };
              
              console.log('🔐 Login: Updated patient with profile picture:', updatedPatient);
              
              set({
                patient: updatedPatient,
                token,
                isAuthenticated: true,
              });
              return;
            } else {
              console.log('🔐 Login: No profile picture found in profile data');
            }
          } else {
            console.log('🔐 Login: Profile service response not ok:', profileResponse.status);
          }
        } catch (error) {
          console.log('⚠️ Login: Could not fetch profile picture during login:', error);
        }
        
        // Fallback: set patient without profile picture
        console.log('🔐 Login: Setting patient without profile picture');
        set({
          patient,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Remove axios default authorization header
        if (typeof window !== 'undefined') {
          delete api.defaults.headers.common['Authorization'];
        }
        
        set({
          patient: null,
          token: null,
          isAuthenticated: false,
        });
      },
      updatePatient: (patient: Patient) => set({ patient }),
    }),
    {
      name: 'patient-auth-storage',
      // Only persist authentication state, not sensitive data
      partialize: (state) => ({ 
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        patient: state.patient 
      }),
    }
  )
);