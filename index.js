require('dotenv').config();
const express    = require('express');
const path       = require('path');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const ejsMate    = require('ejs-mate');

// Models
const User               = require('./models/User');
const Job                = require('./models/Job');
const Application        = require('./models/Application');
const CounsellingSession = require('./models/CounsellingSession');
const Mentorship         = require('./models/mentorship');
const Feedback           = require('./models/feedback');

// Middleware
const { isLoggedIn, isAdmin, isEmployer } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    //seedAdmin();  seed sample jobs if DB is empty
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── App setup ────────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));
app.engine('ejs', ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Sessions ─────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongoUrl: MONGO_URI }),
  cookie: { 
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Prevents JavaScript from reading the cookie (Stops XSS attacks)
      secure: process.env.NODE_ENV === 'production' // Only requires HTTPS if deployed live
  }
}));

// Make currentUser available in all views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      res.locals.currentUser = await User.findById(req.session.userId);
    } catch {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// ─── Page Routes ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('includes/home'));
app.get('/signup', (req, res) => res.render('users/signup'));
app.get('/login',  (req, res) => res.render('users/login'));

app.get('/jobs', async (req, res) => {
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
  res.render('jobs/listing', { jobs });
});

// ─── Public Static Pages ──────────────────────────────────────────────────────
app.get('/counselling', (req, res) => res.render('counselling'));
app.get('/resources',   (req, res) => res.render('resources'));
app.get('/schemes',     (req, res) => res.render('schemes'));
app.get('/contact',     (req, res) => res.render('contact'));

app.get('/student/dashboard',   isLoggedIn, (req, res) => res.render('student/dashboard'));
app.get('/student/profile',     isLoggedIn, (req, res) => res.render('student/profile'));
app.get('/student/job_search',  isLoggedIn, (req, res) => res.render('student/job_search'));
app.get('/student/app_status',  isLoggedIn, (req, res) => res.render('student/app_status'));
app.get('/student/counselling', isLoggedIn, (req, res) => res.render('student/counselling'));
app.get('/student/mentorship',  isLoggedIn, (req, res) => res.render('student/mentorship'));
app.get('/student/feedback',    isLoggedIn, (req, res) => res.render('student/feedback'));

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/signup', async (req, res) => {
  try {
    const { role, fullName, email, password, mobile, dob, gender, category,
            aadhar, state, district, address, qualification, skills,
            experience, jobType, sector } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('users/signup', { error: 'Email already registered. Please login.' });
    }

    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Security: Ensure they can only sign up as worker or employer (no secret admin signups!)
    const assignedRole = (role === 'employer') ? 'employer' : 'worker';

    const user = new User({
      role: assignedRole,
      fullName, email, password, mobile, dob, gender, category,
      aadhar, state, district, address, qualification,
      skills: skillsArray, experience, jobType, sector
    });

    await user.save();
    
    // Set the session
    req.session.userId = user._id;
    
    // CRITICAL FIX: Force the session to save to the database BEFORE redirecting
    req.session.save((err) => {
        if (err) {
            console.error("Session save error during signup:", err);
            return res.render('users/signup', { error: 'Account created, but automatic login failed. Please log in manually.' });
        }
        
        // Redirect them to the correct page based on their role
        if (assignedRole === 'employer') {
            return res.redirect('/employer/dashboard');
        } else {
            return res.redirect('/student/dashboard');
        }
    });

  } catch (err) {
    console.error(err);
    res.render('users/signup', { error: 'Something went wrong. Please try again.' });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('users/login', { error: 'Invalid email or password.' });
    }

    // Set the session
    req.session.userId = user._id;
    
    // CRITICAL FIX: Force the session to save to the database BEFORE redirecting
    req.session.save((err) => {
        if (err) {
            console.error("Session save error:", err);
            return res.render('users/login', { error: 'Login error. Please try again.' });
        }
        
        // Smart Role-Based Redirect
        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else if (user.role === 'employer') {
            return res.redirect('/employer/dashboard');
        } else {
            return res.redirect('/student/dashboard');
        }
    });
    
  } catch (err) {
    console.error(err);
    res.render('users/login', { error: 'Something went wrong. Please try again.' });
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ─── API: User ─────────────────────────────────────────────────────────────────
app.get('/api/user/me', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/user/me', isLoggedIn, async (req, res) => {
  try {
    const allowed = ['fullName', 'mobile', 'dob', 'gender', 'category',
                     'state', 'district', 'address', 'qualification',
                     'skills', 'experience', 'jobType', 'sector'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(
      req.session.userId, updates, { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── API: Jobs & Applications ─────────────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const { sector, location, jobType, q } = req.query;
    const filter = { isActive: true };

    if (sector)   filter.sector   = new RegExp(sector, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (jobType)  filter.jobType  = new RegExp(jobType, 'i');
    if (q)        filter.$or = [
      { title: new RegExp(q, 'i') },
      { company: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') }
    ];

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, jobs });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/apply', isLoggedIn, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: 'Job ID required' });

    const existing = await Application.findOne({ job: jobId, applicant: req.session.userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    const application = new Application({ job: jobId, applicant: req.session.userId });
    await application.save();
    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// Note: For hackathon demo purposes, this is accessible to any logged in user.
// In real life, you would add an isAdmin middleware check here.
app.get('/admin', isLoggedIn, isAdmin, async (req, res) => {
    // Fetch jobs that are pending approval
    const pendingJobs = await Job.find({ isActive: false }).sort({ createdAt: -1 });
    res.render('admin', { pendingJobs });
});

app.post('/api/admin/approve-job/:id', isLoggedIn, isAdmin, async (req, res) => {
    try {
        await Job.findByIdAndUpdate(req.params.id, { isActive: true });
        res.json({ success: true, message: 'Job approved successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.delete('/api/admin/reject-job/:id', isLoggedIn, isAdmin, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job rejected and removed.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/applications/me', isLoggedIn, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.session.userId })
      .populate('job')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── API: Counselling ─────────────────────────────────────────────────────────
app.post('/api/counselling/book', isLoggedIn, async (req, res) => {
    try {
        const { counsellorName, type, date, timeSlot } = req.body;
        const session = new CounsellingSession({
            workerId: req.session.userId, // Updated
            counsellorName,
            type,
            date,
            timeSlot
        });
        await session.save();
        res.status(201).json({ success: true, message: 'Session booked successfully!', session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/counselling/my-sessions', isLoggedIn, async (req, res) => {
    try {
        const sessions = await CounsellingSession.find({ workerId: req.session.userId }); // Updated
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── API: Mentorship ──────────────────────────────────────────────────────────
app.post('/api/mentorship/enroll', isLoggedIn, async (req, res) => {
    try {
        const { mentorName, domain } = req.body;
        const program = new Mentorship({
            workerId: req.session.userId, // Updated
            mentorName,
            domain
        });
        await program.save();
        res.status(201).json({ success: true, message: 'Enrolled in mentorship program!', program });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/mentorship/my-programs', isLoggedIn, async (req, res) => {
    try {
        const programs = await Mentorship.find({ workerId: req.session.userId }); // Updated
        res.json(programs);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── API: Feedback ────────────────────────────────────────────────────────────
app.post('/api/feedback/submit', isLoggedIn, async (req, res) => {
    try {
        const { category, rating, comments } = req.body;
        const entry = new Feedback({
            userId: req.session.userId, // Fixed to match your auth flow
            category,
            rating,
            comments
        });
        await entry.save();
        res.status(201).json({ success: true, message: 'Feedback submitted!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/employer/dashboard', isLoggedIn, isEmployer, async (req, res) => {
    try {
        // 1. Fetch all jobs created by this specific employer
        // (Assuming your Job model has a 'createdBy' or 'employerId' field linking to the User)
        const myJobs = await Job.find({ createdBy: req.session.userId }).sort({ createdAt: -1 });

        // 2. Calculate Analytics
        const stats = {
            totalPosted: myJobs.length,
            activeLive: myJobs.filter(job => job.isActive === true).length,
            pendingApproval: myJobs.filter(job => job.isActive === false).length,
            // If your Job model tracks an array of applications, you can aggregate them here:
            // totalApplications: myJobs.reduce((sum, job) => sum + job.applications.length, 0)
        };

        // 3. Render the new dashboard view with the data
        res.render('employer/dashboard', { jobs: myJobs, stats });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading employer dashboard");
    }
});

// ─── API: Employer Job Posting ────────────────────────────────────────────────
// ─── API: Employer Job Posting & Dashboard ────────────────────────────────────

// 1. Render the Job Posting Form
app.get('/employer/post-job', isLoggedIn, isEmployer, (req, res) => {
    res.render('employer'); // Renders your existing job posting form
});

// 2. Handle the Job Submission
app.post('/api/employer/post-job', isLoggedIn, isEmployer, async (req, res) => {
    try {
        const { title, company, location, salary, jobType, description, requirements, sector, vacancies } = req.body;
        
        const newJob = new Job({
            title,
            company,
            location,
            salary,
            jobType,
            sector,
            vacancies,
            description,
            requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
            // SECURITY INTEGRATION:
            createdBy: req.session.userId, // Links this job to the logged-in employer
            isActive: false // Forces the job into the Admin's moderation queue
        });
        
        await newJob.save();
        
        // Redirect back to the analytics dashboard instead of sending raw JSON
        res.redirect('/employer/dashboard'); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// ─── Seed Jobs ────────────────────────────────────────────────────────────────
async function seedJobs() {
  const count = await Job.countDocuments();
  if (count > 0) return;

  const sampleJobs = [
    { title: 'Field Technician', company: 'Rajasthan Solar Ltd.', location: 'Jodhpur', district: 'Jodhpur', sector: 'Energy', jobType: 'Full-time', salary: '₹18,000/month', description: 'Install and maintain solar panels across Rajasthan.', vacancies: 10 },
    { title: 'Data Entry Operator', company: 'e-Mitra Kiosk', location: 'Jaipur', district: 'Jaipur', sector: 'IT', jobType: 'Part-time', salary: '₹12,000/month', description: 'Data entry and citizen service handling at e-Mitra kiosks.', vacancies: 25 },
    { title: 'Construction Supervisor', company: 'RSMML', location: 'Udaipur', district: 'Udaipur', sector: 'Construction', jobType: 'Contract', salary: '₹22,000/month', description: 'Supervise construction of government infrastructure projects.', vacancies: 5 },
    { title: 'Textile Machine Operator', company: 'Rajasthan Handloom Corp.', location: 'Bhilwara', district: 'Bhilwara', sector: 'Textile', jobType: 'Full-time', salary: '₹14,000/month', description: 'Operate weaving machines in textile factory.', vacancies: 30 },
    { title: 'Agri Field Officer', company: 'Rajasthan Agro Industries', location: 'Kota', district: 'Kota', sector: 'Agriculture', jobType: 'Full-time', salary: '₹16,000/month', description: 'Assist farmers with modern agricultural techniques and crop planning.', vacancies: 15 },
    { title: 'Junior Software Developer', company: 'RISL (IT Dept. Rajasthan)', location: 'Jaipur', district: 'Jaipur', sector: 'IT', jobType: 'Full-time', salary: '₹28,000/month', description: 'Develop and maintain government web portals using Node.js and React.', requirements: ['Node.js', 'JavaScript', 'MongoDB'], vacancies: 8 },
    { title: 'Health Worker (ASHA)', company: 'NHM Rajasthan', location: 'Ajmer', district: 'Ajmer', sector: 'Healthcare', jobType: 'Part-time', salary: '₹10,000/month', description: 'Community health outreach and awareness programs.', vacancies: 50 },
    { title: 'Driver (Heavy Vehicle)', company: 'Rajasthan State Transport', location: 'Bikaner', district: 'Bikaner', sector: 'Transport', jobType: 'Full-time', salary: '₹20,000/month', description: 'Drive heavy vehicles for state transport corporation.', requirements: ['Heavy vehicle license'], vacancies: 20 },
  ];

  await Job.insertMany(sampleJobs);
  console.log('✅ Sample jobs seeded');
}

async function seedAdmin() {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        const adminUser = new User({
            fullName: 'System Admin',
            email: process.env.ADMIN_EMAIL,       // Pulls from .env
            password: process.env.ADMIN_PASSWORD, // Pulls from .env
            role: 'admin'
        });
        await adminUser.save();
        console.log(`👑 Default Admin created: ${process.env.ADMIN_EMAIL}`);
    }
}


// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));