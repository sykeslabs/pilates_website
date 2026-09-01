function IconWrapper({
  children,
  size = 28,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Dumbbell — stronger body.
export function StrengthIcon() {
  return (
    <IconWrapper>
      <rect x="1.5" y="9.5" width="2.5" height="5" rx="1" />
      <rect x="20" y="9.5" width="2.5" height="5" rx="1" />
      <rect x="5.5" y="7.5" width="2.5" height="9" rx="1" />
      <rect x="16" y="7.5" width="2.5" height="9" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconWrapper>
  );
}

// Standing figure with a straight spine — better posture.
export function PostureIcon() {
  return (
    <IconWrapper>
      <circle cx="12" cy="4" r="1.75" />
      <line x1="12" y1="6.5" x2="12" y2="15" />
      <line x1="12" y1="9" x2="7.5" y2="11.5" />
      <line x1="12" y1="9" x2="16.5" y2="11.5" />
      <line x1="12" y1="15" x2="8.5" y2="21" />
      <line x1="12" y1="15" x2="15.5" y2="21" />
    </IconWrapper>
  );
}

// Leaf — calm, less stress.
export function CalmIcon() {
  return (
    <IconWrapper>
      <path d="M5 20c0-8.5 5-14.5 14-16-1 9.5-7.5 14.5-14 16z" />
      <path d="M6 19c3-3.5 6-7.5 8-12" />
    </IconWrapper>
  );
}

// Sparkle — more confidence.
export function ConfidenceIcon() {
  return (
    <IconWrapper>
      <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z" />
    </IconWrapper>
  );
}

// Sprout — new to Pilates / starting out.
export function SproutIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 -3-6-7-6 0 4 3 6 7 6z" />
      <path d="M12 9c0-3.5 2.5-5.5 6-5.5 0 3.5 -2.5 5.5 -6 5.5z" />
    </IconWrapper>
  );
}

// Single person — private 1:1 session.
export function PersonIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <circle cx="12" cy="7" r="3.25" />
      <path d="M5.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
    </IconWrapper>
  );
}

// Heart — pregnancy / care.
export function HeartIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <path d="M12 20.5s-7.5-4.6-9.5-9.2C1.2 8 3 4.8 6.2 4.5c2-.2 3.6 1 5.8 3 2.2-2 3.8-3.2 5.8-3 3.2.3 5 3.5 3.7 6.8-2 4.6-9.5 9.2-9.5 9.2z" />
    </IconWrapper>
  );
}

// Question mark — still not sure.
export function QuestionIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-1 .6-1.2 1-1.2 2.1" />
      <line x1="12" y1="17" x2="12" y2="17.1" />
    </IconWrapper>
  );
}

// Chat bubble — get in touch.
export function ChatIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <path d="M4 5h16v11H8l-4 4V5z" />
    </IconWrapper>
  );
}

// Checklist — pick a course.
export function ChecklistIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <path d="M4 6h2m0 0 1 1 2-2M4 12h2m0 0 1 1 2-2M4 18h2m0 0 1 1 2-2" />
      <line x1="11" y1="6" x2="20" y2="6" />
      <line x1="11" y1="12" x2="20" y2="12" />
      <line x1="11" y1="18" x2="20" y2="18" />
    </IconWrapper>
  );
}

// Calendar — pick a time.
export function CalendarIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </IconWrapper>
  );
}

// Checkmark — confirm.
export function CheckIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5 5.5-6" />
    </IconWrapper>
  );
}

// Two people — small groups.
export function GroupIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 12.2c2.3.4 4 2.4 4 4.8" />
    </IconWrapper>
  );
}

// Ribbon/badge — certified instructor.
export function CertificateIcon({ size }: { size?: number }) {
  return (
    <IconWrapper size={size}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.5l-1.5 6.5 4.5-2.5 4.5 2.5-1.5-6.5" />
      <path d="M9.8 9l1.5 1.5 2.9-3" />
    </IconWrapper>
  );
}
