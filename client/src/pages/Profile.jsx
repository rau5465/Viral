import React, { useState } from 'react';
import { User, Mail, Phone, Gift, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!fullName) return toast.warning('Name cannot be empty.');

    setLoading(true);
    try {
      await apiService.updateProfile({ full_name: fullName });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page-offset" style={{ maxWidth: '680px', margin: '0 auto', padding: '52px 20px 30px 20px' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{user?.full_name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className={`badge badge-${user?.level || 'bronze'}`}>
                {user?.level || 'Bronze'} Tier
              </span>
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> {user?.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <User
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="form-input"
                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)', opacity: 0.8 }}
              />
              <Mail
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                readOnly
                value={user?.mobile || ''}
                className="form-input"
                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)', opacity: 0.8 }}
              />
              <Phone
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Unique Referral Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                readOnly
                value={user?.referral_code || ''}
                className="form-input"
                style={{
                  paddingLeft: '40px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#fdcb6e',
                }}
              />
              <Gift
                size={18}
                color="#fdcb6e"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
