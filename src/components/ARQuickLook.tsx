import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Scan, Share2, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface ARQuickLookProps {
  modelId: string;
}

export const ARQuickLook: React.FC<ARQuickLookProps> = ({ modelId }) => {
  // Mobile deep link simulation
  const arUrl = `${window.location.origin}/ar?id=${modelId}`;

  return (
    <div className="flex flex-col items-center p-6 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Scan className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-syne font-bold text-white">AR Quick-Look</h3>
      </div>

      <div className="relative p-4 bg-white rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.3)]">
        <QRCodeSVG 
          value={arUrl} 
          size={180}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/favicon.ico",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg"
        >
          <Smartphone size={16} />
        </motion.div>
      </div>

      <div className="mt-8 space-y-4 w-full">
        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Share2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-zinc-300">STEP 01</p>
            <p className="text-sm text-zinc-500">Scan QR code using your smartphone camera.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Box className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-zinc-300">STEP 02</p>
            <p className="text-sm text-zinc-500">Enable WebXR permissions to "drop" model into the room.</p>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
        <Share2 size={18} />
        Copy Public AR Link
      </button>
    </div>
  );
};
