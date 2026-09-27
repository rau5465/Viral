import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  FileImage,
  Clock,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const ContactUs = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Recharge Delivery / Delay',
    message: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const subjects = [
    'Recharge Delivery / Delay',
    'Task Verification Issue',
    '4X Referral Bonus Question',
    'Account Access & Security',
    'Brand Partnership / Advertising',
    'Bug Report / Feedback',
    'Other General Inquiry',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
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

    if (!formData.name.trim()) return toast.warning('Please enter your name.');
    if (!formData.email.trim()) return toast.warning('Please enter your email.');
    if (!formData.phone.trim()) return toast.warning('Please enter your phone number.');
    if (!formData.message.trim()) return toast.warning('Please enter your message.');

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formData.phone.trim());
      data.append('subject', formData.subject);
      data.append('message', formData.message.trim());

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const res = await apiService.submitContact(data);

      setSubmittedData(res.data || res);
      toast.success('Your message has been sent successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Recharge Delivery / Delay',
        message: '',
      });
      handleRemoveFile();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to submit inquiry. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container page-header-offset" style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 20px 80px 20px' }}>
      {/* Back button */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '24px',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 238, 253, 0.1)',
            border: '1px solid rgba(0, 238, 253, 0.3)',
            borderRadius: '30px',
            padding: '6px 16px',
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Mail size={15} /> 24/7 Dedicated Support
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3rem)',
            fontWeight: 900,
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}
        >
          Contact <span style={{ color: '#00EEFD' }}>FAR</span> Support
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '750px' }}>
          Have a question about your mobile recharge, task credit verifications, or partnership opportunities?
          Fill out the form below or email us directly at{' '}
          <a
            href="mailto:contact@forgetaboutrecharge.com"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            contact@forgetaboutrecharge.com
          </a>
          .
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}
      >
        {/* Left Column: Direct Contact Info & Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              border: '1px solid rgba(0, 238, 253, 0.3)',
              background: 'linear-gradient(135deg, rgba(0, 238, 253, 0.05), rgba(10, 13, 18, 0.8))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(0, 238, 253, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <Mail size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official Email</div>
                <a
                  href="mailto:contact@forgetaboutrecharge.com"
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    textDecoration: 'none',
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                >
                  contact@forgetaboutrecharge.com
                </a>
              </div>
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Clock size={14} color="#00e699" />
              <span>Typical Response Time: Within 4 to 12 Hours</span>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
              Tips for Fast Resolution
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>
                  <strong>Include 10-Digit Mobile Number:</strong> Provide the exact number submitted for recharge.
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>
                  <strong>Attach a Screenshot:</strong> Uploading an image of the error screen or operator balance speeds up investigation.
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>
                  <strong>Check Policy First:</strong> See our{' '}
                  <Link to="/recharge-policy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Recharge Policy
                  </Link>{' '}
                  for standard telecom dispatch processing timelines.
                </span>
              </li>
            </ul>
          </div>

          {/* Security & Zero Cost Promise */}
          <div
            className="glass-card"
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(0, 230, 153, 0.05)',
              borderColor: 'rgba(0, 230, 153, 0.2)',
            }}
          >
            <ShieldCheck size={28} color="#00e699" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
              <strong style={{ color: '#fff' }}>100% Secure Support:</strong> We will never ask for your bank password, debit card number, or OTP. Images uploaded here are compressed securely using modern WebP encryption.
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="glass-card" style={{ padding: '32px' }}>
          {submittedData ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 230, 153, 0.15)',
                  color: '#00e699',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                Message Received!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
                Thank you for reaching out. We have logged your inquiry and our support team will inspect the details and get back to you at{' '}
                <strong style={{ color: '#fff' }}>{submittedData.email}</strong>.
              </p>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ticket ID:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>#{submittedData.id || 'NEW'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span style={{ color: '#fff' }}>{submittedData.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
                  <span style={{ color: '#fff' }}>{submittedData.subject}</span>
                </div>
                {(submittedData.imageUrl || submittedData.image_url || submittedData.image_path) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Attachment:</span>
                    <span style={{ color: '#00e699' }}>✓ Compressed &amp; Uploaded</span>
                  </div>
                )}
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setSubmittedData(null)}
                style={{ padding: '10px 24px' }}
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Send Us a Message
              </h2>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
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

              {/* Email & Phone Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
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
                    Phone Number <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
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

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Inquiry Category <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
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
                  {subjects.map((s) => (
                    <option key={s} value={s} style={{ background: '#12161f', color: '#fff' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Detailed Message <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your issue or question in detail (e.g. recharge date, operator, transaction reference)..."
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

              {/* Image Upload Feature with Compression */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Attach Screenshot / Proof{' '}
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
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <UploadCloud size={28} color="var(--accent)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      Click to upload screenshot
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
                          alt="Upload Preview"
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
                  padding: '14px 20px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginTop: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
                    <span>Compressing &amp; Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
