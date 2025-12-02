"use client";

import { motion } from "motion/react";
import { Code2, Shield, Trophy, Mail, ArrowUpRight, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import CreativeButton from "@/components/CreativeButton";
import PageTitle from "@/components/PageTitle";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { FaXTwitter, FaDiscord, FaBluesky } from "react-icons/fa6";
import { SiBugcrowd, SiHackerone, SiGoogle } from "react-icons/si";

export function AboutPage() {
  const achievements = [
    { icon: Trophy, title: "CTF Player", description: "Active participant in Capture The Flag competitions" },
    { icon: Shield, title: "Bug Bounty Hunter", description: "Finding and reporting security vulnerabilities" },
    { icon: Code2, title: "Full-Stack Developer", description: "Building modern web applications" },
  ];

  const bugPlatforms = [
    { icon: SiBugcrowd, label: "Bugcrowd", href: "https://bugcrowd.com/h/exigent07", handle: "Exigent07" },
    { icon: SiHackerone, label: "HackerOne", href: "https://hackerone.com/exigent07", handle: "Exigent07" },
    { icon: SiGoogle, label: "Google Bug Hunters", href: "https://bughunters.google.com/profile/4721fa3e-45eb-417b-b86b-c7b0961ed033", handle: "Exigent07" },
  ];

  const socials = [
    { icon: Mail, label: "Email", href: "mailto:contact@exigent07.com", username: "contact@exigent07.com" },
    { icon: FaDiscord, label: "Discord", href: "#", username: "exigent07", copyable: true },
    { icon: FiGithub, label: "GitHub", href: "https://github.com/Exigent07", username: "@Exigent07" },
    { icon: FaXTwitter, label: "X", href: "https://x.com/Exigent07", username: "@Exigent07" },
    { icon: FiLinkedin, label: "LinkedIn", href: "https://linkedin.com/in/exigent07", username: "Exigent07" },
    { icon: FaBluesky, label: "Bluesky", href: "https://bsky.app/profile/exigent07.bsky.social", username: "@exigent07.bsky.social" },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-40">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageTitle mainText="About" accentText="Me" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <CreativeButton icon="left" href="/">
              Home
            </CreativeButton>
            <CreativeButton href="/posts">All Posts</CreativeButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 
                className="text-white/90 mb-1"
                style={{ fontSize: 'clamp(2.75rem, 5vw, 3.5rem)' }}
              >
                Aravindh
              </h2>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Sparkles size={14} />
                <span>aka Exigent07 • ex1g3n7</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 text-white/60"
          >
            <p>
              I hate to play CTF but I do anyways. I do bug bounty — money equals happiness. 
              My only achievement is that I am still alive.
            </p>
            <p>
              When I get bored of security, I do web development.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group relative p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-4 group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-500">
                      <Icon size={20} className="text-white/60 group-hover:text-white/80 transition-colors duration-500" />
                    </div>
                    <h3 className="text-white/80 mb-2">{achievement.title}</h3>
                    <p className="text-white/50 text-sm">{achievement.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bugPlatforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  className="group relative flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
                  onClick={() => window.open(platform.href, '_blank')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-500">
                      <Icon size={20} className="text-white/60 group-hover:text-white/80 transition-colors duration-500" />
                    </div>
                    <div>
                      <div className="text-white/80 text-sm mb-1">{platform.label}</div>
                      <div className="text-white/50 text-xs font-mono">{platform.handle}</div>
                    </div>
                  </div>
                  <ArrowUpRight 
                    size={16} 
                    className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" 
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                  className="group relative flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
                  onClick={(e) => {
                    if (social.copyable) {
                      e.preventDefault();
                      handleCopy(social.username, social.label);
                    } else {
                      window.open(social.href, '_blank');
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-500">
                      <Icon size={20} className="text-white/60 group-hover:text-white/80 transition-colors duration-500" />
                    </div>
                    <div>
                      <div className="text-white/80 text-sm mb-1">{social.label}</div>
                      <div className="text-white/50 text-xs font-mono">{social.username}</div>
                    </div>
                  </div>
                  {social.copyable ? (
                    <Copy
                      size={16}
                      className="text-white/40 group-hover:text-white/60 group-hover:scale-110 transition-all duration-300"
                    />
                  ) : (
                    <ArrowUpRight 
                      size={16} 
                      className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" 
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-20 text-center"
        >
          <div className="inline-block px-6 py-3 rounded-full border border-white/10 bg-white/2">
            <p className="text-white/40 text-sm italic">
              &quot;I hate to do security, but I do it anyways&quot;
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
