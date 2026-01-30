import { useState } from 'react';
import {
  Bell,
  LayoutGrid,
  Folder,
  FileText,
  User,
  Home,
  Lock,
  Database,
  Cpu,
  Shield,
  Layers,
  GitBranch,
  Hash,
  Eye,
  Shuffle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from '../components/Tooltip';

type ConceptId = 'records' | 'mappings' | 'transitions' | 'async' | 'commitments' | 'utxo' | 'cross-program' | 'privacy-stack';

interface Concept {
  id: ConceptId;
  title: string;
  icon: any;
  tagline: string;
  aleoFeature: string;
  obscuraUse: string;
  codeExample?: string;
}

const CONCEPTS: Concept[] = [
  {
    id: 'records',
    title: 'Records',
    icon: Lock,
    tagline: 'Private State',
    aleoFeature: 'Encrypted data structures with an owner field. Only the owner can decrypt and use them.',
    obscuraUse: 'Private orders that only the owner can see. Price, amount, and strategy remain hidden from everyone.',
    codeExample: `record Order {
    owner: address,      // Only owner sees this
    order_id: field,
    amount: u128,        // PRIVATE
    limit_price: u128,   // PRIVATE
    salt: scalar,
}`
  },
  {
    id: 'mappings',
    title: 'Mappings',
    icon: Database,
    tagline: 'Public State',
    aleoFeature: 'Key-value storage visible to everyone. Modified only in async function blocks.',
    obscuraUse: 'Store commitments (hashes) not actual values. Public sees order exists, but not the price or amount.',
    codeExample: `// Store COMMITMENTS, not values
mapping order_commitments: field => field;
mapping order_sides: field => bool;

// Public sees: 0x7f8a3b2c...
// Only owner knows: price=50, amount=1000`
  },
  {
    id: 'transitions',
    title: 'Transitions',
    icon: Cpu,
    tagline: 'Off-chain Execution',
    aleoFeature: 'Execute on user\'s machine, generate ZK proof. Validators verify proof, don\'t re-execute.',
    obscuraUse: 'Order creation runs locally. Only the proof is submitted to the network.',
    codeExample: `transition place_order(
    amount: u128,      // Stays private
    limit_price: u128  // Stays private
) -> (Order, Future) {
    // Runs on USER'S machine
    let salt = ChaCha::rand_scalar();
    // Generate ZK proof...
}`
  },
  {
    id: 'async',
    title: 'Async Functions',
    icon: GitBranch,
    tagline: 'On-chain Execution',
    aleoFeature: 'Code that runs on validators after proof verification. Can modify mappings.',
    obscuraUse: 'Store order commitments on-chain. Receives only hashes, never actual price/amount.',
    codeExample: `async function register_order(
    order_id: field,
    commitment: field,  // Just the hash
) {
    // Runs ON-CHAIN
    order_commitments.set(order_id, commitment);
}`
  },
  {
    id: 'commitments',
    title: 'Commitments',
    icon: Hash,
    tagline: 'Hide-then-Reveal',
    aleoFeature: 'Poseidon2::commit_to_field(value, salt) - hides value but allows proving it later.',
    obscuraUse: 'Hide price/amount when placing order. Reveal only at match time. Cannot lie - hash must match.',
    codeExample: `// COMMIT (place order)
let commitment = Poseidon2::commit_to_field(
    (price, amount), salt
);

// VERIFY (match time)
assert(recomputed == stored);`
  },
  {
    id: 'utxo',
    title: 'UTXO Model',
    icon: Shuffle,
    tagline: 'Record Consumption',
    aleoFeature: 'Records consumed as input, new ones created as output. Prevents double-spending.',
    obscuraUse: 'Track partial fills. Original order consumed, new order with updated fill amount created.',
    codeExample: `// Original: filled=0 → CONSUMED
// New: filled=300 → Can match more
// Final: filled=1000 → Complete`
  },
  {
    id: 'cross-program',
    title: 'Cross-Program',
    icon: Layers,
    tagline: 'Modular Design',
    aleoFeature: 'Programs can import and call other programs. Enables composable architecture.',
    obscuraUse: 'order_book.aleo → matching_engine.aleo → settlement.aleo → token.aleo',
  },
  {
    id: 'privacy-stack',
    title: 'Privacy Stack',
    icon: Shield,
    tagline: 'Layered Protection',
    aleoFeature: 'Zero-knowledge proofs at the foundation. Encrypted storage, private execution, selective disclosure.',
    obscuraUse: 'Every layer protects user data while allowing verifiable, correct system operation.',
  }
];

const PRIVACY_LAYERS = [
  { level: 4, name: 'Selective Disclosure', desc: 'View keys for regulators/auditors', color: 'bg-purple-500' },
  { level: 3, name: 'Private Execution', desc: 'Transitions run off-chain, only proofs submitted', color: 'bg-blue-500' },
  { level: 2, name: 'Encrypted Storage', desc: 'Records encrypted, only owner can decrypt', color: 'bg-accent' },
  { level: 1, name: 'Commitment Schemes', desc: 'Public state contains only hashes', color: 'bg-q-green' },
  { level: 0, name: 'Zero-Knowledge Proofs', desc: 'Correctness verified without revealing data', color: 'bg-pink-500' },
];

function Docs() {
  const [activeConcept, setActiveConcept] = useState<ConceptId>('records');

  const currentConcept = CONCEPTS.find(c => c.id === activeConcept)!;

  return (
    <div className="h-screen w-full bg-charcoal p-3 font-sans text-paper overflow-hidden flex flex-col gap-2 relative">

      {/* Dotted Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Navigation Header */}
      <header className="flex items-center justify-between shrink-0 relative z-20 py-1">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center text-ink group-hover:bg-accent/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-mono font-bold text-xs tracking-widest text-paper uppercase">Obscura</span>
          </Link>

          {/* Nav Bar */}
          <div className="bg-ink border border-paper/10 rounded-lg p-0.5 flex items-center gap-0.5">
            <Tooltip text="Home" position="bottom">
              <Link to="/" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><Home size={14} /></Link>
            </Tooltip>
            <Tooltip text="Terminal" position="bottom">
              <Link to="/terminal" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><LayoutGrid size={14} /></Link>
            </Tooltip>
            <Tooltip text="Portfolio" position="bottom">
              <Link to="/portfolio" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><Folder size={14} /></Link>
            </Tooltip>
            <Tooltip text="History" position="bottom">
              <Link to="/history" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><FileText size={14} /></Link>
            </Tooltip>
            <Tooltip text="Profile" position="bottom">
              <Link to="/profile" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><User size={14} /></Link>
            </Tooltip>
          </div>

          {/* Docs indicator */}
          <div className="flex items-center gap-2 text-accent">
            <BookOpen size={14} />
            <span className="font-mono text-xs uppercase tracking-wider">Documentation</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Tooltip text="Notifications" position="bottom">
            <button className="w-7 h-7 bg-ink border border-paper/10 rounded flex items-center justify-center text-paper/50 hover:text-paper hover:border-paper/20 transition-colors">
              <Bell size={14} />
            </button>
          </Tooltip>
          <Link to="/terminal" className="bg-accent text-ink px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-accent/90 transition-colors">
            Launch App <ChevronRight size={12} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative z-10 overflow-hidden">

        {/* Left: Concept Navigation */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2 overflow-auto">
          <div className="bg-ink border border-paper/10 rounded-lg p-3">
            <h2 className="font-serif text-lg text-paper mb-3">Aleo Concepts</h2>
            <div className="space-y-1">
              {CONCEPTS.map((concept) => {
                const Icon = concept.icon;
                const isActive = activeConcept === concept.id;
                return (
                  <button
                    key={concept.id}
                    onClick={() => setActiveConcept(concept.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                      isActive
                        ? 'bg-accent/10 text-accent border border-accent/30'
                        : 'hover:bg-paper/5 text-paper/70 hover:text-paper border border-transparent'
                    }`}
                  >
                    <Icon size={16} />
                    <div>
                      <div className="font-mono text-xs">{concept.title}</div>
                      <div className="text-[10px] text-paper/40">{concept.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Concept Detail */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 overflow-auto">
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const Icon = currentConcept.icon;
                return <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Icon size={20} />
                </div>;
              })()}
              <div>
                <h1 className="font-serif text-2xl text-paper">{currentConcept.title}</h1>
                <span className="text-xs font-mono text-accent uppercase tracking-wider">{currentConcept.tagline}</span>
              </div>
            </div>

            {/* Aleo Feature */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-[10px] font-mono text-paper/50 uppercase tracking-wider">What it is in Aleo</span>
              </div>
              <p className="text-sm text-paper/80 leading-relaxed">{currentConcept.aleoFeature}</p>
            </div>

            {/* Obscura Use */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                <span className="text-[10px] font-mono text-paper/50 uppercase tracking-wider">How Obscura Uses It</span>
              </div>
              <p className="text-sm text-paper/80 leading-relaxed">{currentConcept.obscuraUse}</p>
            </div>

            {/* Code Example */}
            {currentConcept.codeExample && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-q-green"></div>
                  <span className="text-[10px] font-mono text-paper/50 uppercase tracking-wider">Code Example</span>
                </div>
                <pre className="bg-charcoal rounded-lg p-3 overflow-x-auto">
                  <code className="text-[11px] font-mono text-paper/70 leading-relaxed whitespace-pre">{currentConcept.codeExample}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Traditional vs Obscura comparison */}
          {activeConcept === 'records' && (
            <div className="bg-ink border border-paper/10 rounded-lg p-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-paper/50 mb-3">Traditional vs Obscura</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-q-red/10 border border-q-red/20 rounded-lg p-3">
                  <div className="text-[10px] font-mono text-q-red uppercase mb-2">Traditional Dark Pool</div>
                  <div className="text-xs text-paper/60">
                    <div>Operator sees everything</div>
                    <div>Can front-run orders</div>
                    <div>Trust required</div>
                  </div>
                </div>
                <div className="bg-q-green/10 border border-q-green/20 rounded-lg p-3">
                  <div className="text-[10px] font-mono text-q-green uppercase mb-2">Obscura (Aleo)</div>
                  <div className="text-xs text-paper/60">
                    <div>Encrypted on-chain</div>
                    <div>Only owner has key</div>
                    <div>Trustless</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Privacy Stack & Architecture */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-auto">

          {/* Privacy Stack */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <h3 className="font-serif text-lg text-paper mb-4">Privacy Stack</h3>
            <div className="space-y-2">
              {PRIVACY_LAYERS.map((layer) => (
                <div key={layer.level} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${layer.color} rounded flex items-center justify-center text-ink font-mono text-xs font-bold`}>
                    L{layer.level}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-xs text-paper">{layer.name}</div>
                    <div className="text-[10px] text-paper/40">{layer.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Flow */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4 flex-1">
            <h3 className="font-serif text-lg text-paper mb-4">Architecture Flow</h3>

            <div className="space-y-3">
              {/* Flow diagram */}
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 border border-accent/30 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-accent">order_book.aleo</span>
                </div>
                <ChevronRight size={12} className="text-paper/30" />
                <span className="text-[10px] text-paper/40">Place / Cancel</span>
              </div>

              <div className="flex items-center gap-2 pl-4">
                <div className="w-px h-4 bg-paper/20"></div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-blue-400">matching_engine.aleo</span>
                </div>
                <ChevronRight size={12} className="text-paper/30" />
                <span className="text-[10px] text-paper/40">Verify / Match</span>
              </div>

              <div className="flex items-center gap-2 pl-4">
                <div className="w-px h-4 bg-paper/20"></div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-q-green/10 border border-q-green/30 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-q-green">settlement.aleo</span>
                </div>
                <ChevronRight size={12} className="text-paper/30" />
                <span className="text-[10px] text-paper/40">Swap Tokens</span>
              </div>

              <div className="flex items-center gap-2 pl-4">
                <div className="w-px h-4 bg-paper/20"></div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-purple-400">token.aleo</span>
                </div>
                <ChevronRight size={12} className="text-paper/30" />
                <span className="text-[10px] text-paper/40">Hold / Transfer</span>
              </div>
            </div>

            {/* Key insight */}
            <div className="mt-6 pt-4 border-t border-paper/10">
              <div className="flex items-start gap-2">
                <Eye size={14} className="text-accent mt-0.5" />
                <div>
                  <div className="font-mono text-xs text-paper mb-1">Key Insight</div>
                  <p className="text-[11px] text-paper/50 leading-relaxed">
                    Public state contains only commitments (hashes). Real values stay encrypted in user's records.
                    ZK proofs verify correctness without revealing data.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Docs;
