import satsgateLogo from '@/assets/satsgate.png';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 32, className = "" }: LogoProps) => {
  return (
    <img 
      src={satsgateLogo} 
      alt="SatsGate Logo" 
      width={size} 
      height={size}
      className={`${className}`}
    />
  );
};

export default Logo;