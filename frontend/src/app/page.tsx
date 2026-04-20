"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Brain,
  Network,
  Lock,
  Activity,
  ChevronRight,
  Sparkles,
  Building2,
  HeartPulse,
  ArrowRight,
  GitBranch,
  Database,
  Layers,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Animated FL Network Visualization                                   */
/* ------------------------------------------------------------------ */
function FLNetworkAnimation() {
  const nodes = [
    { x: 50, y: 50, label: "Global Server", color: "#338bff", size: 18 },
    { x: 20, y: 30, label: "Hospital A", color: "#08c7ae", size: 12 },
    { x: 80, y: 25, label: "Hospital B", color: "#08c7ae", size: 12 },
    { x: 15, y: 70, label: "Hospital C", color: "#08c7ae", size: 12 },
    { x: 85, y: 72, label: "Hospital D", color: "#08c7ae", size: 12 },
    { x: 50, y: 85, label: "Hospital E", color: "#08c7ae", size: 12 },
  ];

  const connections = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  ];

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#338bff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#08c7ae" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([from, to], i) => (
          <motion.line
            key={`line-${i}`}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="url(#lineGrad)"
            strokeWidth="0.3"
            strokeDasharray="2 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
          />
        ))}

        {/* Data packets traveling along connections */}
        {connections.map(([from, to], i) => (
          <motion.circle
            key={`packet-${i}`}
            r="0.8"
            fill="#08c7ae"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{
              cx: [nodes[from].x, nodes[to].x, nodes[from].x],
              cy: [nodes[from].y, nodes[to].y, nodes[from].y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.6 + 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            {/* Pulse ring for center node */}
            {i === 0 && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.size / 4}
                fill="none"
                stroke={node.color}
                strokeWidth="0.3"
                initial={{ r: node.size / 4, opacity: 0.6 }}
                animate={{ r: node.size / 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size / 4}
              fill={node.color}
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.15, type: "spring" }}
            />
            <motion.text
              x={node.x}
              y={node.y + node.size / 4 + 4}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="2.5"
              fontFamily="Inter, sans-serif"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.5 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature Card                                                        */
/* ------------------------------------------------------------------ */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="glass rounded-2xl p-6 md:p-8 group cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-5 group-hover:bg-primary-500/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Step Card (How It Works)                                            */
/* ------------------------------------------------------------------ */
function StepCard({
  number,
  title,
  desc,
  icon: Icon,
  delay,
}: {
  number: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 items-start"
    >
      <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-heading font-bold text-lg">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-teal-400" />
          <h4 className="font-heading font-semibold text-slate-100">{title}</h4>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-slate-950 bg-grid bg-noise -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />

      {/* --------- NAVBAR --------- */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-white">
                MedChain<span className="text-teal-400">-FL</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
              <a href="#network" className="text-sm text-slate-400 hover:text-white transition-colors">Network</a>
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center gap-1.5"
              >
                Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-800"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-sm text-slate-400 hover:text-white py-2">Features</a>
                <a href="#how-it-works" className="block text-sm text-slate-400 hover:text-white py-2">How It Works</a>
                <a href="#network" className="block text-sm text-slate-400 hover:text-white py-2">Network</a>
                <Link
                  href="/login"
                  className="block text-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --------- HERO --------- */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-medium mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" /> Privacy-Preserving Federated Learning
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                AI That Travels to{" "}
                <span className="gradient-text">Your Hospital</span>,{" "}
                Not Your Data to the Cloud
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl"
              >
                MedChain-FL enables Indian hospitals to collaboratively train AI diagnostic models
                — detecting Thalassemia and chronic blood disorders — without ever sharing raw patient data.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/login"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-7 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800/50 transition-all duration-300"
                >
                  Learn More
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-8 mt-12 pt-8 border-t border-slate-800"
              >
                {[
                  { value: "5+", label: "Partner Hospitals" },
                  { value: "100%", label: "Data Privacy" },
                  { value: "7+", label: "FL Rounds" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-heading text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — FL Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="glass rounded-3xl p-6 glow-primary">
                <FLNetworkAnimation />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --------- FEATURES --------- */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-teal-400 text-sm font-medium tracking-wider uppercase">Why MedChain-FL</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
              Built for <span className="gradient-text">Privacy-First</span> Healthcare
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our platform ensures that sensitive medical data never leaves the hospital premises while
              enabling collaborative AI research across institutions.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Lock}
              title="Zero Data Exposure"
              desc="Patient records, CBC data, and blood smear images never leave your hospital's infrastructure. Only encrypted model gradients are shared."
              delay={0}
            />
            <FeatureCard
              icon={Brain}
              title="Federated Intelligence"
              desc="AI models travel to hospitals to train locally, then aggregate globally — achieving multi-institutional accuracy without central data collection."
              delay={0.1}
            />
            <FeatureCard
              icon={Network}
              title="Decentralized Network"
              desc="Each hospital operates as an independent FL worker node. No single point of failure. Full data sovereignty maintained."
              delay={0.2}
            />
            <FeatureCard
              icon={Activity}
              title="Thalassemia Detection"
              desc="Purpose-built for detecting Thalassemia and chronic blood disorders using CBC parameters and blood smear analysis."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="RBAC & Compliance"
              desc="Three-tier role-based access (Admin → Hospital → Doctor) with JWT authentication. Designed for Indian healthcare compliance."
              delay={0.4}
            />
            <FeatureCard
              icon={Building2}
              title="Compute Credits"
              desc="Hospitals earn compute credits for participating in FL training rounds — incentivizing collaboration across institutions."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* --------- HOW IT WORKS --------- */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-teal-400 text-sm font-medium tracking-wider uppercase">Process</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-10">
                  How <span className="gradient-text">Federated Learning</span> Works
                </h2>
              </motion.div>

              <div className="space-y-8">
                <StepCard
                  number="1"
                  icon={Database}
                  title="Hospital Uploads Local Data"
                  desc="Each hospital uploads CBC records and blood smear images to their local, secure node. Data never leaves the hospital."
                  delay={0.1}
                />
                <StepCard
                  number="2"
                  icon={GitBranch}
                  title="Global Model is Distributed"
                  desc="The central server distributes the latest AI model weights to all participating hospital nodes."
                  delay={0.2}
                />
                <StepCard
                  number="3"
                  icon={Brain}
                  title="Local Training Runs"
                  desc="Each hospital trains the model on their private data. Only model updates (gradients) are generated — not data."
                  delay={0.3}
                />
                <StepCard
                  number="4"
                  icon={Layers}
                  title="Secure Aggregation"
                  desc="The global server aggregates encrypted gradients into an improved model and redistributes it. The cycle repeats."
                  delay={0.4}
                />
              </div>
            </div>

            {/* Network visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:block hidden"
            >
              <div className="glass rounded-3xl p-8 glow-teal">
                <FLNetworkAnimation />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --------- CTA --------- */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-10 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-teal-500/10" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to Join the <span className="gradient-text">MedChain Network</span>?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Connect your hospital to India&apos;s first privacy-preserving federated learning network for
                healthcare diagnostics.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 text-white font-semibold hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
              >
                Access Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --------- FOOTER --------- */}
      <footer className="border-t border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-white">
              MedChain<span className="text-teal-400">-FL</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} MedChain-FL. Privacy-Preserving Healthcare AI for India.
          </p>
        </div>
      </footer>
    </div>
  );
}
