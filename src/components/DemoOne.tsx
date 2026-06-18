import { Hero } from "@/components/ui/hero-1";

interface DemoOneProps {
  onSignInClick?: () => void;
  onDemoClick?: () => void;
  onPromptChange?: (prompt: string) => void;
}

export function DemoOne({ onSignInClick, onDemoClick, onPromptChange }: DemoOneProps) {
  return (
    <div className="relative">
      <Hero 
        title="Think It. Build It."
        subtitle="Powerful CAD analysis, real-time simulation, and design tools built for modern teams."
        eyebrow="Design Platform"
        ctaLabel="Start Designing"
        ctaHref="#"
        onCtaClick={onSignInClick}
        onDemoClick={onDemoClick}
      />
    </div>
  );
}
