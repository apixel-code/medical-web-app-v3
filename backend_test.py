import requests
import sys
from datetime import datetime

class HospitalAPITester:
    def __init__(self, base_url="https://medhub-care-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        token_to_use = self.admin_token if use_admin else self.token
        if token_to_use:
            headers['Authorization'] = f'Bearer {token_to_use}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@luminamedical.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin role: {response.get('user', {}).get('role', 'N/A')}")
            return True
        return False

    def test_patient_login(self):
        """Test patient login"""
        success, response = self.run_test(
            "Patient Login",
            "POST",
            "auth/login",
            200,
            data={"email": "patient@example.com", "password": "patient123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Patient role: {response.get('user', {}).get('role', 'N/A')}")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "testpass123",
                "full_name": "Test User",
                "phone": "+1-555-0123"
            }
        )
        return success and 'token' in response

    def test_departments(self):
        """Test departments endpoint"""
        success, response = self.run_test(
            "Get Departments",
            "GET",
            "departments",
            200
        )
        if success:
            departments = response if isinstance(response, list) else []
            print(f"   Found {len(departments)} departments")
            if len(departments) != 9:
                print(f"   ⚠️  Expected 9 departments, found {len(departments)}")
        return success

    def test_doctors(self):
        """Test doctors endpoint"""
        success, response = self.run_test(
            "Get Doctors",
            "GET",
            "doctors",
            200
        )
        if success:
            doctors = response if isinstance(response, list) else []
            print(f"   Found {len(doctors)} doctors")
            if len(doctors) != 18:
                print(f"   ⚠️  Expected 18 doctors, found {len(doctors)}")
        return success

    def test_doctors_filter(self):
        """Test doctor filtering by department"""
        # First get a department ID
        success, dept_response = self.run_test(
            "Get First Department for Filter",
            "GET",
            "departments",
            200
        )
        if success and dept_response:
            dept_id = dept_response[0]['id']
            success, response = self.run_test(
                "Filter Doctors by Department",
                "GET",
                f"doctors?department={dept_id}",
                200
            )
            if success:
                filtered_doctors = response if isinstance(response, list) else []
                print(f"   Found {len(filtered_doctors)} doctors in department")
        return success

    def test_department_detail(self):
        """Test department detail endpoint"""
        success, response = self.run_test(
            "Get Department Detail (cardiology)",
            "GET",
            "departments/cardiology",
            200
        )
        if success:
            print(f"   Department: {response.get('name', 'N/A')}")
            doctors = response.get('doctors', [])
            print(f"   Doctors in department: {len(doctors)}")
        return success

    def test_doctor_profile(self):
        """Test doctor profile endpoint"""
        # First get a doctor ID
        success, doctors_response = self.run_test(
            "Get Doctors for Profile Test",
            "GET",
            "doctors",
            200
        )
        if success and doctors_response:
            doctor_id = doctors_response[0]['id']
            success, response = self.run_test(
                "Get Doctor Profile",
                "GET",
                f"doctors/{doctor_id}",
                200
            )
            if success:
                print(f"   Doctor: {response.get('name', 'N/A')}")
                print(f"   Specialization: {response.get('specialization', 'N/A')}")
        return success

    def test_blog_posts(self):
        """Test blog posts endpoint"""
        success, response = self.run_test(
            "Get Blog Posts",
            "GET",
            "blog",
            200
        )
        if success:
            posts = response if isinstance(response, list) else []
            print(f"   Found {len(posts)} blog posts")
            if len(posts) != 6:
                print(f"   ⚠️  Expected 6 blog posts, found {len(posts)}")
        return success

    def test_services(self):
        """Test services endpoint"""
        success, response = self.run_test(
            "Get Services",
            "GET",
            "services",
            200
        )
        if success:
            services = response if isinstance(response, list) else []
            print(f"   Found {len(services)} services")
            if len(services) != 8:
                print(f"   ⚠️  Expected 8 services, found {len(services)}")
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        success, response = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data={
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1-555-0123",
                "subject": "Test Subject",
                "message": "This is a test message for the contact form."
            }
        )
        if success:
            print(f"   Message ID: {response.get('id', 'N/A')}")
        return success

    def test_appointment_booking(self):
        """Test appointment booking"""
        # First get department and doctor IDs
        success, dept_response = self.run_test(
            "Get Departments for Appointment",
            "GET",
            "departments",
            200
        )
        if not success:
            return False
            
        success, doc_response = self.run_test(
            "Get Doctors for Appointment",
            "GET",
            "doctors",
            200
        )
        if not success:
            return False

        dept_id = dept_response[0]['id']
        doctor_id = doc_response[0]['id']

        success, response = self.run_test(
            "Book Appointment",
            "POST",
            "appointments",
            200,
            data={
                "doctor_id": doctor_id,
                "department_id": dept_id,
                "date": "2024-12-25",
                "time": "10:00 AM",
                "patient_name": "Test Patient",
                "patient_email": "testpatient@example.com",
                "patient_phone": "+1-555-0123",
                "notes": "Test appointment booking"
            }
        )
        if success:
            print(f"   Appointment ID: {response.get('id', 'N/A')}")
        return success

    def test_patient_appointments(self):
        """Test patient appointments (requires login)"""
        if not self.token:
            print("   Skipped - No patient token")
            return False
            
        success, response = self.run_test(
            "Get Patient Appointments",
            "GET",
            "appointments",
            200
        )
        if success:
            appointments = response if isinstance(response, list) else []
            print(f"   Found {len(appointments)} patient appointments")
        return success

    def test_patient_prescriptions(self):
        """Test patient prescriptions (requires login)"""
        if not self.token:
            print("   Skipped - No patient token")
            return False
            
        success, response = self.run_test(
            "Get Patient Prescriptions",
            "GET",
            "prescriptions",
            200
        )
        if success:
            prescriptions = response if isinstance(response, list) else []
            print(f"   Found {len(prescriptions)} prescriptions")
        return success

    def test_patient_reports(self):
        """Test patient medical reports (requires login)"""
        if not self.token:
            print("   Skipped - No patient token")
            return False
            
        success, response = self.run_test(
            "Get Patient Reports",
            "GET",
            "reports",
            200
        )
        if success:
            reports = response if isinstance(response, list) else []
            print(f"   Found {len(reports)} medical reports")
        return success

    def test_admin_stats(self):
        """Test admin stats (requires admin login)"""
        if not self.admin_token:
            print("   Skipped - No admin token")
            return False
            
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200,
            use_admin=True
        )
        if success:
            print(f"   Total patients: {response.get('total_patients', 'N/A')}")
            print(f"   Total doctors: {response.get('total_doctors', 'N/A')}")
            print(f"   Total appointments: {response.get('total_appointments', 'N/A')}")
        return success

    def test_admin_patients_list(self):
        """Test admin patients list (requires admin login)"""
        if not self.admin_token:
            print("   Skipped - No admin token")
            return False
            
        success, response = self.run_test(
            "Get Admin Patients List",
            "GET",
            "admin/patients",
            200,
            use_admin=True
        )
        if success:
            patients = response if isinstance(response, list) else []
            print(f"   Found {len(patients)} patients in admin view")
        return success

    def test_blog_post_creation(self):
        """Test admin blog post creation (requires admin login)"""
        if not self.admin_token:
            print("   Skipped - No admin token")
            return False
            
        success, response = self.run_test(
            "Create Blog Post (Admin)",
            "POST",
            "blog",
            200,
            data={
                "title": "Test Blog Post",
                "content": "This is a test blog post content for API testing.",
                "excerpt": "Test excerpt",
                "category": "Testing",
                "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
            },
            use_admin=True
        )
        if success:
            print(f"   Created post ID: {response.get('id', 'N/A')}")
            return response.get('id')
        return False

    def test_blog_post_deletion(self, post_id):
        """Test admin blog post deletion (requires admin login)"""
        if not self.admin_token or not post_id:
            print("   Skipped - No admin token or post ID")
            return False
            
        success, response = self.run_test(
            "Delete Blog Post (Admin)",
            "DELETE",
            f"blog/{post_id}",
            200,
            use_admin=True
        )
        return success

def main():
    print("🏥 Hospital Website API Testing")
    print("=" * 50)
    
    tester = HospitalAPITester()
    
    # Test sequence
    print("\n📋 Running Authentication Tests...")
    admin_login_success = tester.test_admin_login()
    patient_login_success = tester.test_patient_login()
    tester.test_user_registration()
    
    print("\n🏢 Running Public API Tests...")
    tester.test_departments()
    tester.test_doctors()
    tester.test_doctors_filter()
    tester.test_department_detail()
    tester.test_doctor_profile()
    tester.test_blog_posts()
    tester.test_services()
    tester.test_contact_form()
    tester.test_appointment_booking()
    
    print("\n👤 Running Patient Portal Tests...")
    if patient_login_success:
        tester.test_patient_appointments()
        tester.test_patient_prescriptions()
        tester.test_patient_reports()
    
    print("\n👩‍💼 Running Admin Tests...")
    if admin_login_success:
        tester.test_admin_stats()
        tester.test_admin_patients_list()
        created_post_id = tester.test_blog_post_creation()
        if created_post_id:
            tester.test_blog_post_deletion(created_post_id)
    
    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            print(f"   - {failed}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())