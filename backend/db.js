const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    // role: { type: String, enum: ['startup', 'incubator'], required: true },
  
    industry: { type: String },
    fundingStage: { type: String, enum: ['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] },
    revenue: { type: Number },
    teamSize: { type: Number },
  
    isApproved: { type: Boolean, default: false },
  
    createdAt: { type: Date, default: Date.now }
  });
  

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    
    // ✅ NEW FIELDS FOR MATCHING:
    userType: {
      type: String,
      enum: ['admin', 'incubator'],
      default: 'admin'
    },
    specialization: {
      type: String,
      enum: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'EdTech', 'ClimaTech', 'AgriTech', 'AI/ML', 'Blockchain'],
      sparse: true
    },
    location: String,
    website: String,
    
    createdAt: { type: Date, default: Date.now }
  });


  const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

  const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    // date: { type: Date, required: true },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
  });

  const ScheduleSchema = new mongoose.Schema({
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  });



const userModel = mongoose.model('users', userSchema);
const adminModel = mongoose.model('admins', adminSchema);
const announcementModel = mongoose.model('announcements', AnnouncementSchema);
const eventModel = mongoose.model('events', EventSchema);
const scheduleModel = mongoose.model('schedules', ScheduleSchema);

module.exports = {
    userModel,
    adminModel,
    announcementModel,
    eventModel,
    scheduleModel
}