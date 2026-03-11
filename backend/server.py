from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-key')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

# ── Models ──
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str = ""
    role: str = "patient"

class UserLogin(BaseModel):
    email: str
    password: str

class AppointmentCreate(BaseModel):
    doctor_id: str
    department_id: str
    date: str
    time: str
    patient_name: str
    patient_email: str
    patient_phone: str
    notes: str = ""

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    subject: str
    message: str

class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str = ""
    category: str = ""
    image_url: str = ""

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

# ── Auth Helpers ──
def hash_pw(password):
    return pwd_context.hash(password)

def verify_pw(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(user_id, role):
    return jwt.encode({"sub": user_id, "role": role}, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(auth[7:], JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")

async def require_admin(request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin"]:
        raise HTTPException(403, "Admin access required")
    return user

# ── Auth Routes ──
@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "password_hash": hash_pw(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "role": "patient",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["role"])
    safe = {k: v for k, v in user.items() if k not in ["password_hash", "_id"]}
    return {"token": token, "user": safe}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_pw(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["role"])
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": safe}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {k: v for k, v in user.items() if k != "password_hash"}

# ── Departments ──
@api_router.get("/departments")
async def get_departments():
    return await db.departments.find({}, {"_id": 0}).to_list(100)

@api_router.get("/departments/{slug}")
async def get_department(slug: str):
    dep = await db.departments.find_one({"slug": slug}, {"_id": 0})
    if not dep:
        raise HTTPException(404, "Department not found")
    doctors = await db.doctors.find({"department_id": dep["id"]}, {"_id": 0}).to_list(100)
    dep["doctors"] = doctors
    return dep

# ── Doctors ──
@api_router.get("/doctors")
async def get_doctors(department: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if department:
        query["department_id"] = department
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"specialization": {"$regex": search, "$options": "i"}}
        ]
    return await db.doctors.find(query, {"_id": 0}).to_list(100)

@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    doc = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Doctor not found")
    return doc

# ── Appointments ──
@api_router.post("/appointments")
async def create_appointment(data: AppointmentCreate, request: Request):
    user = None
    try:
        user = await get_current_user(request)
    except:
        pass
    appt = {
        "id": str(uuid.uuid4()),
        "patient_id": user["id"] if user else None,
        "patient_name": data.patient_name,
        "patient_email": data.patient_email,
        "patient_phone": data.patient_phone,
        "doctor_id": data.doctor_id,
        "department_id": data.department_id,
        "date": data.date,
        "time": data.time,
        "status": "pending",
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(appt)
    return {k: v for k, v in appt.items() if k != "_id"}

@api_router.get("/appointments")
async def get_appointments(request: Request):
    user = await get_current_user(request)
    if user["role"] == "admin":
        return await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    elif user["role"] == "doctor":
        doctor = await db.doctors.find_one({"user_id": user["id"]}, {"_id": 0})
        did = doctor["id"] if doctor else ""
        return await db.appointments.find({"doctor_id": did}, {"_id": 0}).to_list(1000)
    else:
        return await db.appointments.find({"patient_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api_router.patch("/appointments/{appt_id}")
async def update_appointment(appt_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "doctor"]:
        raise HTTPException(403, "Not authorized")
    body = await request.json()
    update = {k: v for k, v in body.items() if k in {"status", "notes", "date", "time"}}
    if not update:
        raise HTTPException(400, "No valid fields")
    await db.appointments.update_one({"id": appt_id}, {"$set": update})
    return await db.appointments.find_one({"id": appt_id}, {"_id": 0})

# ── Blog ──
@api_router.get("/blog")
async def get_blog_posts(category: Optional[str] = None, search: Optional[str] = None):
    query = {"published": True}
    if category and category != "All":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    return await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Post not found")
    return post

@api_router.post("/blog")
async def create_blog_post(data: BlogPostCreate, request: Request):
    await require_admin(request)
    import re
    slug = re.sub(r'[^a-z0-9]+', '-', data.title.lower()).strip('-')[:60]
    existing = await db.blog_posts.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    post = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "slug": slug,
        "content": data.content,
        "excerpt": data.excerpt or data.content[:200],
        "category": data.category or "General",
        "author": "Admin",
        "image_url": data.image_url or "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.blog_posts.insert_one(post)
    return {k: v for k, v in post.items() if k != "_id"}

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, request: Request):
    await require_admin(request)
    await db.blog_posts.delete_one({"id": post_id})
    return {"message": "Deleted"}

# ── Services ──
@api_router.get("/services")
async def get_services():
    return await db.services.find({}, {"_id": 0}).to_list(100)

# ── Contact ──
@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    msg = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "subject": data.subject,
        "message": data.message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Message sent successfully", "id": msg["id"]}

# ── Patient Portal ──
@api_router.get("/prescriptions")
async def get_prescriptions(request: Request):
    user = await get_current_user(request)
    return await db.prescriptions.find({"patient_id": user["id"]}, {"_id": 0}).to_list(100)

@api_router.get("/reports")
async def get_reports(request: Request):
    user = await get_current_user(request)
    return await db.medical_reports.find({"patient_id": user["id"]}, {"_id": 0}).to_list(100)

@api_router.get("/messages")
async def get_messages(request: Request):
    user = await get_current_user(request)
    return await db.messages.find(
        {"$or": [{"sender_id": user["id"]}, {"receiver_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)

@api_router.post("/messages")
async def send_message(data: MessageCreate, request: Request):
    user = await get_current_user(request)
    msg = {
        "id": str(uuid.uuid4()),
        "sender_id": user["id"],
        "sender_name": user["full_name"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg)
    return {k: v for k, v in msg.items() if k != "_id"}

# ── Admin ──
@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_admin(request)
    return {
        "total_patients": await db.users.count_documents({"role": "patient"}),
        "total_doctors": await db.doctors.count_documents({}),
        "total_appointments": await db.appointments.count_documents({}),
        "pending_appointments": await db.appointments.count_documents({"status": "pending"}),
        "total_departments": await db.departments.count_documents({}),
        "total_blog_posts": await db.blog_posts.count_documents({}),
        "total_messages": await db.contact_messages.count_documents({})
    }

@api_router.get("/admin/patients")
async def get_patients(request: Request):
    await require_admin(request)
    return await db.users.find({"role": "patient"}, {"_id": 0, "password_hash": 0}).to_list(1000)

@api_router.get("/admin/contact-messages")
async def get_contact_messages(request: Request):
    await require_admin(request)
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.get("/admin/appointments")
async def get_all_appointments(request: Request):
    await require_admin(request)
    return await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

# ── Seed Data ──
async def seed_data():
    if await db.departments.count_documents({}) > 0:
        logger.info("Database already seeded")
        return
    logger.info("Seeding database...")

    # Admin user
    admin_id = str(uuid.uuid4())
    await db.users.insert_one({
        "id": admin_id, "email": "admin@luminamedical.com",
        "password_hash": hash_pw("admin123"), "full_name": "Dr. Sarah Mitchell",
        "phone": "+1-555-0100", "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Demo patient
    patient_id = str(uuid.uuid4())
    await db.users.insert_one({
        "id": patient_id, "email": "patient@example.com",
        "password_hash": hash_pw("patient123"), "full_name": "John Anderson",
        "phone": "+1-555-0200", "role": "patient",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Departments
    dept_data = [
        ("Cardiology", "cardiology", "Comprehensive heart and cardiovascular care using state-of-the-art technology. Our team of expert cardiologists provides preventive cardiology, interventional procedures, and cardiac rehabilitation.", "Heart", ["Cardiac Consultation", "Echocardiography", "Angioplasty", "Heart Surgery", "Cardiac Rehab", "Pacemaker Implantation"], ["3D Echocardiography Machine", "Cardiac Catheterization Lab", "Heart-Lung Machine", "Holter Monitor"]),
        ("Neurology", "neurology", "Expert diagnosis and treatment of neurological disorders including stroke, epilepsy, and neurodegenerative diseases. Advanced brain mapping and minimally invasive procedures.", "Brain", ["Neurological Consultation", "EEG", "EMG", "Stroke Treatment", "Epilepsy Management", "Brain Mapping"], ["MRI 3T Scanner", "EEG Machine", "Neuro Navigation System", "Deep Brain Stimulator"]),
        ("Orthopedics", "orthopedics", "Complete musculoskeletal care from sports injuries to joint replacements. Our orthopedic specialists use robotic-assisted surgery for precise outcomes.", "Bone", ["Joint Replacement", "Spine Surgery", "Sports Medicine", "Fracture Care", "Arthroscopy", "Physical Therapy"], ["Robotic Surgery System", "C-Arm Fluoroscopy", "Arthroscope", "Bone Densitometer"]),
        ("Pediatrics", "pediatrics", "Dedicated child healthcare from newborn care to adolescent medicine. Our child-friendly environment ensures comfort for young patients and their families.", "Baby", ["Well-Child Visits", "Vaccinations", "Developmental Assessment", "Pediatric Surgery", "NICU", "Adolescent Care"], ["Infant Ventilator", "Phototherapy Unit", "Pediatric ICU Equipment", "Growth Monitoring System"]),
        ("Dermatology", "dermatology", "Advanced skin care and treatment for all dermatological conditions. From cosmetic procedures to complex skin diseases, our dermatologists provide expert care.", "Scan", ["Skin Consultation", "Mole Removal", "Laser Treatment", "Acne Treatment", "Psoriasis Care", "Skin Biopsy"], ["Dermatoscope", "Laser Therapy Machine", "Cryotherapy Unit", "UV Phototherapy Cabinet"]),
        ("Gynecology", "gynecology", "Comprehensive women's health services from routine care to complex procedures. Our gynecologists specialize in minimally invasive surgery and fertility treatments.", "Female", ["Prenatal Care", "Gynecological Surgery", "Fertility Treatment", "Menopause Management", "Cancer Screening", "Laparoscopy"], ["3D/4D Ultrasound", "Colposcope", "Fetal Monitor", "Laparoscopic Surgery Tower"]),
        ("Emergency Care", "emergency-care", "24/7 emergency medical services with rapid response team and fully equipped trauma center. Our emergency physicians handle life-threatening conditions with precision.", "Ambulance", ["Trauma Care", "Cardiac Emergency", "Stroke Response", "Pediatric Emergency", "Poison Control", "Critical Care"], ["Defibrillator", "Ventilator", "Trauma Bay", "Emergency CT Scanner"]),
        ("Radiology", "radiology", "Advanced diagnostic imaging services using the latest technology. Our radiologists provide accurate diagnoses with minimal radiation exposure.", "Xray", ["X-Ray", "CT Scan", "MRI", "Ultrasound", "Mammography", "PET Scan"], ["128-Slice CT Scanner", "3T MRI Machine", "Digital X-Ray", "PET-CT Scanner"]),
        ("General Medicine", "general-medicine", "Primary healthcare and internal medicine for adults. Our general physicians coordinate comprehensive care and manage chronic conditions effectively.", "Stethoscope", ["General Checkup", "Chronic Disease Management", "Health Screening", "Diabetes Care", "Hypertension Management", "Infectious Disease"], ["ECG Machine", "Spirometer", "Blood Pressure Monitor", "Point-of-Care Testing"])
    ]

    departments = []
    dept_ids = {}
    for name, slug, desc, icon, services, equipment in dept_data:
        did = str(uuid.uuid4())
        dept_ids[slug] = did
        departments.append({
            "id": did, "name": name, "slug": slug, "description": desc,
            "icon": icon, "services": services, "equipment": equipment,
            "image_url": f"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
        })
    await db.departments.insert_many(departments)

    # Doctors
    doctor_images = [
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
        "https://images.unsplash.com/photo-1594824476967-48c8b964d8ba?w=400",
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
        "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400",
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
        "https://images.unsplash.com/photo-1594824476967-48c8b964d8ba?w=400",
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
        "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400",
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    ]

    doc_data = [
        ("Dr. Robert Chen", "cardiology", "Interventional Cardiology", 18, ["MD - Harvard Medical School", "Fellowship - Mayo Clinic"], ["Board Certified Cardiologist", "FACC"], ["Mon","Tue","Wed","Thu","Fri"], 4.9, "Leading interventional cardiologist with expertise in complex coronary procedures."),
        ("Dr. Maria Santos", "cardiology", "Cardiac Electrophysiology", 12, ["MD - Stanford University", "Residency - Johns Hopkins"], ["Board Certified - Cardiac EP", "FHRS"], ["Mon","Wed","Fri"], 4.8, "Specialist in heart rhythm disorders and pacemaker implantation."),
        ("Dr. James Wilson", "neurology", "Stroke & Neurovascular", 20, ["MD - Yale School of Medicine", "Fellowship - Cleveland Clinic"], ["Board Certified Neurologist", "Stroke Specialist"], ["Mon","Tue","Thu","Fri"], 4.9, "Pioneer in stroke intervention and neurovascular treatment."),
        ("Dr. Priya Sharma", "neurology", "Epilepsy & Neurophysiology", 14, ["MD - AIIMS New Delhi", "PhD - Oxford University"], ["Epilepsy Specialist", "Clinical Neurophysiology"], ["Tue","Wed","Thu","Sat"], 4.7, "Expert in epilepsy management and EEG interpretation."),
        ("Dr. Michael Torres", "orthopedics", "Joint Replacement Surgery", 22, ["MD - Columbia University", "Fellowship - HSS New York"], ["Board Certified Orthopedic Surgeon", "FAAOS"], ["Mon","Tue","Wed","Thu"], 4.9, "Over 3,000 successful joint replacement surgeries performed."),
        ("Dr. Sarah Kim", "orthopedics", "Sports Medicine", 10, ["MD - UCLA Medical School", "Fellowship - Andrews Institute"], ["Sports Medicine Specialist", "Team Physician"], ["Mon","Wed","Thu","Fri","Sat"], 4.8, "Sports medicine specialist treating professional athletes."),
        ("Dr. Emily Watson", "pediatrics", "General Pediatrics", 15, ["MD - Boston University", "Residency - Children's Hospital"], ["Board Certified Pediatrician", "AAP Fellow"], ["Mon","Tue","Wed","Thu","Fri"], 4.9, "Compassionate pediatrician dedicated to children's wellness."),
        ("Dr. Ahmad Hassan", "pediatrics", "Pediatric Surgery", 16, ["MD - Johns Hopkins", "Fellowship - Great Ormond Street"], ["Pediatric Surgeon", "Neonatal Specialist"], ["Mon","Tue","Thu"], 4.8, "Expert in minimally invasive pediatric surgical procedures."),
        ("Dr. Lisa Park", "dermatology", "Cosmetic Dermatology", 11, ["MD - NYU School of Medicine", "Fellowship - Mass General"], ["Board Certified Dermatologist", "Laser Specialist"], ["Mon","Tue","Wed","Fri"], 4.7, "Specialist in cosmetic procedures and laser treatments."),
        ("Dr. David Brown", "dermatology", "Clinical Dermatology", 19, ["MD - University of Pennsylvania", "Residency - Mayo Clinic"], ["Dermatopathologist", "Skin Cancer Specialist"], ["Tue","Wed","Thu","Sat"], 4.8, "Expert in complex skin conditions and skin cancer treatment."),
        ("Dr. Rachel Green", "gynecology", "Obstetrics & Gynecology", 13, ["MD - Duke University", "Residency - Brigham and Women's"], ["Board Certified OB/GYN", "Fertility Specialist"], ["Mon","Tue","Wed","Thu","Fri"], 4.9, "Comprehensive women's health specialist with fertility expertise."),
        ("Dr. Nina Patel", "gynecology", "Gynecologic Oncology", 17, ["MD - UCSF Medical School", "Fellowship - Memorial Sloan Kettering"], ["Gynecologic Oncologist", "Robotic Surgery"], ["Mon","Wed","Thu"], 4.8, "Leading gynecologic oncologist specializing in minimally invasive surgery."),
        ("Dr. John Mitchell", "emergency-care", "Emergency Medicine", 14, ["MD - University of Michigan", "Residency - Shock Trauma Center"], ["Board Certified EM Physician", "ATLS Instructor"], ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], 4.7, "Emergency medicine specialist with trauma center experience."),
        ("Dr. Anna Rodriguez", "emergency-care", "Critical Care Medicine", 12, ["MD - Baylor College of Medicine", "Fellowship - Massachusetts General"], ["Critical Care Specialist", "ACLS Instructor"], ["Mon","Wed","Fri","Sat","Sun"], 4.8, "Critical care expert specializing in life-threatening emergencies."),
        ("Dr. Thomas Lee", "radiology", "Diagnostic Radiology", 20, ["MD - Washington University", "Fellowship - UCSF"], ["Board Certified Radiologist", "Neuroradiology"], ["Mon","Tue","Wed","Thu","Fri"], 4.8, "Expert in advanced diagnostic imaging and interventional radiology."),
        ("Dr. Karen White", "radiology", "Interventional Radiology", 15, ["MD - Emory University", "Fellowship - Johns Hopkins"], ["Interventional Radiologist", "Vascular Specialist"], ["Mon","Tue","Thu","Fri"], 4.7, "Minimally invasive image-guided procedure specialist."),
        ("Dr. Steven Clark", "general-medicine", "Internal Medicine", 25, ["MD - University of Chicago", "Residency - Mayo Clinic"], ["Board Certified Internist", "Geriatric Medicine"], ["Mon","Tue","Wed","Thu","Fri"], 4.9, "Experienced internist providing comprehensive primary care."),
        ("Dr. Jennifer Adams", "general-medicine", "Family Medicine", 11, ["MD - Georgetown University", "Residency - UCSF"], ["Board Certified Family Medicine", "Preventive Medicine"], ["Mon","Tue","Wed","Fri","Sat"], 4.8, "Family medicine physician focused on preventive healthcare."),
    ]

    doctors = []
    for i, (name, dept_slug, spec, exp, edu, certs, days, rating, bio) in enumerate(doc_data):
        doctors.append({
            "id": str(uuid.uuid4()),
            "name": name, "department_id": dept_ids[dept_slug],
            "department_name": dept_slug.replace("-", " ").title(),
            "specialization": spec, "experience_years": exp,
            "education": edu, "certifications": certs,
            "available_days": days, "rating": rating,
            "image_url": doctor_images[i % len(doctor_images)],
            "bio": bio, "consultation_fee": 150 + (i * 25)
        })
    await db.doctors.insert_many(doctors)

    # Blog posts
    blog_data = [
        ("Understanding Heart Disease: Prevention and Treatment", "heart-health", "Heart disease remains the leading cause of death globally. Learn about risk factors, prevention strategies, and modern treatment options available at our cardiac center. Regular exercise, a balanced diet, and routine check-ups are your best defense against cardiovascular disease. Our cardiology team recommends annual heart screenings for adults over 40.\n\nKey risk factors include high blood pressure, high cholesterol, diabetes, obesity, and smoking. By managing these factors through lifestyle changes and medication when necessary, you can significantly reduce your risk of heart disease.\n\nOur cardiology department offers comprehensive cardiac assessments including ECG, echocardiography, stress tests, and advanced imaging. Early detection is crucial for effective treatment.", "Heart Health", "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800"),
        ("The Importance of Regular Health Checkups", "importance-regular-health-checkups", "Regular health checkups are essential for early detection of diseases and maintaining optimal health. Learn why you should schedule routine screenings and what tests are recommended for your age group.\n\nFor adults aged 18-39, annual checkups should include blood pressure measurement, cholesterol screening, diabetes screening, and BMI assessment. Those over 40 should add cardiac screening, cancer screenings, and bone density tests.\n\nPreventive care is more cost-effective and less stressful than treating advanced diseases. Our general medicine department offers comprehensive health screening packages tailored to your age and risk factors.", "Preventive Care", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"),
        ("Managing Diabetes: A Comprehensive Guide", "managing-diabetes-guide", "Diabetes affects millions worldwide. This comprehensive guide covers types of diabetes, symptoms, management strategies, and the latest treatment advances available at our medical center.\n\nType 1 diabetes requires insulin therapy, while Type 2 can often be managed through lifestyle modifications. Regular blood sugar monitoring, proper nutrition, exercise, and medication adherence are key components of effective diabetes management.\n\nOur endocrinology team provides personalized diabetes care plans, continuous glucose monitoring, and patient education programs to help you live well with diabetes.", "Disease Guide", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800"),
        ("Child Vaccination Schedule: What Parents Need to Know", "child-vaccination-schedule", "Keeping your child up-to-date with vaccinations is one of the most important things you can do as a parent. Learn about recommended vaccines, timing, and what to expect.\n\nVaccinations protect children from serious diseases including measles, polio, whooping cough, and meningitis. The CDC recommended schedule starts at birth and continues through adolescence.\n\nOur pediatrics department maintains a comfortable, child-friendly environment for vaccinations. We provide detailed guidance to parents about each vaccine, potential side effects, and the importance of completing the full immunization schedule.", "Pediatrics", "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800"),
        ("Mental Health Awareness: Breaking the Stigma", "mental-health-awareness", "Mental health is just as important as physical health. Learn about common mental health conditions, warning signs, and how to seek help in a supportive environment.\n\nDepression, anxiety, PTSD, and bipolar disorder are among the most common mental health conditions. Recognizing symptoms early and seeking professional help can lead to better outcomes.\n\nOur behavioral health team provides confidential counseling, psychiatric evaluation, and evidence-based treatments. We believe in a holistic approach that addresses both mental and physical well-being.", "Mental Health", "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800"),
        ("Advances in Robotic Surgery at Lumina Medical", "advances-robotic-surgery", "Robotic-assisted surgery represents a revolution in modern medicine. Discover how our surgical teams use cutting-edge robotic systems for more precise, less invasive procedures.\n\nBenefits of robotic surgery include smaller incisions, less pain, shorter hospital stays, and faster recovery times. Our surgeons have performed thousands of robotic procedures across multiple specialties.\n\nFrom joint replacements to cardiac procedures, robotic surgery at Lumina Medical Center ensures optimal outcomes with minimal complications. Our state-of-the-art surgical suites are equipped with the latest robotic systems.", "Technology", "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=800"),
    ]

    blog_posts = []
    for title, slug, content, category, img in blog_data:
        blog_posts.append({
            "id": str(uuid.uuid4()),
            "title": title, "slug": slug,
            "content": content, "excerpt": content[:180] + "...",
            "category": category, "author": "Lumina Medical Team",
            "image_url": img, "published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    await db.blog_posts.insert_many(blog_posts)

    # Services
    svc_data = [
        ("Diagnostic Tests", "Comprehensive lab testing and diagnostic services including blood work, imaging, and specialized tests for accurate diagnosis.", "TestTube", "diagnostic-tests"),
        ("Health Checkups", "Complete health screening packages tailored to your age, gender, and risk factors. Annual checkups for preventive care.", "ClipboardCheck", "health-checkups"),
        ("Surgery", "State-of-the-art surgical facilities with experienced surgeons performing minimally invasive and robotic-assisted procedures.", "Scissors", "surgery"),
        ("Vaccinations", "Complete immunization services for children and adults. Flu shots, travel vaccines, and routine immunizations.", "Syringe", "vaccinations"),
        ("Emergency Care", "24/7 emergency medical services with rapid response teams and fully equipped trauma center.", "Ambulance", "emergency-care"),
        ("Telemedicine", "Virtual consultations with our specialists from the comfort of your home. Secure video appointments available.", "Video", "telemedicine"),
        ("Physical Therapy", "Comprehensive rehabilitation services including post-surgical recovery, sports injury rehab, and chronic pain management.", "Activity", "physical-therapy"),
        ("Laboratory Services", "Full-service clinical laboratory with rapid turnaround times for blood tests, pathology, and microbiology.", "Microscope", "laboratory"),
    ]
    services = []
    for name, desc, icon, slug in svc_data:
        services.append({
            "id": str(uuid.uuid4()),
            "name": name, "description": desc, "icon": icon, "slug": slug
        })
    await db.services.insert_many(services)

    # Sample prescriptions for demo patient
    prescriptions = [
        {
            "id": str(uuid.uuid4()), "patient_id": patient_id,
            "doctor_name": "Dr. Steven Clark", "doctor_id": "",
            "medications": [
                {"name": "Lisinopril 10mg", "dosage": "Once daily", "duration": "30 days"},
                {"name": "Metformin 500mg", "dosage": "Twice daily with meals", "duration": "30 days"}
            ],
            "diagnosis": "Hypertension, Type 2 Diabetes",
            "date": "2025-12-15", "notes": "Follow up in 30 days. Monitor blood sugar levels."
        },
        {
            "id": str(uuid.uuid4()), "patient_id": patient_id,
            "doctor_name": "Dr. Robert Chen", "doctor_id": "",
            "medications": [
                {"name": "Atorvastatin 20mg", "dosage": "Once daily at bedtime", "duration": "90 days"},
                {"name": "Aspirin 81mg", "dosage": "Once daily", "duration": "Ongoing"}
            ],
            "diagnosis": "Hyperlipidemia, Cardiovascular risk reduction",
            "date": "2025-11-20", "notes": "Repeat lipid panel in 3 months."
        }
    ]
    await db.prescriptions.insert_many(prescriptions)

    # Sample medical reports
    reports = [
        {
            "id": str(uuid.uuid4()), "patient_id": patient_id,
            "title": "Complete Blood Count (CBC)", "type": "Lab Report",
            "date": "2025-12-10", "doctor_name": "Dr. Steven Clark",
            "summary": "All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 7,500/mcL, Platelets: 250,000/mcL."
        },
        {
            "id": str(uuid.uuid4()), "patient_id": patient_id,
            "title": "Chest X-Ray", "type": "Imaging Report",
            "date": "2025-11-28", "doctor_name": "Dr. Thomas Lee",
            "summary": "No acute cardiopulmonary findings. Heart size normal. Lungs clear bilaterally."
        },
        {
            "id": str(uuid.uuid4()), "patient_id": patient_id,
            "title": "Lipid Panel", "type": "Lab Report",
            "date": "2025-11-15", "doctor_name": "Dr. Robert Chen",
            "summary": "Total Cholesterol: 210 mg/dL (borderline high), LDL: 130 mg/dL, HDL: 55 mg/dL, Triglycerides: 125 mg/dL."
        }
    ]
    await db.medical_reports.insert_many(reports)

    logger.info("Database seeded successfully!")

# ── Startup / Shutdown ──
@app.on_event("startup")
async def startup():
    await seed_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ── Router & Middleware ──
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
