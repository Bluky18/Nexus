import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Download, 
  Folder, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  MapPin, 
  Tag, 
  Clock, 
  Lock,
  ChevronRight,
  Shield,
  Activity,
  User,
  Plus
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'academics' | 'peer-help' | 'campus-life'>('academics');
  const [scrolled, setScrolled] = useState(false);
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaSuccess, setCtaSuccess] = useState(false);

  // Monitor scroll for header background blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ctaEmail.trim()) {
      setCtaSuccess(true);
      setTimeout(() => {
        onGetStarted();
      }, 1500);
    }
  };

  const segmentContent = {
    academics: {
      title: 'A central repository for collective wisdom.',
      desc: 'No more searching through disorganized chat groups, old cloud drives, or expired links. Access crowd-sourced, peer-reviewed notes, exam guides, and lab reports sorted neatly by subject, semester, and branch. Secure, fast, and available whenever you need it.',
      features: [
        'Organized by Branch & Semester',
        'Direct PDF previews and secure fast downloads',
        'Peer ratings and direct student feedback loops',
        'Verified by study groups'
      ]
    },
    'peer-help': {
      title: 'Monetize your skills, or delegate tasks easily.',
      desc: 'Need a lab report styled or a Python CSV parser coded? Post a micro-commission with a transparent budget. Have spare time and strong technical skills? Complete open campus commissions to build your rating and earn real pocket money securely.',
      features: [
        'Secure campus-restricted marketplace',
        'Transparent budget badges (INR/credits)',
        'Built-in peer satisfaction rating tracking',
        'Direct client-to-provider routing'
      ]
    },
    'campus-life': {
      title: 'Resolve doubts anonymously and secure lost items.',
      desc: 'Ask complex engineering or academic questions with 100% complete anonymity. Plus, report or locate lost campus items directly through a responsive lost-and-found board that keeps tracking items active and simple.',
      features: [
        'Strictly anonymous academic doubt forums',
        'Real-time verification badges for accurate answers',
        'Active library & classroom lost item matching',
        'Simple automatic database clean-up protocols'
      ]
    }
  };

  return (
    <div id="nexus-landing-container" className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white transition-colors duration-200">
      
      {/* 1. THE NAV BAR (Minimalist Header) */}
      <header 
        id="landing-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-[#FAF9F5]/85 backdrop-blur-md border-[#1A1A1A]/10 py-4 shadow-xs' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black tracking-widest text-[#1A1A1A] cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              NEXUS
            </span>
            <span className="px-2 py-0.5 bg-[#1A1A1A] text-[#FAF9F5] text-[9px] font-bold tracking-widest uppercase rounded">
              CAMPUS
            </span>
          </div>

          <nav id="landing-nav-links" className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-xs font-bold tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] uppercase transition-colors">Features</a>
            <a href="#how-it-feels" className="text-xs font-bold tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] uppercase transition-colors">How it works</a>
            <a href="#stats" className="text-xs font-bold tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] uppercase transition-colors">Stats</a>
            <a href="#cta" className="text-xs font-bold tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] uppercase transition-colors">Claim Profile</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              id="landing-nav-get-started"
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#FAF9F5] text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border border-[#1A1A1A] hover:invert"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="landing-hero" className="relative pt-36 md:pt-48 pb-24 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column - 60% */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A]/5 rounded-full border border-[#1A1A1A]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3484F0] animate-ping" />
              <span className="text-[10px] uppercase tracking-widest font-black text-[#1A1A1A]/70">Nirmala College Hub</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1A1A1A] leading-[1.05] tracking-tight font-sans">
              Your Campus Life.<br />
              Fully Organized,<br />
              Completely Connected.
            </h1>

            <p className="text-md md:text-lg text-[#1A1A1A]/70 max-w-xl font-normal leading-relaxed">
              Nexus is a decentralized, student-driven academic and career operations network. Access shared lecture notes, earn money completing small campus commissions, clear academic doubts anonymously, and coordinate active lost-and-found boards instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                id="hero-cta-join"
                onClick={onGetStarted}
                className="group px-8 py-4 bg-[#1A1A1A] text-[#FAF9F5] font-black text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 border border-transparent"
              >
                <span>Join Your Campus Network</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A]/5 font-black text-xs uppercase tracking-wider transition-all cursor-pointer text-center border border-[#1A1A1A]"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right Mockup Column - 40% */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#3484F0]/5 blur-3xl rounded-full" />
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative bg-[#FFFFFF] border-2 border-[#1A1A1A] rounded-none p-5 shadow-[8px_8px_0px_0px_#1A1A1A]"
            >
              {/* Fake Browser Window Header */}
              <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#1A1A1A]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#1A1A1A]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1A1A1A]" />
                </div>
                <div className="text-[10px] font-mono text-[#1A1A1A]/50 bg-[#FAF9F5] border border-[#1A1A1A]/20 px-3 py-0.5 rounded">
                  nexus-student-console.app
                </div>
                <div className="w-6" />
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4">
                {/* Active user preview */}
                <div className="flex items-center gap-3 bg-[#FAF9F5] p-3 border border-[#1A1A1A]/10">
                  <div className="w-8 h-8 bg-[#3484F0] border border-[#1A1A1A] flex items-center justify-center text-white font-mono text-xs font-bold">
                    HK
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#1A1A1A] truncate">Harshit Kataram</p>
                    <p className="text-[9px] font-mono text-[#1A1A1A]/60">Computer Science • Sem 6</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-[#1A1A1A]/50 uppercase font-black">Earnings</p>
                    <p className="text-xs font-black text-[#1E8E3E]">₹650.00</p>
                  </div>
                </div>

                {/* Simulated active commissions widget */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1A1A]/50 uppercase">
                    <span>Recent Active Notes</span>
                    <span className="text-[#3484F0]">View all</span>
                  </div>
                  
                  <div className="border border-[#1A1A1A] p-2.5 bg-white flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-[#FAF9F5] border border-[#1A1A1A]/20 text-[#3484F0] shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#1A1A1A] truncate">Machine Learning Guide</p>
                        <p className="text-[8px] text-[#1A1A1A]/60 font-mono">Sem 6 • Prof. Rajesh</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-[#E8F0FE] text-[#1A62D6] px-1.5 py-0.5 border border-[#1A1A1A]/10 font-bold shrink-0">
                      ★ 4.9
                    </span>
                  </div>

                  <div className="border border-[#1A1A1A] p-2.5 bg-white flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-[#FAF9F5] border border-[#1A1A1A]/20 text-[#3484F0] shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#1A1A1A] truncate">Data Structures CheatSheet</p>
                        <p className="text-[8px] text-[#1A1A1A]/60 font-mono">Sem 3 • CS Branch</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-[#E8F0FE] text-[#1A62D6] px-1.5 py-0.5 border border-[#1A1A1A]/10 font-bold shrink-0">
                      ★ 4.8
                    </span>
                  </div>
                </div>

                {/* Simulated commissions list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1A1A]/50 uppercase">
                    <span>Open Student Gigs</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="border border-[#1A1A1A] p-2.5 bg-[#FAF9F5] flex items-center justify-between text-left">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#1A1A1A] truncate">React To-Do Persistence</p>
                      <p className="text-[8px] text-[#1A1A1A]/60">Due in 2 days • CS Department</p>
                    </div>
                    <span className="text-[9px] font-mono bg-green-100 text-green-800 border border-green-300 px-1.5 py-0.5 font-black shrink-0">
                      ₹450 INR
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 3. THE FEATURE SHOWCASE (Asymmetric Bento Grid) */}
      <section id="features" className="py-24 md:py-32 bg-[#FFFFFF] border-y border-[#1A1A1A]/10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-xl text-left space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest font-black text-[#3484F0]">Uncompromising Utility</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]">
              Designed explicitly around campus friction points.
            </h3>
            <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">
              We replaced obsolete student directories and chaotic WhatsApp file forwarding with structured, fast, beautifully flat utilities.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Academic Drive (Large 2-column wide, 7 columns on desktop) */}
            <div id="feature-card-drive" className="md:col-span-7 bg-[#FAF9F5] border-2 border-[#1A1A1A] p-8 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#3484F0]/10 border border-[#1A1A1A]/20 text-[#3484F0] inline-block">
                    <Folder size={24} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-[#1A1A1A]/40 bg-[#1A1A1A]/5 px-2 py-0.5">Note Vault</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#1A1A1A]">Academic Drive & Materials</h4>
                  <p className="text-xs text-[#1A1A1A]/60 max-w-md leading-relaxed">
                    Upload, categorize, search, and download clean PDF notes, solved exam sheets, and lab manuals. Sorted perfectly by academic semesters, subjects, and engineering branches. No clutter, no expired links.
                  </p>
                </div>
              </div>

              {/* Minimal File List Mockup */}
              <div className="mt-8 border border-[#1A1A1A]/10 rounded-none bg-white p-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold border-b border-[#1A1A1A]/10 pb-2 text-[#1A1A1A]/50">
                  <span>FOLDER / FILE</span>
                  <span>DOWNLOADS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 text-[#1A1A1A] truncate max-w-[200px]">
                    <Folder size={14} className="text-[#3484F0]" /> Computer Science
                  </span>
                  <span className="text-[#1A1A1A]/50">34 files</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 text-[#1A1A1A] truncate max-w-[200px]">
                    <FileText size={14} className="text-[#1A1A1A]/60" /> ML-Deep-Neural-Nets.pdf
                  </span>
                  <span className="text-green-600 font-bold">12 times</span>
                </div>
              </div>
            </div>

            {/* Card 2: Task Commissions (Vertical high-density, 5 columns on desktop) */}
            <div id="feature-card-commissions" className="md:col-span-5 bg-white border-2 border-[#1A1A1A] p-8 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-100 border border-[#1A1A1A]/20 text-green-700 inline-block">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-green-700 bg-green-50 px-2 py-0.5">Micro-Gig Economy</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#1A1A1A]">Task Commissions</h4>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                    Delegate tedious calculations, graphic edits, or script assemblies to talented peers. Post your budget and clear requirements openly, and build reliable ratings for every completed milestone.
                  </p>
                </div>
              </div>

              {/* Task Cards Visual mockup */}
              <div className="mt-8 space-y-3">
                <div className="border border-[#1A1A1A] p-3 bg-[#FAF9F5] flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-[10px] font-bold text-[#1A1A1A] truncate">Lab Report Prep</p>
                    <span className="text-[9px] font-mono bg-green-100 text-green-800 px-1.5 py-0.5 border border-green-300 font-black shrink-0">
                      ₹150 INR
                    </span>
                  </div>
                  <p className="text-[8px] text-[#1A1A1A]/50">Completed by Harshit Kataram</p>
                </div>
                <div className="border border-[#1A1A1A] p-3 bg-white flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-[10px] font-bold text-[#1A1A1A] truncate">Python Parser Script</p>
                    <span className="text-[9px] font-mono bg-green-100 text-green-800 px-1.5 py-0.5 border border-green-300 font-black shrink-0">
                      ₹500 INR
                    </span>
                  </div>
                  <p className="text-[8px] text-[#1A1A1A]/50">CS Branch • Due in 5 Days</p>
                </div>
              </div>
            </div>

            {/* Card 3: Doubt Box (Small square, 6 columns on desktop) */}
            <div id="feature-card-doubts" className="md:col-span-6 bg-white border-2 border-[#1A1A1A] p-8 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-50 border border-purple-200 text-purple-700 inline-block">
                    <HelpCircle size={24} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-purple-700 bg-purple-50 px-2 py-0.5">100% Anonymous</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#1A1A1A]">Doubt Box</h4>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                    Ask those tricky mathematical questions or syntax errors without any judgment or fear of public embarrassment. Get vetted answers from classmates using assigned randomized nicknames.
                  </p>
                </div>
              </div>

              {/* Minimal Doubt Box visual */}
              <div className="mt-8 bg-purple-50/50 border border-purple-200/60 p-4 space-y-2 text-left">
                <p className="text-[10px] font-mono text-purple-800 font-bold">Q: How to prove Halting Problem undecidable?</p>
                <div className="flex items-center gap-2 text-[8px] text-[#1A1A1A]/60 font-mono">
                  <span>Posted by</span>
                  <span className="bg-[#1A1A1A] text-white px-1 rounded">Anonymous Owl</span>
                </div>
              </div>
            </div>

            {/* Card 4: Lost & Found (Grid card, 6 columns on desktop) */}
            <div id="feature-card-lostfound" className="md:col-span-6 bg-[#FAF9F5] border-2 border-[#1A1A1A] p-8 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 inline-block">
                    <MapPin size={24} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-yellow-700 bg-yellow-50 px-2 py-0.5">Found Item Ledger</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#1A1A1A]">Lost & Found Board</h4>
                  <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                    A centralized public board keeping track of missing books, lost scientific calculators, and keys left behind in lecture halls. Coordinates directly with the library desk so items get claimed safely.
                  </p>
                </div>
              </div>

              {/* Lost found row item mockup */}
              <div className="mt-8 border border-[#1A1A1A]/10 bg-white p-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[8px] font-black uppercase text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded font-mono">
                    Found Item
                  </span>
                  <p className="text-[10px] font-bold text-[#1A1A1A] mt-1.5 truncate">Casio fx-991EX Calculator</p>
                  <p className="text-[8px] text-[#1A1A1A]/50 flex items-center gap-1 mt-0.5 font-mono">
                    <MapPin size={10} /> Room 302 Seminar Hall
                  </p>
                </div>
                <div className="w-12 h-12 bg-zinc-100 border border-[#1A1A1A]/10 flex items-center justify-center shrink-0">
                  <Tag size={18} className="text-[#1A1A1A]/40" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. "HOW IT FEELS" (The Interactive Segment) */}
      <section id="how-it-feels" className="py-24 md:py-32 bg-[#121212] text-white border-y border-white/5 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-[#3484F0]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 relative z-10">
          
          <div className="max-w-2xl text-left space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest font-black text-[#8AB4F8] font-mono">The Campus Operating System</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
              A platform built for students, managed by students.
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
              We understand campus culture. Every module inside Nexus is optimized to save you time and maximize convenience. See how it serves your college routine:
            </p>
          </div>

          {/* Tab Selection Row */}
          <div className="flex border-b border-white/10 overflow-x-auto pb-px" id="how-feels-tabs">
            {(['academics', 'peer-help', 'campus-life'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSegmentTab(tab)}
                className={`py-4 px-6 text-xs uppercase tracking-wider font-bold shrink-0 border-b-2 transition-all cursor-pointer ${
                  activeSegmentTab === tab 
                    ? 'border-[#8AB4F8] text-[#8AB4F8] bg-white/5' 
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                {tab === 'academics' && 'For Academics'}
                {tab === 'peer-help' && 'For Peer Help'}
                {tab === 'campus-life' && 'For Campus Life'}
              </button>
            ))}
          </div>

          {/* Interactive Tab Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/5 border border-white/10 p-8 md:p-12" id="feels-tab-display-box">
            
            {/* Tab Description Left */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h4 className="text-2xl font-bold tracking-tight text-white">
                {segmentContent[activeSegmentTab].title}
              </h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {segmentContent[activeSegmentTab].desc}
              </p>

              {/* Vetted features list */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {segmentContent[activeSegmentTab].features.map((feat, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 size={15} className="text-[#8AB4F8] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Action Button Right */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-8">
              <div className="text-center space-y-4">
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Experience Nexus Now</p>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white text-[#121212] font-black text-xs uppercase tracking-wider hover:invert transition-all cursor-pointer shadow-lg shadow-white/5"
                >
                  Create Student Account
                </button>
                <p className="text-[10px] text-neutral-400">Takes less than 60 seconds</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CAMPUS STATS BAR */}
      <section id="stats" className="py-20 md:py-24 bg-[#FAF9F5] border-b border-[#1A1A1A]/10 px-6 md:px-12 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]/10">
            
            {/* Stat 1 */}
            <div className="space-y-2 py-6 md:py-0">
              <p className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight font-sans">
                1,200+
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50">
                Notes & Exam PDFs Shared
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-2 py-6 md:py-0">
              <p className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight font-sans">
                99.4%
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50">
                Doubt Resolution Rate
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-2 py-6 md:py-0">
              <p className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight font-sans">
                14 Days
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50">
                Automatic Data Cleanups
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FINAL BOLD CTA */}
      <section id="cta" className="py-28 md:py-36 bg-[#FFFFFF] px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-none max-w-2xl mx-auto font-sans">
            Ready to simplify your college experience?
          </h2>
          <p className="text-sm text-[#1A1A1A]/60 max-w-lg mx-auto leading-relaxed">
            Register using your college credentials. Upload shared files to build ratings, pick up commissions, and participate in peer groups instantly.
          </p>

          <form onSubmit={handleCtaSubmit} className="max-w-md mx-auto pt-4" id="cta-email-form">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Enter college email..."
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-[#1A1A1A] text-sm focus:outline-hidden rounded-none bg-white font-sans placeholder-[#1A1A1A]/40"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all rounded-none cursor-pointer shrink-0 border border-transparent"
              >
                Claim Your Profile
              </button>
            </div>
            
            <AnimatePresence>
              {ctaSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3.5 text-xs text-green-700 font-bold"
                >
                  🎉 Connecting to campus credentials... Redirecting!
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Fine print */}
          <p className="text-[10px] text-neutral-400 font-mono">
            Requires valid college domains. Backed by the student council.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF9F5] border-t border-[#1A1A1A]/10 py-12 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#1A1A1A]/50">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black tracking-widest text-[#1A1A1A]/70">NEXUS</span>
            <span>© 2026 Student Operations System.</span>
          </div>
          <div className="flex items-center gap-6 font-bold uppercase tracking-wider text-[10px]">
            <a href="#features" className="hover:text-[#1A1A1A]">Features</a>
            <a href="#how-it-feels" className="hover:text-[#1A1A1A]">How it works</a>
            <a href="#stats" className="hover:text-[#1A1A1A]">Stats</a>
            <span className="text-[#3484F0] cursor-pointer" onClick={onGetStarted}>Portal</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
