import React from 'react';
import { DiamondIcon } from './Icons';

export const SiteFooter = () => {
  return (
    <footer className="bg-charcoal text-paper border-t border-grid pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-24">
            {/* Col 1: Brand */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent clip-chamfer-sm" />
                    <span className="font-serif text-2xl tracking-tight">System Inc.</span>
                </div>
                <p className="font-sans text-paper/60 text-sm leading-relaxed">
                    Building the operating layer for automated enterprise intelligence.
                </p>
                <div className="mt-auto pt-6">
                     <div className="font-mono text-xs text-paper/40">
                        SF // NY // LDN // TYO
                     </div>
                </div>
            </div>

            {/* Col 2: Product */}
            <div className="flex flex-col gap-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-accent">Product</h4>
                <ul className="space-y-4 font-mono text-sm text-paper/80">
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Features</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Integrations</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Security</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Changelog</a></li>
                </ul>
            </div>

            {/* Col 3: Company */}
            <div className="flex flex-col gap-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-accent">Company</h4>
                <ul className="space-y-4 font-mono text-sm text-paper/80">
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">About</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Careers</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Blog</a></li>
                    <li><a href="#" className="hover:text-white hover:underline decoration-accent underline-offset-4 decoration-2">Contact</a></li>
                </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div className="flex flex-col gap-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-accent">Updates</h4>
                <p className="font-sans text-xs text-paper/60">
                    Subscribe to the engineering log.
                </p>
                <form className="flex flex-col gap-4">
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-accent text-lg">{'>'}</span>
                        <input 
                            type="email" 
                            placeholder="enter_email" 
                            className="w-full bg-transparent border-b border-paper/20 py-3 pl-6 font-mono text-sm focus:outline-none focus:border-accent text-paper placeholder:text-paper/20 transition-colors"
                        />
                    </div>
                    <button className="self-start text-xs font-mono uppercase border border-paper/20 px-4 py-2 hover:bg-paper hover:text-ink transition-colors clip-chamfer-sm">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-paper/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-paper/40 uppercase tracking-wider">
            <div>
                &copy; 2024 SYSTEM INC.
            </div>
            <div className="flex gap-8">
                <a href="#" className="hover:text-paper transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-paper transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-paper transition-colors">System Status: <span className="text-accent">● Online</span></a>
            </div>
        </div>

      </div>
    </footer>
  );
};
