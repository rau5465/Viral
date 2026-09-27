import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Users,
  Award,
  UploadCloud,
  Send,
  FileImage,
  X,
  Clock,
  Mail,
  Phone,
  BarChart3,
  Sparkles,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const YouTubeIcon = ({ size = 24, color = '#ff0000' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
      fill={color}
    />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff" />
  </svg>
);

const Partners = () => {
  const toast = useToast();

  // Campaign Calculator State
  const [calcType, setCalcType] = useState('youtube'); // youtube, website, app, survey
  const [calcVolume, setCalcVolume] = useState(2500);

  // Proposal Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    partner_type: 'YouTube Creator',
    target_url: '',
    budget_range: '₹5,000 - ₹15,000',
    target_actions: '2,500',
    campaign_details: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const partnerTypes = [
    'YouTube Creator / Influencer',
    'Website Owner / Blogger',
    'Mobile App Developer / Publisher',
    'Brand Advertiser / Agency',
    'Direct Ad Poster / Affiliate',
  ];

  const budgetRanges = [
    '₹2,500 - ₹5,000 (Starter Test)',
    '₹5,000 - ₹15,000 (Growth Campaign)',
    '₹15,000 - ₹50,000 (Scale & DAU Surge)',
    '₹50,000 - ₹2,00,000+ (Enterprise Blitz)',
  ];

  // Pricing formula estimate for calculator
  const getPricingEstimate = () => {
    switch (calcType) {
      case 'youtube':
        // ~₹3.5 per verified Google OAuth subscriber
        return {
          rate: '₹3.50',
          total: Math.round(calcVolume * 3.5),
          timeframe: calcVolume <= 1000 ? '24 - 48 Hours' : '3 - 5 Days',
          metric: 'Verified Subscribers',
          bonus: 'Complimentary Video Watch Time & Likes',
        };
      case 'website':
        // ~₹1.20 per 45s dwell-time active visit
        return {
          rate: '₹1.20',
          total: Math.round(calcVolume * 1.2),
          timeframe: calcVolume <= 5000 ? '24 - 36 Hours' : '2 - 4 Days',
          metric: 'High-Dwell Active Visits',
          bonus: 'Focus-Tab Verification & Zero Bounce Signals',
        };
      case 'app':
        // ~₹6.50 per verified install & open
        return {
          rate: '₹6.50',
          total: Math.round(calcVolume * 6.5),
          timeframe: calcVolume <= 1000 ? '48 Hours' : '4 - 7 Days',
          metric: 'Verified App Installs & Registrations',
          bonus: 'Play Store Discovery & DAU Retention',
        };
      case 'survey':
        // ~₹5.00 per completed multi-question feedback survey
        return {
          rate: '₹5.00',
          total: Math.round(calcVolume * 5.0),
          timeframe: '24 - 48 Hours',
          metric: 'Detailed Survey Responses',
          bonus: '100% Filtered Demographic Insights',
        };
      default:
        return { rate: '₹2.00', total: calcVolume * 2, timeframe: '48 Hours', metric: 'Actions', bonus: '' };
    }
  };

  const pricing = getPricingEstimate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Attachment size exceeds 10MB limit.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.warning('Please enter your contact name.');
    if (!formData.email.trim()) return toast.warning('Please enter your work email.');
    if (!formData.phone.trim()) return toast.warning('Please enter your phone or WhatsApp number.');
    if (!formData.target_url.trim()) return toast.warning('Please provide your channel, website, or app URL.');
    if (!formData.campaign_details.trim()) return toast.warning('Please describe your campaign objective.');

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formData.phone.trim());
      data.append(
        'subject',
        `[Partner Proposal] ${formData.partner_type} - ${formData.company || formData.name}`
      );
      data.append(
        'message',
        `PARTNER PROPOSAL DETAILS:
---------------------------------------------
Organization / Channel: ${formData.company || 'Not Specified'}
Partner Type: ${formData.partner_type}
Target URL: ${formData.target_url}
Budget Range: ${formData.budget_range}
Target Actions / Volume: ${formData.target_actions}

Campaign Objectives & Instructions:
${formData.campaign_details.trim()}`
      );

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const res = await apiService.submitContact(data);

      setSubmittedData(res.data || res.contact || res);
      toast.success('Your partner proposal has been submitted! Our partnerships team will contact you shortly.');

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        partner_type: 'YouTube Creator',
        target_url: '',
        budget_range: '₹5,000 - ₹15,000',
        target_actions: '2,500',
        campaign_details: '',
      });
      handleRemoveFile();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to submit proposal. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container page-header-offset" style={{ maxWidth: '1140px', margin: '0 auto', padding: '64px 20px 100px 20px' }}>
      {/* Hero Badge & Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 48px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 238, 253, 0.12)',
            border: '1px solid rgba(0, 238, 253, 0.35)',
            borderRadius: '30px',
            padding: '6px 18px',
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Sparkles size={16} /> Creator &amp; Advertiser Growth Engine
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '18px',
            letterSpacing: '-0.5px',
          }}
        >
          Grow Your YouTube Channel, Website &amp; App with{' '}
          <span style={{ color: '#00EEFD', textShadow: '0 0 20px rgba(0,238,253,0.45)' }}>
            100% Real Indian Users
          </span>
        </h1>

        <p style={{ color: 'var(--text-sub)', fontSize: '1.15rem', lineHeight: '1.65', marginBottom: '28px' }}>
          Stop wasting money on bot networks, dead subscribers, and click fraud. <strong>FAR (Forget About Recharge)</strong>{' '}
          rewards real mobile phone users across Jio, Airtel, Vi, and BSNL to complete your custom tasks. You get guaranteed human actions; users get free mobile airtime.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <a
            href="#proposal-form"
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Launch a Campaign <ArrowRight size={18} />
          </a>
          <a
            href="#calculator"
            className="btn btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Calculate Reach &amp; Budget
          </a>
        </div>
      </div>

      {/* Trust & Performance Proof Strip */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          padding: '28px',
          marginBottom: '56px',
          textAlign: 'center',
          borderColor: 'rgba(0, 238, 253, 0.25)',
        }}
      >
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent)' }}>100%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified Real Humans (0% Bots)
          </div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#00e699' }}>OAuth 2.0</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Official YouTube API Verification
          </div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fdcb6e' }}>&lt; 2 Hours</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fast Campaign Launch SLA
          </div>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a29bfe' }}>22 Circles</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pan-India Telecom Geographic Reach
          </div>
        </div>
      </div>

      {/* PARTNER SEGMENTS: 3 Tailored Value Propositions */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Tailored Solutions For Every Growth Goal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Whether you want YouTube subscribers, high-dwell website traffic, or active mobile app installs, we have the ideal campaign model.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: YouTubers & Creators */}
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid #ff0000',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(255, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4d4d',
                marginBottom: '20px',
              }}
            >
              <YouTubeIcon size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              For YouTubers &amp; Content Creators
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Overcome the dreaded algorithm freeze. Acquire authentic, real-human subscribers who watch your videos, boost your channel authority, and help you reach monetization thresholds.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: '24px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Official Google/YouTube OAuth Verification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Zero drop-off guarantee (Anti-unsub enforcement)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Reaches 1,000 Sub / 4,000 Watch Hr Milestones
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> 100% Compliant with YouTube Community Guidelines
              </li>
            </ul>

            <a
              href="#proposal-form"
              onClick={() => setFormData((prev) => ({ ...prev, partner_type: 'YouTube Creator / Influencer' }))}
              className="btn btn-secondary"
              style={{ textAlign: 'center', fontWeight: 600, padding: '10px' }}
            >
              Submit Channel Proposal →
            </a>
          </div>

          {/* Card 2: Website Owners & Bloggers */}
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid var(--accent)',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(0, 238, 253, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                marginBottom: '20px',
              }}
            >
              <Globe size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              For Website Owners &amp; Bloggers
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Tired of bounce rates from click farms? Our users spend a verified 30 to 60 seconds browsing your content, reading your articles, exploring products, and triggering ad impressions.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: '24px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Active Tab Focus &amp; Countdown Timer Verification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Lowers Bounce Rate &amp; Improves SEO Engagement
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Real Indian ISP IP addresses (Jio, Airtel, Vi, BSNL)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> High CTR on your on-page banners &amp; affiliate links
              </li>
            </ul>

            <a
              href="#proposal-form"
              onClick={() => setFormData((prev) => ({ ...prev, partner_type: 'Website Owner / Blogger' }))}
              className="btn btn-secondary"
              style={{ textAlign: 'center', fontWeight: 600, padding: '10px' }}
            >
              Submit Website Campaign →
            </a>
          </div>

          {/* Card 3: App Developers & Ad Posters */}
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid #00e699',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(0, 230, 153, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00e699',
                marginBottom: '20px',
              }}
            >
              <Smartphone size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              For App Developers &amp; Ad Agencies
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Drive high-intent mobile app installs, active registrations, user reviews, and product trials. Pay strictly for completed, verified user milestones (CPA / CPI).
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: '24px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Verified Play Store / APK Installation Tracking
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Custom in-app registration &amp; level-up goals
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> 4X Viral Multiplier Booster announcements
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00e699" /> Demographic &amp; Telecom Circle Geo-Targeting
              </li>
            </ul>

            <a
              href="#proposal-form"
              onClick={() => setFormData((prev) => ({ ...prev, partner_type: 'Mobile App Developer / Publisher' }))}
              className="btn btn-secondary"
              style={{ textAlign: 'center', fontWeight: 600, padding: '10px' }}
            >
              Submit App / Ad Proposal →
            </a>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS: THE WIN-WIN FLYWHEEL */}
      <div className="glass-card" style={{ padding: '36px 32px', marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            The Transparent Win-Win Flywheel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            How your advertising budget translates into verified human attention and community rewards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
              1. Submit Task &amp; Budget
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Specify your target URL, desired actions (subscribers, visits, installs), and budget. Our team aligns the task parameters within 2 hours.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: '#fdcb6e', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
              2. Distributed to Users
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Your campaign is featured directly on the FAR Earn dashboard and broadcasted across our 4X referral community channels.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: '#00e699', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
              3. Automated Verification
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Actions are strictly validated through Google OAuth, dwell-time timers, or APK verification before any credit is released.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: '#a29bfe', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
              4. Guaranteed ROI
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Users redeem their earned credits for prepaid recharge. You receive full performance telemetry and genuine, permanent digital growth.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CAMPAIGN REACH & BUDGET CALCULATOR */}
      <div id="calculator" className="glass-card" style={{ padding: '36px 32px', marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <BarChart3 size={24} color="var(--accent)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Interactive Campaign Estimator
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Select your objective and choose your target action volume to preview transparent campaign estimates:
        </p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { id: 'youtube', label: 'YouTube Subscribers', icon: YouTubeIcon },
            { id: 'website', label: 'Website Visits (45s Dwell)', icon: Globe },
            { id: 'app', label: 'App Installs & Trial', icon: Smartphone },
            { id: 'survey', label: 'Surveys & Market Feedback', icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const active = calcType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCalcType(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                  background: active ? 'rgba(0, 238, 253, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#fff' : 'var(--text-muted)',
                }}
              >
                <Icon size={16} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Volume Presets */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
            Target Engagement Volume: <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{calcVolume.toLocaleString()} Verified Actions</strong>
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {[500, 1000, 2500, 5000, 10000].map((v) => (
              <button
                key={v}
                onClick={() => setCalcVolume(v)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: calcVolume === v ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                  background: calcVolume === v ? 'rgba(0, 238, 253, 0.2)' : 'transparent',
                  color: calcVolume === v ? '#fff' : 'var(--text-muted)',
                }}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="range"
            min="250"
            max="15000"
            step="250"
            value={calcVolume}
            onChange={(e) => setCalcVolume(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
        </div>

        {/* Estimated Output Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 238, 253, 0.08), rgba(10, 13, 18, 0.9))',
            border: '1px solid rgba(0, 238, 253, 0.3)',
            borderRadius: '14px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Investment</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>
              ₹{pricing.total.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Effective rate: ~{pricing.rate} per action
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Fulfillment SLA</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {pricing.timeframe}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#00e699' }}>✓ 100% Auditable Telemetry</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Included Perks</div>
            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{pricing.bonus}</div>
          </div>

          <div>
            <a
              href="#proposal-form"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  target_actions: calcVolume.toLocaleString(),
                  budget_range: `₹${pricing.total.toLocaleString()}`,
                }));
              }}
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center', padding: '12px' }}
            >
              Lock In This Proposal
            </a>
          </div>
        </div>
      </div>

      {/* PROPOSAL & CAMPAIGN SUBMISSION FORM */}
      <div id="proposal-form" className="glass-card" style={{ padding: '36px 32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            <Flame size={16} /> Fast-Track Partner Application
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            Submit Your Campaign Proposal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Provide your campaign goals below. Our growth team will review your requirements, prepare your task setup, and send you the onboarding preview within 2 hours.
          </p>
        </div>

        {submittedData ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(0, 230, 153, 0.15)',
                color: '#00e699',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <CheckCircle2 size={42} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              Partner Proposal Received!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 24px auto' }}>
              Thank you for choosing FAR. Your proposal has been dispatched to our partnerships desk. Our growth manager will reach out to you at{' '}
              <strong style={{ color: '#fff' }}>{submittedData.email}</strong> or via WhatsApp at{' '}
              <strong style={{ color: '#00e699' }}>{submittedData.phone}</strong>.
            </p>

            <div
              style={{
                maxWidth: '520px',
                margin: '0 auto 28px auto',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Proposal ID:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>#{submittedData.id || 'NEW'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: '#00e699', fontWeight: 600 }}>Under Review (Priority SLA)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Official Contact Desk:</span>
                <span style={{ color: '#fff' }}>contact@forgetaboutrecharge.com</span>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setSubmittedData(null)}
              style={{ padding: '12px 28px' }}
            >
              Submit Another Campaign
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Grid 1: Name, Company, Email, Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Your Name <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Aman Verma"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Channel / Company / Brand Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. TechGyan Hindi / AppStudio"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Work / Contact Email <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="partner@yourbrand.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Phone / WhatsApp Number <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number for WhatsApp onboarding"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Grid 2: Partner Type, Target Link, Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Partner Category <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <select
                  name="partner_type"
                  value={formData.partner_type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  {partnerTypes.map((t) => (
                    <option key={t} value={t} style={{ background: '#12161f', color: '#fff' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target URL (Channel, Website, or Play Store) <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="url"
                  name="target_url"
                  value={formData.target_url}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/@channel or https://..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Anticipated Campaign Budget
                </label>
                <select
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  {budgetRanges.map((b) => (
                    <option key={b} value={b} style={{ background: '#12161f', color: '#fff' }}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Desired Engagement Volume (Target Actions)
                </label>
                <input
                  type="text"
                  name="target_actions"
                  value={formData.target_actions}
                  onChange={handleInputChange}
                  placeholder="e.g. 1,000 subscribers, 5,000 site visits"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Campaign Instructions / Objectives */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Campaign Objectives &amp; Task Requirements <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <textarea
                name="campaign_details"
                value={formData.campaign_details}
                onChange={handleInputChange}
                rows={4}
                placeholder="What exactly should users do? (e.g., 'Subscribe to YouTube channel TechGyan and watch latest video for 60s', or 'Visit our website blog and explore pricing page', or 'Install our finance app and complete mobile OTP signup')..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Image / Creative / Pitch Deck Attachment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Attach Creative / Banner / Channel Screenshot{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional - Compressed on Server)</span>
              </label>

              {!selectedFile ? (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                    border: '2px dashed var(--border-glass)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <UploadCloud size={28} color="var(--accent)" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    Click to upload creative image or channel banner
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    PNG, JPG, or WEBP up to 10MB (automatically compressed)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(0, 238, 253, 0.08)',
                    border: '1px solid rgba(0, 238, 253, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Creative Preview"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <FileImage size={24} color="var(--accent)" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB • Image ready for backend compression
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove attachment"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 24px',
                fontWeight: 800,
                fontSize: '1rem',
                marginTop: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', margin: 0 }} />
                  <span>Submitting Campaign Proposal...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Campaign Proposal &amp; Get Custom Plan</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Or email our partnerships director directly at{' '}
              <a
                href="mailto:contact@forgetaboutrecharge.com?subject=Partner%20Proposal"
                style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                contact@forgetaboutrecharge.com
              </a>
            </div>
          </form>
        )}
      </div>

      {/* PARTNER FAQ SECTION */}
      <div style={{ marginTop: '64px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '28px' }}>
          Frequently Asked Questions by Partners
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              How do you guarantee 0% bot traffic?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
              Every FAR user is authenticated via SMS OTP on an active Indian telecommunications SIM card (Jio, Airtel, Vi, BSNL). For YouTube, actions require genuine Google OAuth authentication. Our proprietary anti-farming heuristics detect and ban automated scripts instantly.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Is this compliant with YouTube Terms of Service?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
              Yes. We do not use simulated bot hits or headless browser scrapers. Real human creators and mobile users willingly discover, subscribe to, and engage with your channel through official Google OAuth 2.0 authorization.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              How quickly will my campaign go live?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
              Once you submit your proposal, our partnerships team sets up your campaign parameters, performs link verification, and releases it to our active user feed within <strong>2 to 4 hours</strong>.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              What payment methods are supported?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
              We support instant UPI (Google Pay, PhonePe, Paytm), Net Banking, Credit/Debit Cards, and Corporate Invoices with GST compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
