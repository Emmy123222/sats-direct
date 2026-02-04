import BitcoinIcon from "@/components/icons/BitcoinIcon";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BitcoinIcon size={32} className="text-primary" />
            <span className="text-xl font-bold">SatsGate</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Built on Bitcoin. Powered by Stacks.
          </p>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SatsGate. Not your keys, not your coins.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
