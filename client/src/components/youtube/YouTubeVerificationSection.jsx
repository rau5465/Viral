import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Unlink,
  RefreshCw,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const YouTubeIcon = ({ size = 20, color = '#ff0000' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const YouTubeVerificationSection = () => {
  const toast = useToast();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState({
    isUserConnected: false,
    connectedAccount: null,
    channels: [],
  });
  const [verifyingChannelId, setVerifyingChannelId] = useState(null);
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [batchVerifying, setBatchVerifying] = useState(false);

  const fetchChannels = async () => {
    try {
      const res = await apiService.getYouTubeChannels();
      if (res && res.data) {
        setPartnerData(res.data);
      }
    } catch (err) {
      console.error('Failed to load YouTube partner channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();

    // Check OAuth redirect parameters in URL
    const params = new URLSearchParams(window.location.search);
    const ytStatus = params.get('youtube');
    const channelName = params.get('channel');
    const errorMsg = params.get('message');

    if (ytStatus === 'connected') {
      toast.success(
        `🎉 YouTube account connected successfully! ${channelName ? `(${channelName})` : ''}`
      );
      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchChannels();
    } else if (ytStatus === 'error') {
      toast.error(`YouTube connection failed: ${errorMsg || 'Please try again.'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnectYouTube = async () => {
    setConnectingOAuth(true);
    try {
      const res = await apiService.getYouTubeAuthUrl();
      if (res.authUrl) {
        // Redirect browser to Google OAuth consent screen
        window.location.assign(res.authUrl);
      } else {
        toast.error('Could not generate YouTube authentication link.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate Google YouTube authorization.');
    } finally {
      setConnectingOAuth(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your YouTube account?')) {
      return;
    }

    try {
      await apiService.disconnectYouTube();
      toast.success('YouTube account disconnected.');
      fetchChannels();
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect YouTube account.');
    }
  };

  const handleVerifyAndClaim = async (channel) => {
    if (!partnerData.isUserConnected) {
      toast.info('Please connect your YouTube account first to verify subscriptions.');
      handleConnectYouTube();
      return;
    }

    setVerifyingChannelId(channel.channelId);
    try {
      const res = await apiService.verifyAndClaimYouTube(channel.channelId);

      if (res.status === 'success') {
        toast.success(res.message || `+${res.creditsAwarded} Credits Claimed!`);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_e) {
          // ignore animation error
        }

        await refreshUser();
        await fetchChannels();
      } else {
        toast.warning(
          res.message ||
            'Subscription not found. Please click "Subscribe on YouTube", wait 3 seconds, and try again!'
        );
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please ensure you are subscribed.');
    } finally {
      setVerifyingChannelId(null);
    }
  };

  const handleVerifyAll = async () => {
    if (!partnerData.isUserConnected) {
      toast.info('Please connect your YouTube account first.');
      handleConnectYouTube();
      return;
    }

    setBatchVerifying(true);
    try {
      const res = await apiService.verifyAllYouTube();
      if (res.results) {
        let newSubscriptions = 0;
        let alreadyClaimed = 0;

        for (const item of res.results) {
          if (item.subscribed && !item.creditsClaimed) {
            // Attempt auto-claim
            try {
              const claimRes = await apiService.verifyAndClaimYouTube(item.channelId);
              if (claimRes.status === 'success') {
                newSubscriptions++;
              }
            } catch (_err) {
              // ignore single claim error in batch
            }
          } else if (item.creditsClaimed) {
            alreadyClaimed++;
          }
        }

        if (newSubscriptions > 0) {
          toast.success(`🎉 Verified & claimed rewards for ${newSubscriptions} channel(s)!`);
          try {
            confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
          } catch (_e) {
            // ignore confetti error
          }
          await refreshUser();
        } else {
          toast.info(
            `Status check complete. ${alreadyClaimed} channel(s) already claimed.`
          );
        }
        await fetchChannels();
      }
    } catch (err) {
      toast.error(err.message || 'Batch verification encountered an error.');
    } finally {
      setBatchVerifying(false);
    }
  };

  const { isUserConnected, connectedAccount, channels } = partnerData;

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* YouTube Hub Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.08) 0%, rgba(20, 20, 35, 0.6) 100%)',
          border: '1px solid rgba(255, 0, 0, 0.2)',
          borderRadius: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <YouTubeIcon size={22} color="#ff3333" />
              </div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Partner YouTube Channels</h2>
              <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={13} style={{ marginRight: '3px' }} /> Auto-Verified
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: 0 }}>
              Subscribe to official partner channels to earn instant recharge credits. Subscriptions are
              verified privately and securely via the YouTube Data API v3.
            </p>
          </div>

          {/* Account Status / Connect Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isUserConnected && connectedAccount ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {connectedAccount.avatarUrl ? (
                  <img
                    src={connectedAccount.avatarUrl}
                    alt="YouTube Avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <YouTubeIcon size={24} color="#ff3333" />
                )}
                <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {connectedAccount.channelTitle || connectedAccount.email}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#00b894', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b894' }}></span> Connected
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect YouTube Account"
                  className="btn btn-secondary"
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    marginLeft: '4px',
                    color: 'var(--text-sub)',
                  }}
                >
                  <Unlink size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectYouTube}
                disabled={connectingOAuth}
                className="btn btn-primary"
                style={{
                  background: '#ff0000',
                  borderColor: '#ff0000',
                  padding: '10px 20px',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(255, 0, 0, 0.3)',
                }}
              >
                <YouTubeIcon size={18} color="#ffffff" />
                {connectingOAuth ? 'Redirecting...' : 'Connect YouTube Account'}
              </button>
            )}

            {isUserConnected && (
              <button
                onClick={handleVerifyAll}
                disabled={batchVerifying}
                className="btn btn-secondary"
                style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                title="Verify all partner subscriptions in batch"
              >
                <RefreshCw size={15} className={batchVerifying ? 'spinner' : ''} />
                {batchVerifying ? 'Checking...' : 'Check All'}
              </button>
            )}
          </div>
        </div>

        {/* Info notice if not connected */}
        {!isUserConnected && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <AlertCircle size={15} color="#fdcb6e" style={{ flexShrink: 0 }} />
            <span>
              Connect your YouTube/Google account with read-only permissions so our system can verify you
              subscribed without needing screenshots or public subscriber lists.
            </span>
          </div>
        )}
      </div>

      {/* Partner Channels Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading partner channels...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No partner channels currently active.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {channels.map((channel) => {
            const isVerifying = verifyingChannelId === channel.channelId;

            return (
              <div
                key={channel.id}
                className="glass-card interactive"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: channel.creditsClaimed
                    ? '1px solid rgba(0, 184, 148, 0.3)'
                    : '1px solid var(--border-glass)',
                  background: channel.creditsClaimed
                    ? 'linear-gradient(135deg, rgba(0, 184, 148, 0.05) 0%, rgba(20, 24, 33, 0.7) 100%)'
                    : undefined,
                }}
              >
                <div>
                  {/* Top Bar: Avatar & Reward */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {channel.thumbnailUrl ? (
                        <img
                          src={channel.thumbnailUrl}
                          alt={channel.channelTitle}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 0, 0, 0.3)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255, 0, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <YouTubeIcon size={24} color="#ff3333" />
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
                          {channel.channelTitle}
                        </h3>
                        {channel.channelHandle && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {channel.channelHandle}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className="badge badge-gold"
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                      +{channel.creditsReward} CR
                    </span>
                  </div>

                  {/* Channel Description */}
                  {channel.description && (
                    <p
                      style={{
                        fontSize: '0.83rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.5',
                        marginBottom: '16px',
                        minHeight: '38px',
                      }}
                    >
                      {channel.description}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div>
                  {/* Status Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: 'var(--text-sub)',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-glass)',
                      marginBottom: '14px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} />
                      {channel.subscriberCount
                        ? `${(channel.subscriberCount / 1000000).toFixed(1)}M Subscribers`
                        : 'Official Partner'}
                    </span>
                    {channel.creditsClaimed ? (
                      <span style={{ color: '#00b894', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> Claimed
                      </span>
                    ) : channel.isSubscribed ? (
                      <span style={{ color: '#fdcb6e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Award size={13} /> Ready to Claim
                      </span>
                    ) : (
                      <span>Not Subscribed</span>
                    )}
                  </div>

                  {/* Dual Buttons: Open Channel & Verify/Claim */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={channel.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '9px', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      <YouTubeIcon size={15} color="#ff3333" />
                      Subscribe
                      <ExternalLink size={13} />
                    </a>

                    {channel.creditsClaimed ? (
                      <button
                        disabled
                        className="btn btn-secondary"
                        style={{
                          flex: 1.2,
                          padding: '9px',
                          fontSize: '0.85rem',
                          background: 'rgba(0, 184, 148, 0.1)',
                          borderColor: 'rgba(0, 184, 148, 0.3)',
                          color: '#00b894',
                        }}
                      >
                        <CheckCircle2 size={15} /> Verified
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyAndClaim(channel)}
                        disabled={isVerifying}
                        className="btn btn-accent"
                        style={{ flex: 1.2, padding: '9px', fontSize: '0.85rem' }}
                      >
                        {isVerifying ? (
                          'Verifying...'
                        ) : !isUserConnected ? (
                          'Connect & Claim'
                        ) : (
                          <>
                            <Sparkles size={14} /> Verify & Claim
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YouTubeVerificationSection;
