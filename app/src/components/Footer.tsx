import React from 'react';
import { DiamondIcon } from './Icons';

export const Footer = () => {
  return (
    <div className="mt-24 mb-12">
        <div className="bg-paperDark text-ink clip-chamfer-lg p-1 border-t-2 border-paper">
            <div className="border border-ink/10 clip-chamfer-md p-8 md:p-12 relative overflow-hidden min-h-[600px]">
                
                {/* Background Grid for this section specifically */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                {/* Header */}
                <div className="flex items-center mb-16 border-b border-ink/10 pb-4 relative z-10">
                    <span className="w-3 h-3 bg-accent block mr-4"></span>
                    <span className="font-mono text-sm uppercase tracking-widest font-bold">Enterprise System</span>
                    <div className="flex-1 ml-4 text-ink/20 overflow-hidden whitespace-nowrap text-[10px] font-mono">
                        SECURE_LAYER_04 // PERMISSIONS // AUTH_V2 // ----------------------------------------------------
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <h2 className="font-serif text-[4.5rem] md:text-[5.5rem] leading-[0.9] tracking-tighter mb-8 text-ink">
                                Role-based<br/>access control
                            </h2>
                            <p className="font-sans text-xl leading-relaxed max-w-md font-medium text-ink/80 mb-12">
                                Define granular permissions for every team member. Ensure data security with enterprise-grade scope management and audit logging.
                            </p>
                        </div>

                        {/* Technical List */}
                        <div className="space-y-5 font-mono text-xs md:text-sm tracking-wide mt-auto">
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">01</div>
                                 <span className="font-semibold">SAML / SSO INTEGRATION</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">02</div>
                                 <span className="font-semibold">AUDIT_LOG_RETENTION_FOREVER</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">03</div>
                                 <span className="font-semibold">CUSTOM_SCOPE_DEFINITIONS</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: The Visual (Access Matrix) */}
                    <div className="relative pt-8 lg:pt-0">
                        {/* A dark card representing the system interface */}
                        <div className="bg-ink text-paper p-6 clip-chamfer-md shadow-2xl relative overflow-hidden h-full flex flex-col min-h-[450px]">
                            
                            {/* Terminal Header */}
                            <div className="flex justify-between items-center border-b border-paper/20 pb-4 mb-6 font-mono text-xs">
                                <span className="opacity-50 tracking-widest">SYS.CONFIG.YML</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-paper/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-paper/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                </div>
                            </div>

                            {/* Data Rows */}
                            <div className="space-y-4 flex-1 font-mono text-sm relative z-10">
                                {/* Row 1 */}
                                <div className="bg-paper/10 p-4 border-l-2 border-accent backdrop-blur-sm">
                                    <div className="flex justify-between mb-3 items-baseline">
                                        <span className="text-accent font-bold tracking-wider">ADMIN_ROLE</span>
                                        <span className="opacity-40 text-[10px]">ID: 8F-22</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs opacity-80">
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">✓</span> write_access
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">✓</span> delete_access
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">✓</span> user_mgmt
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">✓</span> billing_view
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="bg-paper/5 p-4 border-l-2 border-paper/30 opacity-70">
                                    <div className="flex justify-between mb-3 items-baseline">
                                        <span className="font-bold tracking-wider">SUPPORT_AGENT</span>
                                        <span className="opacity-40 text-[10px]">ID: 9A-01</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs opacity-60">
                                        <div className="flex items-center gap-2">
                                            <span>•</span> read_tickets
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>•</span> reply_tickets
                                        </div>
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span>×</span> delete_tickets
                                        </div>
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span>×</span> billing_view
                                        </div>
                                    </div>
                                </div>

                                 {/* Row 3 (Visual filler) */}
                                <div className="bg-paper/5 p-4 border-l-2 border-paper/10 opacity-30">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold tracking-wider">OBSERVER</span>
                                        <span className="opacity-40 text-[10px]">ID: 00-XX</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative bottom Code */}
                            <div className="mt-8 pt-4 border-t border-paper/10 text-[10px] font-mono opacity-30 break-all leading-relaxed">
                                0x882A7F...HASH_VERIFIED...Encryption:AES-256...<br/>
                                HANDSHAKE_COMPLETE...ACCESS_GRANTED...
                            </div>
                        </div>
                        
                        {/* Decorative Elements behind/around the dark card */}
                         <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent opacity-10 blur-2xl rounded-full pointer-events-none"></div>
                    </div>
                </div>
                
                {/* Corner Accents on the main container */}
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-ink opacity-20" />
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-ink opacity-20" />
            </div>
        </div>
    </div>
  );
};
