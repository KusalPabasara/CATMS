import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedBackground({ children, className = "" }: AnimatedBackgroundProps) {
  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-[#f6fbfc] ${className}`}>
      {/* Animated Misty SVG Layer */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 400' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3ClinearGradient id='gMain' x1='0' x2='1' y1='0' y2='0'%3E%3Cstop offset='0' stop-color='%239feaf3'/%3E%3Cstop offset='0.25' stop-color='%2383e1ef'/%3E%3Cstop offset='0.5' stop-color='%237bdcf0'/%3E%3Cstop offset='0.75' stop-color='%236bd6e9'/%3E%3Cstop offset='1' stop-color='%23a0f0f6'/%3E%3C/linearGradient%3E%3CradialGradient id='gGlow' cx='50%25' cy='45%25' r='60%25'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0.25'/%3E%3Cstop offset='0.4' stop-color='%23e9fdff' stop-opacity='0.14'/%3E%3Cstop offset='1' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cfilter id='blurSoft' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='28' /%3E%3C/filter%3E%3CradialGradient id='vignette' cx='50%25' cy='50%25' r='70%25'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23000000' stop-opacity='0.08'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23gMain)' /%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23gGlow)' /%3E%3Cg filter='url(%23blurSoft)'%3E%3Cpath d='M-200 230 C 200 100, 400 310, 900 180 C 1200 90, 1400 260, 1800 210 L 1800 500 L -200 500 Z' fill='%23e7fbff' fill-opacity='0.32'/%3E%3Cpath d='M-200 270 C 200 180, 500 340, 900 240 C 1200 170, 1500 300, 1800 260 L 1800 500 L -200 500 Z' fill='%23daf7fb' fill-opacity='0.25'/%3E%3Cpath d='M-200 210 C 250 80, 600 260, 900 200 C 1200 140, 1500 230, 1800 200 L 1800 0 L -200 0 Z' fill='%23bff2f7' fill-opacity='0.20'/%3E%3C/g%3E%3Cg stroke='%23ffffff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' fill='none' opacity='0.95'%3E%3Cpath d='M120 210 L180 210 L200 210 L210 190 L230 250 L260 210 L340 210 L360 210 L410 210 L430 210 L440 170 L460 250 L480 210 L620 210 L640 210 L660 210 L690 210 L710 210 L730 170 L750 250 L770 210 L880 210 L900 210 L940 210 L980 210 L1000 210 L1020 190 L1040 250 L1060 210 L1240 210 L1280 210 L1290 210' stroke-width='4' stroke-opacity='0.95'/%3E%3C/g%3E%3Cg transform='translate(1200,70)' opacity='0.14' stroke='%23ffffff' stroke-width='1' fill='none'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z' /%3E%3Cg transform='translate(46,22)'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z'/%3E%3C/g%3E%3Cg transform='translate(-46,22)'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z'/%3E%3C/g%3E%3C/g%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23vignette)' /%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "400px 400px",
          rotate: 45,
          filter: "blur(40px)",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "400px 400px"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30, // slower for smoother, elegant motion
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
