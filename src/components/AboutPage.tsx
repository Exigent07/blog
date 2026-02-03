"use client";

import { motion } from "motion/react";
import { Code2, Shield, Trophy, Mail, ArrowUpRight, Sparkles, Copy, DollarSign, Bug, Award } from "lucide-react";
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

  const bountyBreakdown = [
    { company: "Google Gemini", amount: 13337, bugs: 1 },
    { company: "Google Gemini", amount: 15000, bugs: 1 },
    { company: "ChatGPT", amount: 250, bugs: 1 },
    { company: "ChatGPT", amount: 200, bugs: 1 },
    { company: "GenAI", amount: 500, bugs: 1 },
    { company: "Grok", amount: 0, bugs: 2 },
  ];

  const totalBounty = bountyBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalBugs = bountyBreakdown.reduce((sum, item) => sum + item.bugs, 0);

  const companiesStats = bountyBreakdown.reduce((acc, item) => {
    const existing = acc.find(c => c.company === item.company);
    if (existing) {
      existing.amount += item.amount;
      existing.bugs += item.bugs;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as typeof bountyBreakdown);

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
            <CreativeButton href="/posts">View All</CreativeButton>
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
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="text-2xl text-white/80 mb-6 flex items-center gap-2"
          >
            <Award size={24} className="text-white/60" />
            Bug Bounty Stats
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="group relative p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:from-white/8 hover:border-white/25 transition-all duration-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-white/70" />
                    <span className="text-white/50 text-sm">Total Bounties Earned</span>
                  </div>
                  <div className="text-4xl font-bold text-white/90 mb-1">
                    ${totalBounty.toLocaleString()}
                  </div>
                  <div className="text-white/40 text-xs">Across {companiesStats.length} companies</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="group relative p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:from-white/8 hover:border-white/25 transition-all duration-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bug size={20} className="text-white/70" />
                    <span className="text-white/50 text-sm">Total Bugs Reported</span>
                  </div>
                  <div className="text-4xl font-bold text-white/90 mb-1">
                    {totalBugs}
                  </div>
                  <div className="text-white/40 text-xs">Accepted vulnerabilities</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Company Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {companiesStats.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 + index * 0.05 }}
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white/80 font-medium">{company.company}</h4>
                    <div className="px-2 py-1 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                      <span className="text-white/60 text-xs p-1 font-mono">{company.bugs} bug{company.bugs > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white/90">
                      {company.amount > 0 ? `$${company.amount.toLocaleString()}` : 'Informative'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
