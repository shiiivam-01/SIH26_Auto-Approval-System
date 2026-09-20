import React from 'react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Clock, Rocket, Building2, ArrowRight, User, Search, FileText, Settings, ClipboardCheck, HardHat, CheckCircle, Bell, TrendingUp } from 'lucide-react';
import logo from '../assets/logo.jpg';

export const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="UDAAN" className="w-10 h-10 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">UDAAN</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">Unified Digital Approval & Assistance Network</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-sm font-semibold hover:text-blue-600 transition-colors hidden sm:block">Home</Link>
          <Link to="/about" className="text-sm font-semibold text-blue-600 transition-colors hidden sm:block">About Us</Link>
          <ThemeToggle />
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md"
          >
            Portal Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-500/5" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight text-slate-900 dark:text-white">
              Revolutionizing <br/>
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Government Approvals</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              UDAAN is an innovative, single-window clearance platform built to eliminate bureaucratic red tape for startups and growing enterprises.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 px-6 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm mb-4">
                <Rocket className="w-5 h-5" /> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                Empowering founders by simplifying compliance.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Starting a business is hard enough without having to navigate a labyrinth of government departments, redundant paperwork, and endless waiting periods. 
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Our mission is to provide a transparent, fast, and unified ecosystem where founders can submit their details just once, and watch as approvals are intelligently routed and processed in parallel across all necessary departments.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center md:text-left">
                <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">10x</h3>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Faster Approvals</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center md:text-left">
                <h3 className="text-4xl font-black text-teal-600 dark:text-teal-400 mb-2">0</h3>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Redundant Papers</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center md:text-left">
                <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">24/7</h3>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Live Tracking</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center md:text-left">
                <h3 className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">100%</h3>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Transparent</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow & Process Diagram */}
        <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How UDAAN Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              A transparent, fully digital workflow from application to final clearance.
            </p>
          </div>

          {/* Interactive Flowchart Diagram */}
          <div className="mb-20 max-w-5xl mx-auto relative z-10 hidden md:block">
            <div className="flex items-center justify-between relative h-64">
              
              {/* Connecting Background Line */}
              <div className="absolute top-1/2 left-10 right-10 h-2 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />

              {/* Main Node 1: Applicant */}
              <div className="relative z-10 flex flex-col items-center w-48 group">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 font-black text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide">Applicant</h3>
                <p className="text-xs text-slate-500 text-center mt-1 font-medium">Registers on UDAAN</p>
              </div>

              {/* Interactive Arrow 1 */}
              <div className="relative z-20 flex-1 flex justify-center group h-32 items-center cursor-pointer">
                <div className="absolute w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 animate-pulse group-hover:animate-none">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </div>
                
                {/* Hover Reveal Card 1 */}
                <div className="absolute top-full mt-4 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-700 rotate-45"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-bold text-sm">Find Required Approvals</h4>
                        <p className="text-xs text-slate-500 mt-1">AI identifies applicable NOCs based on business details.</p>
                      </div>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-bold text-sm">Submit Application</h4>
                        <p className="text-xs text-slate-500 mt-1">Fill one smart form and upload docs to the secure vault.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Node 2: Department */}
              <div className="relative z-10 flex flex-col items-center w-48 group">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 border-4 border-indigo-500 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Building2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 font-black text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide">Department</h3>
                <p className="text-xs text-slate-500 text-center mt-1 font-medium">Parallel Officer Review</p>
              </div>

              {/* Interactive Arrow 2 */}
              <div className="relative z-20 flex-1 flex justify-center group h-32 items-center cursor-pointer">
                <div className="absolute w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 animate-pulse group-hover:animate-none">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </div>

                {/* Hover Reveal Card 2 */}
                <div className="absolute top-full mt-4 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-700 rotate-45"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-bold text-sm">Inspection Required?</h4>
                        <p className="text-xs text-slate-500 mt-1">If yes, an officer visits the site and submits an inspection report.</p>
                      </div>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <div className="flex gap-3 items-start bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-100 dark:border-orange-800/30">
                      <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">!</div>
                      <div>
                        <h4 className="font-bold text-sm text-orange-800 dark:text-orange-400">SLA Enforcement</h4>
                        <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80 mt-1">If officers exceed time limits, Auto-Approval engine takes over.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Node 3: Clearance */}
              <div className="relative z-10 flex flex-col items-center w-48 group">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-4 font-black text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide">Clearance</h3>
                <p className="text-xs text-slate-500 text-center mt-1 font-medium">Approval Granted & Notified</p>
              </div>

            </div>
            
            <p className="text-center text-sm text-slate-500 mt-12 italic">Hover over the arrows above to see the detailed in-between processes.</p>
          </div>
          
          {/* Mobile Fallback (Grid) */}
          <div className="md:hidden grid grid-cols-1 gap-6 mb-16">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100">
               <h3 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-300">1. Applicant Phase</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Registers, finds required approvals, and submits the smart application.</p>
             </div>
             <div className="flex justify-center text-slate-400"><ArrowRight className="rotate-90 w-6 h-6" /></div>
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100">
               <h3 className="font-bold text-lg mb-2 text-indigo-800 dark:text-indigo-300">2. Department Review</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Officers review applications. Site inspections occur if required. SLA countdown begins.</p>
             </div>
             <div className="flex justify-center text-slate-400"><ArrowRight className="rotate-90 w-6 h-6" /></div>
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100">
               <h3 className="font-bold text-lg mb-2 text-emerald-800 dark:text-emerald-300">3. Final Clearance</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Approval granted (or auto-approved). User notified to stay compliant.</p>
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center md:text-left flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">The Auto-Approval Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Our Auto-Approval system ensures businesses are not held back by bureaucratic delays. When a department exceeds its designated SLA timeframe, the system's rule-engine kicks in. 
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                If the application meets all predefined structural criteria (documents uploaded, no critical flags), the platform automatically issues an interim or final clearance certificate, shifting accountability back to the department while letting the founder proceed.
              </p>
            </div>
            <div className="w-full md:w-1/3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-800/30">
               <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-blue-500/30">
                  <span className="text-white font-black text-xl">SLA</span>
               </div>
               <p className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">Time's up?</p>
               <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">System auto-issues the certificate.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-900 to-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
              Ready to launch your startup?
            </h2>
            <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto relative z-10 font-medium">
              Join thousands of founders who are bypassing the red tape and getting their businesses off the ground in record time.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 text-lg font-bold rounded-full hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="UDAAN" className="w-8 h-8 rounded-md grayscale" />
              <span className="text-lg font-bold tracking-tight">UDAAN</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm font-medium">
              Unified Digital Approval & Assistance Network. Building the future of e-governance for Indian startups.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing & Fees</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Documentation</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-500 flex flex-col md:flex-row justify-between items-center font-medium">
          <p>© {new Date().getFullYear()} UDAAN Network. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
