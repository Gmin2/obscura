import { Card } from '../components/Card';
import { TopBar } from '../components/TopBar';
import { Hero } from '../components/Hero';
import { Performance } from '../components/Performance';
import { Infrastructure } from '../components/Infrastructure';
import { SectionHeader } from '../components/SectionHeader';
import { Footer as PrivacyStack } from '../components/Footer';
import { CTA } from '../components/CTA';
import { SiteFooter } from '../components/SiteFooter';
import { IconSmartActions, IconAutoResolve, IconAgentAssist } from '../components/Icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-charcoal text-paper selection:bg-accent selection:text-white overflow-x-hidden font-sans">
      {/* Background Grid - Global */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col w-full">
        <TopBar />
        
        {/* Main Section */}
        <main className="w-full flex-grow">
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Hero />
              
              <Performance />

              <SectionHeader title="How It Works" />

              {/* Card Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative mb-24">
                  <Card
                    variant="accent"
                    number="001"
                    title="Private Orders"
                    icon={<IconSmartActions />}
                    description="Orders stored as encrypted records. Only you can decrypt and view your trading data."
                  />

                  <Card
                    variant="default"
                    number="002"
                    title="Commitments"
                    icon={<IconAutoResolve />}
                    description="Price and amount hidden via cryptographic commitments until order execution."
                  />

                  <Card
                    variant="default"
                    number="003"
                    title="ZK Matching"
                    icon={<IconAgentAssist />}
                    description="Orders matched and verified using zero-knowledge proofs. No data revealed."
                  />
              </div>

              {/* Privacy Stack Section */}
              <PrivacyStack />
              
           </div>
           
           {/* Full width sections, internal containers handle max-width */}
           <Infrastructure />
           
           <CTA />
           
           <SiteFooter />

        </main>
      </div>
    </div>
  );
}
