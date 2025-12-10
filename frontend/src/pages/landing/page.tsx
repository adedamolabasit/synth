import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Upload,
  Eye,
  Shield,
  Sparkles,
  Globe,
  Music,
  ChevronRight,
  Palette,
  ArrowRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  avatarColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient,
}) => (
  <div className="group relative overflow-hidden rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-sm" />

    <div className="relative z-10">
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  </div>
);

const TestimonialCard: React.FC<TestimonialProps> = ({
  name,
  role,
  content,
  avatarColor,
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
    <div className="absolute inset-0 z-0 opacity-5" />

    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 to-slate-800/50" />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center`}
        >
          <span className="text-white font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="text-white font-semibold">{name}</h4>
          <p className="text-slate-300 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-slate-200 italic">"{content}"</p>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: <Music className="w-6 h-6 text-indigo-400" />,
      title: "AI-Powered Audio Analysis",
      description:
        "Upload any audio file and get instant transcription, BPM detection, and musical element extraction.",
      gradient: "from-indigo-500/20 to-purple-500/20",
    },
    {
      icon: <Eye className="w-6 h-6 text-purple-400" />,
      title: "Real-time 3D Visualization",
      description:
        "Watch your audio come to life with dynamic, reactive 3D visuals powered by Three.js.",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: "Blockchain IP Registration",
      description:
        "Automatically register your creations on Story Protocol for permanent ownership and licensing.",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      icon: <Upload className="w-6 h-6 text-emerald-400" />,
      title: "One-Click Publishing",
      description:
        "Record, upload to IPFS, and publish your visualizer videos in a single workflow.",
      gradient: "from-emerald-500/20 to-green-500/20",
    },
    {
      icon: <Palette className="w-6 h-6 text-pink-400" />,
      title: "Customizable Templates",
      description:
        "Choose from dozens of visualizer templates or create your own with our designer.",
      gradient: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      title: "IPFS Storage",
      description:
        "Your content is stored decentralized on IPFS via Pinata for maximum availability.",
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Electronic Music Producer",
      content:
        "Synth transformed how I present my music. The AI-generated visuals perfectly match my tracks, and the IP registration gives me peace of mind.",
      avatarColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
    },
    {
      name: "Maya Rodriguez",
      role: "Record Label Owner",
      content:
        "We've integrated Synth into our release workflow. It saves us thousands in video production and streamlines our IP management.",
      avatarColor: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      name: "David Park",
      role: "NFT Artist",
      content:
        "The combination of audio-reactive visuals and blockchain registration makes Synth the perfect tool for creating generative audio NFTs.",
      avatarColor: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
  ];

  const stats = [
    { label: "Tracks Visualized", value: "10,000+" },
    { label: "IP Assets Registered", value: "2,500+" },
    { label: "Video Hours Generated", value: "5,000+" },
    { label: "Active Creators", value: "1,200+" },
  ];

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />

        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="absolute inset-0 z-0 overflow-hidden"></div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-500/50 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                AI-Powered Audio Visualization Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transform Audio
              </span>
              <br />
              <span className="text-white">Into Visual Ownership</span>
            </h1>

            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-10">
              Upload any audio file, generate stunning AI-powered 3D
              visualizations, and register them as intellectual property on the
              blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={goToDashboard}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <span>Start Creating Free</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative  mt-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            See{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Synth
            </span>{" "}
            in Action
          </h2>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Watch a complete rundown of every video visualizer — and discover
            how each one lets you create magical visuals.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="aspect-video rounded-2xl overflow-hidden border-2 border-slate-700/50 group hover:border-indigo-500/50 transition-all duration-300 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm" />

            <div className="relative h-full z-10">
              <video
                ref={videoRef}
                src="https://crimson-obliged-zebra-367.mypinata.cloud/ipfs/QmPN6jMcV4LyNix1AdKEyiCA4LtL5aZtKyfvapT7PNexaX?pinataGatewayToken=BmZjUB5nCCxIeDdY6v_uM2RJhyqwnTKtGFnahd_IsPXD9He4pVRxPOcSvDfCpYwM"
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070"
                onEnded={handleVideoEnded}
                controls
              >
                Your browser does not support the video tag.
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                <button
                  onClick={handleVideoPlay}
                  className="group w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500/90 to-purple-600/90 flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/50 backdrop-blur-sm"
                >
                  {isVideoPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl border border-slate-700/50 relative backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Want to see your own audio visualized?
                  </h3>
                  <p className="text-slate-300">
                    Upload any audio file and see it transform instantly
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={goToDashboard}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Create & Protect
            </span>
          </h2>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            A complete workflow from audio upload to blockchain registration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl" />

              <div className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-300">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Creators
            </span>{" "}
            Worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-10">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/50 p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-purple-900/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />

          <div className="relative z-10 backdrop-blur-sm">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Audio?
              </h2>
              <p className="text-xl text-slate-200 mb-8">
                Join thousands of creators who are visualizing and protecting
                their work with Synth
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToDashboard}
                  className="group px-8 py-4 bg-gradient-to-r from-white to-slate-100 rounded-xl font-semibold text-slate-900 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <p className="text-slate-300 text-sm mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-800/50 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8"></div>

          <div className="border-t border-slate-800/50 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} Synth. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
