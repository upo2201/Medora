import React, { useState, useEffect } from 'react';
import { Globe, Copy, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const TunnelStatusBanner: React.FC = () => {
  const [tunnel, setTunnel] = useState<{
    public_testing_mode: boolean;
    status: 'connected' | 'disconnected';
    tunnel_url: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const res = await api.getTunnelStatus();
        if (isMounted) setTunnel(res);
      } catch {
        // Silently ignore if endpoint not present
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!tunnel || !tunnel.public_testing_mode || !tunnel.tunnel_url) {
    return null;
  }

  // Never display developer indicator on public emergency page
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/emergency')) {
    return null;
  }

  const handleCopy = () => {
    if (tunnel.tunnel_url) {
      navigator.clipboard.writeText(tunnel.tunnel_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isConnected = tunnel.status === 'connected';

  return (
    <aside
      aria-label="Developer Tunnel Status"
      className="bg-emerald-950/90 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800/80 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>

          <span className="font-semibold text-emerald-200 uppercase tracking-wider text-[10px]">
            Public Testing Mode
          </span>
          <span className="text-emerald-400/60 hidden sm:inline">•</span>
          <span className="text-emerald-300 font-mono text-[11px] truncate">
            {tunnel.tunnel_url}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[11px] font-medium border border-emerald-700/60 transition-colors"
            title="Copy ngrok Public URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Public URL'}</span>
          </button>

          <a
            href={tunnel.tunnel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-300 hover:text-white text-[11px] transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
