import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  FileText,
  AlertTriangle,
  Cookie,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Scale,
  ExternalLink,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDesignHistory } from '../lib/useHistoryStore';

export type LegalTab = 'terms' | 'privacy' | 'safety' | 'cookies' | 'datarights';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { nodes, clearHistory } = useDesignHistory();

  // Reset tab when modal re-opens with new initialTab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDeleteConfirmText('');
      setDeleteSuccess(false);
      setExportSuccess(false);
    }
  }, [isOpen, initialTab]);

  // GDPR Data Portability: Export full user JSON archive
  const handleExportUserData = () => {
    const exportPackage = {
      exportTimestamp: new Date().toISOString(),
      complianceStandard: 'GDPR Article 20 / CCPA Data Portability Compliance Package',
      userProfile: {
        email: user?.email || 'unregistered-session@local',
        name: user?.name || 'Guest Engineer',
        role: user?.role || 'Guest Engineer',
        skills: user?.skills || [],
        certifications: user?.certifications || []
      },
      clientStorage: {
        theme: localStorage.getItem('polystrukt_theme') || 'dark',
        cookieConsent: localStorage.getItem('polystrukt_cookie_consent') || 'not_recorded',
        cookieConsentTimestamp: localStorage.getItem('polystrukt_cookie_consent_time') || null
      },
      designHistoryNodesCount: nodes.length,
      designHistory: nodes,
      legalStatus: {
        termsVersion: '2026.1-v4',
        privacyPolicyVersion: '2026.1-v4',
        engineeringDisclaimerAcknowledged: true
      }
    };

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polystrukt_data_export_${user?.email ? user.email.replace(/[@.]/g, '_') : 'guest'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  // GDPR Article 17: Right to Erasure ("Right to Be Forgotten")
  const handleDeleteAccountAndData = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return;

    setIsDeleting(true);
    try {
      // Clear local design history
      clearHistory();

      // Clear local persistence
      localStorage.removeItem('polystrukt_theme');
      localStorage.removeItem('polystrukt_cookie_consent');
      localStorage.removeItem('polystrukt_cookie_consent_time');
      localStorage.removeItem('cad-history-storage');
      sessionStorage.clear();

      // Log out
      logout();

      setDeleteSuccess(true);
      setTimeout(() => {
        setIsDeleting(false);
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Account erasure failed:', err);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl h-[90vh] max-h-[850px] bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Scale size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black uppercase tracking-wider font-mono">
                    Legal, Privacy & Compliance Trust Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active v2026.1
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono tracking-wide">
                  Regulatory disclosures, Terms of Service, GDPR/CCPA Privacy, and Engineering Liability Shield
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close legal modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900/30 border-b border-white/5 overflow-x-auto scrollbar-none">
            <TabButton
              active={activeTab === 'terms'}
              onClick={() => setActiveTab('terms')}
              icon={FileText}
              label="Terms of Service"
            />
            <TabButton
              active={activeTab === 'safety'}
              onClick={() => setActiveTab('safety')}
              icon={AlertTriangle}
              label="Engineering Liability"
              badge="High Risk"
            />
            <TabButton
              active={activeTab === 'privacy'}
              onClick={() => setActiveTab('privacy')}
              icon={Shield}
              label="Privacy Policy (GDPR / CCPA)"
            />
            <TabButton
              active={activeTab === 'cookies'}
              onClick={() => setActiveTab('cookies')}
              icon={Cookie}
              label="Cookie & Storage Policy"
            />
            <TabButton
              active={activeTab === 'datarights'}
              onClick={() => setActiveTab('datarights')}
              icon={Download}
              label="Data Rights & Erasure"
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
            {activeTab === 'terms' && <TermsOfServiceContent />}
            {activeTab === 'safety' && <EngineeringSafetyContent />}
            {activeTab === 'privacy' && <PrivacyPolicyContent />}
            {activeTab === 'cookies' && <CookiePolicyContent />}
            {activeTab === 'datarights' && (
              <DataRightsContent
                user={user}
                onExport={handleExportUserData}
                exportSuccess={exportSuccess}
                deleteConfirmText={deleteConfirmText}
                setDeleteConfirmText={setDeleteConfirmText}
                onDelete={handleDeleteAccountAndData}
                isDeleting={isDeleting}
                deleteSuccess={deleteSuccess}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-zinc-900/60 text-[10px] text-zinc-400 font-mono">
            <div>
              <span>Effective Date: January 1, 2026</span>
              <span className="mx-2">•</span>
              <span>Polystrukt Engineering Technologies Inc.</span>
              <span className="mx-2">•</span>
              <span>DPO: legal@polystrukt.com</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider uppercase transition-colors"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
      active
        ? 'bg-white/10 text-white border border-white/20 shadow-sm'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
    }`}
  >
    <Icon size={14} className={active ? 'text-indigo-400' : 'text-zinc-500'} />
    <span>{label}</span>
    {badge && (
      <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
        {badge}
      </span>
    )}
  </button>
);

// --- TAB CONTENTS ---

const TermsOfServiceContent: React.FC = () => (
  <div className="space-y-6 max-w-4xl">
    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
      <div className="flex items-center gap-2 font-bold font-mono text-sm uppercase tracking-wide text-white mb-1">
        <Info size={16} className="text-indigo-400" />
        Binding Legal Agreement
      </div>
      <p className="text-[11px] leading-relaxed">
        By accessing or using the Polystrukt Generative CAD and Engineering Synthesis Platform ("Polystrukt", "we", "us", or "our"), you ("User", "Licensee", or "Organization") agree to be bound by these Terms of Service, including the mandatory arbitration provision and liability waivers herein. If you do not agree, do not use the service.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">1.</span> Nature of Service & Generative AI Limitations
      </h3>
      <p>
        Polystrukt provides artificial intelligence-powered procedural geometry generation, Constructive Solid Geometry (CSG) modeling, and finite-element visual approximations. You acknowledge that AI algorithms may produce geometric anomalies, non-manifold topologies, incorrect clearance tolerances, stress stress-concentration oversights, or impossible manufacturing toolpaths.
      </p>
      <p className="font-semibold text-zinc-200">
        All CAD models, exports (STL, OBJ, GLB, STEP, DXF), blueprints, and simulation graphs are generated solely for iterative conceptualization and research purposes.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">2.</span> Strict Engineering & Physical Fabrication Disclaimer
      </h3>
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-[11px] space-y-2">
        <p className="font-bold text-white uppercase tracking-wider">
          CRITICAL PRODUCT LIABILITY AND TORT WAIVER:
        </p>
        <p>
          POLYSTRUKT IS NOT A LICENSED PROFESSIONAL ENGINEERING (PE) FIRM. OUTPUTS DO NOT CONSTITUTE CERTIFIED ENGINEERING SPECIFICATIONS, LOAD-BEARING CERTIFICATIONS, OR AIRWORTHINESS ASSURANCES.
        </p>
        <p>
          Prior to physical manufacturing, CNC machining, additive 3D printing, casting, or deploying any part generated by or exported from this platform into any physical mechanism, YOU MUST ENGAGE A DULY LICENSED PROFESSIONAL ENGINEER TO VALIDATE STRUCTURAL INTEGRITY, MATERIAL FATIGUE, THERMAL DISSIPATION, AND COMPLIANCE WITH APPLICABLE SAFETY CODES (e.g., ASME, ISO, OSHA, FAA, SAE).
        </p>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">3.</span> Acceptable Use Policy (AUP) & Prohibited Munitions
      </h3>
      <p>You strictly covenant that you will not use Polystrukt to synthesize, design, optimize, or export:</p>
      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
        <li>Firearms, receivers, barrels, suppressors, or ammunition components regulated under the US Munitions List (USML) or International Traffic in Arms Regulations (ITAR);</li>
        <li>Weapons of mass destruction, chemical, biological, radiological, or explosive dispersal devices;</li>
        <li>Critical medical life-support or invasive surgical implants without regulatory clearance;</li>
        <li>Geometry infringing any patent, copyright, industrial design right, or trade secret of any third party.</li>
      </ul>
      <p>Violation results in immediate account revocation and reporting to applicable defense and law enforcement bodies.</p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">4.</span> Intellectual Property & User Ownership
      </h3>
      <p>
        <strong>Your Designs:</strong> As between you and Polystrukt, you retain full ownership of the technical input prompts and resulting customized CAD geometry generated through your authenticated account.
      </p>
      <p>
        <strong>Platform IP:</strong> Polystrukt retains all proprietary rights, copyright, and patent rights in the procedural generation algorithms, neural CSG synthesis kernels, UI components, shader pipelines, and underlying software code.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">5.</span> Disclaimer of Warranties & Limitation of Liability
      </h3>
      <p className="uppercase text-[10px] tracking-wide text-zinc-400 font-mono">
        THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ZERO DEFECTS.
      </p>
      <p className="font-semibold text-zinc-200">
        IN NO EVENT SHALL POLYSTRUKT, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PRODUCTION, MECHANICAL COLLAPSE, PROPERTY DESTRUCTION, PERSONAL INJURY, OR DEATH ARISING FROM USE OR FABRICATION OF ANY DESIGN. OUR MAXIMUM AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED US DOLLARS ($100), WHICHEVER IS LESS.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="text-indigo-400">6.</span> Mandatory Binding Arbitration & Class Action Waiver
      </h3>
      <p>
        Any dispute, claim, or controversy arising out of or relating to these Terms or the breach thereof shall be settled by confidential binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules. You agree that all claims must be brought in your individual capacity, and not as a plaintiff or class member in any purported class or representative proceeding.
      </p>
    </section>
  </div>
);

const EngineeringSafetyContent: React.FC = () => (
  <div className="space-y-6 max-w-4xl">
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
      <div className="flex items-center gap-2 font-bold font-mono text-sm uppercase tracking-wide text-amber-300 mb-1">
        <AlertTriangle size={18} className="text-amber-400" />
        Operational Safety & Structural Engineering Advisory
      </div>
      <p className="text-[11px] leading-relaxed">
        This document details the operational safety boundaries and technical non-warranty provisions designed to protect users, fabricators, and our engineering team against mechanical failure claims.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        1. Finite Element Analysis (FEA) Approximation Notice
      </h3>
      <p>
        The integrated stress simulator, Von Mises yield visualization, thermal dissipation overlays, and harmonic resonance plots rendered in this browser applet are <strong>reduced-order discrete approximations</strong>. They are synthesized using client-side WebGL vertex shaders and simplified boundary estimations.
      </p>
      <p>
        They are NOT verified non-linear solvers (such as ANSYS, Abaqus, Nastran, or COMSOL Multiphysics). Do NOT rely on browser-simulated stress contours for:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
        <li>Aerospace propulsion or flight-control brackets;</li>
        <li>Automotive suspension, steering knuckle, or roll-cage assemblies;</li>
        <li>Pressure vessels, boilers, or cryogenic fluid containers;</li>
        <li>High-voltage electrical enclosures or explosive hazard housings.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        2. Material Anisotropy & Additive Manufacturing Realities
      </h3>
      <p>
        Material presets in Polystrukt (e.g., Titanium Ti-6Al-4V, Aluminum 7075-T6, PEEK, Inconel 718) represent idealized isotropic laboratory constants. Actual manufactured components display:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
        <li><strong>FDM / SLA / SLS Layer Delamination:</strong> Z-axis tensile yield strength is typically 30% to 60% lower than XY-plane strength.</li>
        <li><strong>DMLS / SLM Metal Residual Stress:</strong> Rapid laser thermal gradients cause internal warping, requiring vacuum stress-relief annealing and Hot Isostatic Pressing (HIP) not modeled in browser previews.</li>
        <li><strong>CNC Tool Clearance:</strong> Generative internal cavities may contain inaccessible undercuts impossible for 3-axis or 5-axis end mills to clear.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        3. Professional Engineer (PE) Sign-Off Requirement
      </h3>
      <p>
        Pursuant to statutory professional licensing laws in the United States, European Union, United Kingdom, and Canada, the practice of engineering requires licensure by state/national boards. Polystrukt output files (CAD/CAM, PDF blueprints, GD&T drawings) are unsealed working drafts and do not carry an engineering seal or stamp.
      </p>
      <p className="font-mono text-zinc-400 text-[11px] p-3 rounded-xl bg-zinc-900 border border-white/5">
        "I acknowledge that any physical manufacture of geometry generated via Polystrukt is undertaken at my own sole risk and requires independent structural validation by a licensed engineer."
      </p>
    </section>
  </div>
);

const PrivacyPolicyContent: React.FC = () => (
  <div className="space-y-6 max-w-4xl">
    {/* Plain-Language Summary Box */}
    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 space-y-3">
      <div className="flex items-center gap-2 font-bold font-mono text-sm uppercase tracking-wide text-white">
        <Shield size={16} className="text-emerald-400" />
        Privacy Policy & Regulatory Compliance (GDPR, CCPA/CPRA)
      </div>
      <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1.5 text-xs text-zinc-300">
        <p className="font-bold text-emerald-400 font-mono text-[10.5px] uppercase tracking-wider">Quick Plain-English Summary:</p>
        <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
          <li><strong>No Data Sales:</strong> We never sell, rent, or monetize your personal or company information.</li>
          <li><strong>CAD Privacy:</strong> Your proprietary 3D geometry and engineering prompts are strictly private and never used to train public AI foundation models.</li>
          <li><strong>Essential Storage Only:</strong> We only store what is necessary to authenticate your login and save your active CAD workspace.</li>
          <li><strong>Your Control:</strong> You can view, export, or permanently delete your account and all associated CAD files at any time.</li>
        </ul>
      </div>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        1. Information We Collect
      </h3>
      <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
        <li><strong>Identity & Account Data:</strong> Email address, hashed password, professional username, and assigned organizational role.</li>
        <li><strong>Engineering Prompts & CAD Models:</strong> Text prompts submitted to the synthesis core, parametric values, uploaded 2D sketch attachments, and saved 3D scene states.</li>
        <li><strong>Technical & Session Telemetry:</strong> IP addresses, browser fingerprint, WebGL renderer specs, and authentication session tokens.</li>
        <li><strong>Google OAuth Data:</strong> When signing in with Google, we receive your email and profile UID via secure OIDC tokens.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        2. Legal Basis for Processing (GDPR Article 6)
      </h3>
      <p>We process your data under the following lawful bases:</p>
      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
        <li><strong>Contractual Necessity:</strong> To authenticate your account, synthesize requested CAD geometry, and persist your engineering workspace.</li>
        <li><strong>Legitimate Interests:</strong> To detect distributed denial-of-service (DDoS) attacks, enforce API rate limits, and maintain software security.</li>
        <li><strong>Legal Obligation:</strong> To maintain compliance with export control laws and financial accounting records.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        3. Sub-Processors & Artificial Intelligence Models
      </h3>
      <p>
        To execute procedural CAD synthesis, user prompts are sent via encrypted TLS 1.3 connections to our dedicated backend endpoints, which communicate with Google Gemini Enterprise APIs.
      </p>
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
        <p className="font-bold text-white text-[11px]">Strict Model Training Isolation:</p>
        <p className="text-[11px] text-zinc-400">
          Your engineering prompts and proprietary CAD specifications are NOT used to train public generative AI models without explicit opt-in consent. Google Cloud enterprise commitments govern backend synthesis.
        </p>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        4. California Consumer Privacy Act (CCPA / CPRA) Disclosures
      </h3>
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
        <p className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
          STATUTORY DECLARATION: WE DO NOT SELL OR SHARE YOUR PERSONAL DATA
        </p>
        <p className="text-[11px] text-zinc-300">
          Polystrukt has not sold or shared any consumer personal data for cross-context behavioral advertising or monetary consideration in the preceding 12 months, and will not do so.
        </p>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        5. Your Rights (GDPR Articles 15–22 & CCPA)
      </h3>
      <p>You possess the unconditional statutory right to:</p>
      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
        <li><strong>Access & Portability:</strong> Obtain a copy of all personal and design data in structured JSON format (use the "Data Rights & Erasure" tab).</li>
        <li><strong>Correction:</strong> Correct inaccurate profile information.</li>
        <li><strong>Erasure ("Right to be Forgotten"):</strong> Request and execute the total permanent deletion of your account, workspace state, and design history.</li>
        <li><strong>Lodge a Complaint:</strong> You have the right to lodge a complaint with your local EU Data Protection Authority or the California Privacy Protection Agency (CPPA).</li>
      </ul>
    </section>
  </div>
);

const CookiePolicyContent: React.FC = () => (
  <div className="space-y-6 max-w-4xl">
    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
      <div className="flex items-center gap-2 font-bold font-mono text-sm uppercase tracking-wide text-white mb-1">
        <Cookie size={16} className="text-indigo-400" />
        Cookie & Browser Local Storage Policy (ePrivacy Directive)
      </div>
      <p className="text-[11px] leading-relaxed">
        Under the EU ePrivacy Directive (Directive 2002/58/EC) and GDPR, we inform you regarding our use of cookies and HTML5 LocalStorage keys.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        1. Essential Technical Storage (Strictly Necessary)
      </h3>
      <p>
        These storage keys are strictly necessary to deliver the requested service and cannot be turned off. They do not track your browsing across other sites.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px] border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
            <tr>
              <th className="p-3 border-b border-white/10">Key Name</th>
              <th className="p-3 border-b border-white/10">Type</th>
              <th className="p-3 border-b border-white/10">Purpose</th>
              <th className="p-3 border-b border-white/10">Lifespan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            <tr>
              <td className="p-3 text-indigo-300">auth-storage</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Stores encrypted JWT authentication tokens and session credentials</td>
              <td className="p-3">24 Hours / Revocation</td>
            </tr>
            <tr>
              <td className="p-3 text-indigo-300">polystrukt_cookie_consent</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Remembers your cookie and legal acknowledgment choices</td>
              <td className="p-3">1 Year</td>
            </tr>
            <tr>
              <td className="p-3 text-indigo-300">polystrukt_theme</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Preserves your visual interface preference (Dark / Light)</td>
              <td className="p-3">Persistent</td>
            </tr>
            <tr>
              <td className="p-3 text-indigo-300">cad-history-storage</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Autosaves local workspace scene graphs to prevent data loss on browser crash</td>
              <td className="p-3">Persistent until cleared</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
        2. No Third-Party Tracking Pixels
      </h3>
      <p>
        Polystrukt does NOT load intrusive third-party advertising pixels, social network tracking beacons (e.g., Meta Pixel, TikTok Pixel), or commercial surveillance scripts.
      </p>
    </section>
  </div>
);

const DataRightsContent: React.FC<{
  user: any;
  onExport: () => void;
  exportSuccess: boolean;
  deleteConfirmText: string;
  setDeleteConfirmText: (val: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
  deleteSuccess: boolean;
}> = ({
  user,
  onExport,
  exportSuccess,
  deleteConfirmText,
  setDeleteConfirmText,
  onDelete,
  isDeleting,
  deleteSuccess
}) => (
  <div className="space-y-8 max-w-4xl">
    {/* Export Section */}
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Download size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
            GDPR Article 20: Data Portability & Archive Export
          </h3>
          <p className="text-[11px] text-zinc-400">
            Download a machine-readable JSON archive of your personal profile, local design history, and compliance records.
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-[11px] font-mono text-zinc-400">
          Account Subject: <span className="text-zinc-200 font-bold">{user?.email || 'Active Guest Session'}</span>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
        >
          {exportSuccess ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Export Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download GDPR Data Archive</span>
            </>
          )}
        </button>
      </div>
    </div>

    {/* Deletion Section */}
    <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <Trash2 size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
            GDPR Article 17: Right to Erasure ("Right to be Forgotten")
          </h3>
          <p className="text-[11px] text-red-300/80">
            Permanently erase your active session, design history nodes, autosaved workspace state, and local storage keys.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-red-200/90 leading-relaxed space-y-2">
        <p className="font-bold uppercase tracking-wide text-red-300">WARNING: THIS ACTION IS IRREVERSIBLE</p>
        <p>
          Executing erasure will immediately destroy all local parametric scene graphs, revoke your active authentication token, and purge stored workspace identifiers.
        </p>
      </div>

      {deleteSuccess ? (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-center">
          Data erasure successfully executed. Reloading workspace environment...
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <label className="block text-[11px] font-mono text-zinc-400">
            Type <span className="text-red-400 font-bold">DELETE</span> below to authorize irreversible erasure:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-red-500/50"
            />
            <button
              onClick={onDelete}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Trash2 size={16} />
              <span>{isDeleting ? 'Erasing...' : 'Authorize Permanent Erasure'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
