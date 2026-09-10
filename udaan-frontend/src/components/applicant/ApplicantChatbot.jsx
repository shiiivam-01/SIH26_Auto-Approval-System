import { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, MessageSquare, RotateCcw,
  CheckCircle2, ChevronDown, ExternalLink, ShieldCheck, User, Mic
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUICK_PROMPTS = [
  'Direct document list link for Food Manufacturing?',
  'Required documents & govt portal links?',
  'How long does Fire NOC approval take?',
  'Which subsidy schemes match my business?',
  'How is my data protected on UDAAN?',
];

export const ApplicantChatbot = ({ applicantName = 'Entrepreneur' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Namaste ${user?.name ? user.name.split(' ')[0] : applicantName}! 🙏 I am UDAAN Sahayak, your AI Single Window Assistant. How can I assist your business setup or approvals today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const generateAnswer = (query) => {
    const q = query.toLowerCase();

    if (q.includes('cafe') || q.includes('hotel') || q.includes('restaurant') || q.includes('bakery')) {
      return {
        text: 'Direct Statutory Document Checklist for Cafe / Hotel / Restaurant:\n\n• Proof of Possession of Commercial Premises (Rental Deed / Ownership)\n• Layout Plan of the kitchen, dining, food preparation, and waste storage areas\n• Water Testing Report from NABL / FSSAI accredited lab (as per IS:10500)\n• Medical Fitness Certificates & Food Handler Typhoid / Deworming records\n• Food Safety Management System (FSMS) plan\n• Municipal Trade License / Gumasta Registration\n• Fire Safety NOC (for seating capacity > 50 guests)\n\n👉 Click the direct link below to open the official FSSAI FoSCoS Food Services Document List PDF:',
        action: { label: 'Go to Document Section', path: '/applicant/documents' },
        links: [
          { label: 'FSSAI Food Services Document List (Direct PDF) ↗', url: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessFoodServices.pdf' },
          { label: 'FoSCoS Official Portal ↗', url: 'https://foscos.fssai.gov.in/' },
        ],
      };
    }

    if (q.includes('pharmacy') || q.includes('chemist') || q.includes('medical store') || q.includes('drug license')) {
      return {
        text: 'Direct Statutory Document Checklist for Pharmacy & Medical Store (Retail / Wholesale):\n\n• Form 19 / 19A Application for Grant of Retail Drug License (Forms 20 & 21)\n• Registered Pharmacist Degree / Diploma & State Pharmacy Council Registration Certificate\n• Pharmacist Appointment Letter and Acceptance Affidavit\n• Commercial Premises Rent Agreement (>10 sq. meters for retail, >15 sq. meters for retail+wholesale)\n• Refrigerator / Deep Freeze Invoice & Temperature Monitoring Log Book\n• Blueprint & Layout Plan of the pharmacy premises with rack layout\n\n👉 Access the official State FDA and CDSCO Drug Sale Portal below:',
        action: { label: 'Go to Document Section', path: '/applicant/documents' },
        links: [
          { label: 'CDSCO Drug Retail Guidelines ↗', url: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/Retail-Sale/' },
          { label: 'State FDA Drug Licensing ↗', url: 'https://cdsco.gov.in/' },
        ],
      };
    }

    if (q.includes('gym') || q.includes('fitness') || q.includes('health club')) {
      return {
        text: 'Direct Statutory Document Checklist for Gym & Fitness Center:\n\n• Commercial Property Lease Deed or Municipal Tax Receipt\n• Municipal Corporation Health & Trade License (Gumasta Act)\n• Certified Fitness Equipment Safety, Stability & Ground Load Certificate\n• Certified Trainers Bio-data, CPR & First Aid Certification copies\n• Fire Safety Provisional NOC & Emergency Exit Schematic\n• High-Tension Electrical Sanction & Earthing Certificate for commercial fitness equipment\n• Mandatory First Aid Kit & Emergency Evacuation Protocol\n\n👉 Access the official Single Window Guidelines for Fitness Centers below:',
        action: { label: 'Go to Document Section', path: '/applicant/documents' },
        links: [
          { label: 'Single Window Fitness Compliance Directory ↗', url: 'https://eodb.mp.gov.in/' },
          { label: 'MP Urban Municipal Guidelines ↗', url: 'https://www.mpenagarpalika.gov.in/' },
        ],
      };
    }

    if (q.includes('direct') && (q.includes('link') || q.includes('document') || q.includes('list'))) {
      return {
        text: 'Direct Official Government Statutory Document Lists:\n\n• **Cafe / Hotel / Restaurant**:\nFSSAI FoSCoS Food Services Mandatory Checklist (Direct PDF)\n\n• **Pharmacy & Medical Store**:\nState FDA & CDSCO Drug Retail Sale Checklist\n\n• **Gym & Fitness Center**:\nMunicipal Corporation & Labour Fitness Centre Guidelines\n\n• **Food Manufacturing / Processing**:\nOfficial FSSAI FoSCoS Manufacturing Document List (Direct PDF)\n\n• **General Factory / Manufacturing**:\nMP DIHS Factories Act Layout & Approval Guidelines\n\nClick any direct link below to open the official statutory list:',
        action: { label: 'Go to Document Section', path: '/applicant/documents' },
        links: [
          { label: 'Cafe/Hotel Food Services List (PDF) ↗', url: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessFoodServices.pdf' },
          { label: 'Pharmacy Drug Retail Guidelines ↗', url: 'https://cdsco.gov.in/opencms/opencms/en/Drugs/Retail-Sale/' },
          { label: 'Gym Compliance Guidelines ↗', url: 'https://eodb.mp.gov.in/' },
          { label: 'Food Mfg Document List (PDF) ↗', url: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessDocumentList.pdf' },
          { label: 'Manufacturing Factories Act ↗', url: 'https://labour.mp.gov.in/' },
        ],
      };
    }

    if (q.includes('food') || q.includes('fssai')) {
      return {
        text: 'Direct Statutory Document List for Food Manufacturing & Processing:\n\n• Form-B Signed Application & Plant Blueprint\n• Machine List with connected HP & processing capacity (MT/day)\n• Water Potability Report (IS:10500 certified)\n• Food Safety Management Plan (FSMS) / ISO 22000\n• Raw material source & food recall plan\n• MPPCB Environmental Consent to Establish (CTE)\n\n👉 Click the direct link below to open the official FSSAI Kind of Business Document List PDF:',
        action: { label: 'Go to Document Section', path: '/applicant/documents' },
        links: [
          { label: 'Direct FSSAI Document List (PDF) ↗', url: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessDocumentList.pdf' },
          { label: 'FoSCoS Central Portal ↗', url: 'https://foscos.fssai.gov.in/' },
        ],
      };
    }

    if (q.includes('govt') || q.includes('portal') || q.includes('official') || q.includes('which document') || q.includes('required document') || q.includes('checklist')) {
      return {
        text: 'Official Government Document Guidelines & Portal Links:\n\n• **Universal Clearances**: Incorporation, DPR, Land Deed.\n• **Fire Safety NOC**: Building plan, hydrant layout, structural stability.\n• **MPPCB Pollution**: ETP/STP design, stack height, process chart.\n• **FSSAI Food License**: Form-B, water test IS:10500, FSMS plan.\n• **Factory License**: Machine layout, Form-1, MSDS.\n• **Udyam**: Enterprise PAN, Aadhaar, Bank IFSC.\n\nClick any official government portal link below to inspect the statutory checklist directly on the department site:',
        action: { label: 'Explore Document Vault Directory', path: '/applicant/documents' },
        links: [
          { label: 'NSWS Central Portal', url: 'https://www.nsws.gov.in/know-your-approvals' },
          { label: 'MP Fire Services', url: 'https://www.mpenagarpalika.gov.in/' },
          { label: 'MPPCB Pollution Board', url: 'https://mppcb.mp.gov.in/' },
          { label: 'FSSAI FoSCoS', url: 'https://foscos.fssai.gov.in/' },
          { label: 'MP Labour Welfare', url: 'https://labour.mp.gov.in/' },
          { label: 'Udyam Portal', url: 'https://udyamregistration.gov.in/' },
        ],
      };
    }

    if (q.includes('fire noc') || q.includes('fire') || q.includes('fire safety')) {
      return {
        text: 'Fire Safety NOC is a statutory clearance issued by the Fire Department. Under UDAAN Single Window:\n\n• **Statutory SLA**: 15 Working Days.\n• **Required Documents**: Approved building layout, site safety plan, water hydrant map, and certified structural stability.\n• **Inspection**: On-site joint physical verification by the designated Inspector.',
        action: { label: 'View My Applications', path: '/applicant/applications' }
      };
    }

    if (q.includes('food') || q.includes('fssai') || q.includes('document')) {
      return {
        text: 'For Food Processing enterprises in Madhya Pradesh, the standard approvals checklist includes:\n\n1. **FSSAI Manufacturing License** (Food Safety & Standards)\n2. **Consent to Establish (CTE)** from MP Pollution Control Board\n3. **Fire Safety Provisional NOC**\n4. **Factory Directorate Registration** (if >10 workers with power)\n\nAll documents uploaded to your Document Vault are encrypted with AES-256-GCM.',
        action: { label: 'Go to Document Vault', path: '/applicant/documents' }
      };
    }

    if (q.includes('scheme') || q.includes('subsidy') || q.includes('loan') || q.includes('pmegp') || q.includes('fund')) {
      return {
        text: 'Top government schemes matched for enterprises:\n\n• **PMEGP (Prime Minister Employment Generation)**: Up to 35% capital subsidy for manufacturing units.\n• **MP Development Scheme**: 40% capital investment subsidy up to ₹2.5 Crores + 5% interest subvention for 5 years.\n• **Mudra Scheme (Tarun Category)**: Collateral-free working capital loan up to ₹10 Lakhs.',
        action: { label: 'Explore Matched Schemes', path: '/applicant/schemes' }
      };
    }

    if (q.includes('security') || q.includes('crypto') || q.includes('privacy') || q.includes('safe') || q.includes('password') || q.includes('mask')) {
      return {
        text: 'UDAAN follows rigorous cybersecurity and statutory compliance standards:\n\n• **End-to-End Cryptography**: Uploaded vault certificates are encrypted at rest with AES-256-GCM.\n• **Identity Privacy**: Phone numbers (+91 XXXXXXX645) and Aadhaar/PAN are masked on public interfaces.\n• **Password Defense**: 12-round bcrypt hash + automated 15-minute brute-force lockout after 5 failed tries.\n• **Audit Watermark**: All document previews are dynamically watermarked to prevent leakage.',
        action: { label: 'View My Profile & Security', path: '/applicant/profile' }
      };
    }

    if (q.includes('status') || q.includes('track') || q.includes('application')) {
      return {
        text: 'You can track all submitted applications in real-time under "My Applications". Each application shows current stage (Officer Review, Inspection Scheduled, or Approved), remaining statutory SLA countdown, and officer review notes.',
        action: { label: 'Check Application Status', path: '/applicant/applications' }
      };
    }

    if (q.includes('inspection') || q.includes('inspector')) {
      return {
        text: 'Inspections in UDAAN are conducted via Joint Multi-Departmental Verification to save you time. You will receive an SMS and portal notification with the Inspector name, contact number, and scheduled visit date.',
        action: { label: 'View Inspections', path: '/applicant/inspections' }
      };
    }

    if (q.includes('grievance') || q.includes('complain') || q.includes('delay')) {
      return {
        text: 'If an approval exceeds its statutory SLA timeline without valid reason, our automated SLA escalation engine flags it to the District Collector and Higher Directorate. You can also log a direct grievance with real-time tracking.',
        action: { label: 'File a Grievance', path: '/applicant/grievances' }
      };
    }

    return {
      text: 'I can help you with:\n• Document requirements & vault uploads\n• Clearances (Fire NOC, PCB, FSSAI, Factory)\n• Application progress & statutory SLA deadlines\n• Subsidy schemes (PMEGP, MP Subsidies)\n• Data security & privacy protocols\n\nWhat would you like to explore?',
    };
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate fast realistic AI response
    setTimeout(() => {
      const ans = generateAnswer(query);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: ans.text,
        action: ans.action,
        links: ans.links,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat cleared! How else can I assist your business setup or approvals today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none pointer-events-auto">
      {/* CHATBOT WINDOW DIALOG */}
      {isOpen && (
        <div className="mb-3 w-[350px] sm:w-[380px] h-[500px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-in transition-all">
          {/* Header */}
          <div className="px-4 py-3 bg-[#1a3a6b] dark:bg-slate-800 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1a3a6b] dark:border-slate-800 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">UDAAN Sahayak</span>
                  <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded border border-blue-400/30">
                    AI Guide
                  </span>
                </div>
                <span className="text-[11px] text-blue-100/80 block leading-none">
                  Instant clearance & subsidy assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-[#0b1120]/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 space-y-1.5 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#1a3a6b] dark:bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/70 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {m.action && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate(m.action.path);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                    >
                      <span>{m.action.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {m.links && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9.5px] text-right font-mono ${
                      m.sender === 'user' ? 'text-blue-200/80' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 dark:text-slate-500 py-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 rounded-2xl px-3 py-2 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-[10.5px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/60 transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about NOCs, checklist, schemes..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS (Voice Assistant + Chatbot) */}
      <div className="flex flex-col items-end gap-2.5">


        {/* CHATBOT FAB TRIGGER */}
        <div className="relative group flex items-center justify-end">
          {/* Tooltip prompt only when user hovers over the button */}
          {!isOpen && (
            <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none items-center gap-1.5 mr-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold shadow-lg border border-slate-700/50 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Need help? Ask Sahayak</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a3a6b] to-blue-600 hover:from-[#14306a] hover:to-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 relative"
            aria-label={isOpen ? 'Close Chatbot' : 'Open AI Chatbot Assistant'}
          >
            {isOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90 animate-spin-once" />
            ) : (
              <div className="relative">
                <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
