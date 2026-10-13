import React from 'react';
import { X, Keyboard, Smartphone, Monitor } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  isMobileFrame,
  onToggleFrame,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '↑ / ↓', desc: 'Scroll up or down to next / previous video' },
    { key: 'Space', desc: 'Play or pause current video' },
    { key: 'M', desc: 'Mute or unmute sound' },
    { key: 'L', desc: 'Like video (or double-tap anywhere on screen)' },
    { key: 'C', desc: 'Open video comments drawer' },
    { key: 'S', desc: 'Open share sheet & copy link' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-white"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-[#25F4EE]" />
            <h3 className="font-bold text-sm">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-neutral-800/80 my-3">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="py-2.5 flex items-center justify-between">
              <span className="text-xs text-neutral-300">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-[#25F4EE]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">Desktop View Mode:</span>
          <button
            onClick={onToggleFrame}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span>Switch to Full Window</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#FE2C55]" />
                <span>Switch to Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
