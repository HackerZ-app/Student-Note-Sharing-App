import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import { MessageSquare, Brain, Key, ArrowRight } from 'lucide-react';

// 3D AI Core Component
const AICore = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color="#00f3ff" 
          emissive="#00f3ff"
          emissiveIntensity={0.5}
          wireframe={true} 
          distort={0.4} 
          speed={2} 
        />
      </mesh>
    </Float>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-colors shadow-2xl hover:shadow-cyan-500/20 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
        <Icon className="w-7 h-7 text-cyan-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <div className="full-width-container min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden w-full">
        
        {/* Abstract Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center w-full">
          
          {/* Copy Side */}
          <div className="w-full md:w-1/2 pt-10 md:pt-0 pb-16 md:pb-0 z-20">
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 animate-gradient">
                  Supercharge
                </span>
                <br /> Your Study Sessions.
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                Upload PDFs. Generate Quizzes. Chat with your personal AI Tutor. All powered by your own AI engine.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/register">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-full flex items-center transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center text-lg">
                      Get Started for Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="text-cyan-400 font-bold px-8 py-4 rounded-full border border-cyan-500/50 flex items-center transition-all text-lg"
                  >
                    View Features
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* 3D Canvas Side */}
          <div className="w-full md:w-1/2 h-[500px] md:h-[600px] absolute md:relative right-0 opacity-40 md:opacity-100 pointer-events-none md:pointer-events-auto">
             <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
               <ambientLight intensity={0.5} />
               <pointLight position={[10, 10, 10]} color="#00f3ff" intensity={2} />
               <pointLight position={[-10, -10, -10]} color="#ff0055" intensity={1} />
               <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
               <AICore />
             </Canvas>
          </div>
          
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 relative z-10 w-full" style={{ background: 'radial-gradient(ellipse at bottom, #0f172a 0%, #020617 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-4xl md:text-5xl font-black text-white mb-4"
             >
               Next-Gen Study <span className="text-cyan-400">Mechanics</span>
             </motion.h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              index={0}
              icon={MessageSquare}
              title="Interactive Tutor"
              description="Chat directly with your documents. Ask complex questions and get instant, context-aware summaries."
            />
             <FeatureCard 
              index={1}
              icon={Brain}
              title="Auto-Quiz Engine"
              description="Instantly generate 5 or 10 question practice tests from any PDF to rapidly test and reinforce your knowledge."
            />
             <FeatureCard 
              index={2}
              icon={Key}
              title="BYOK Architecture"
              description="Bring your own Google AI Studio key. Unlock a 1,500 daily coin capacity with zero subscription fees."
            />
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-10 relative z-10 w-full">
        <div className="container mx-auto px-6 text-center md:flex md:justify-between md:items-center">
          <div className="text-slate-500 font-medium mb-4 md:mb-0">
            © {new Date().getFullYear()} NoteShare AI. Built for the future.
          </div>
          <div className="flex justify-center space-x-6 text-sm font-bold">
             <Link to="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</Link>
             <Link to="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</Link>
             <Link to="#" className="text-slate-400 hover:text-cyan-400 transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
