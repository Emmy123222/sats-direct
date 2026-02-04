import { Shield, Zap, Ban, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Self Custody",
    description: "Payments go directly to your wallet. You control your keys, you control your funds."
  },
  {
    icon: Shield,
    title: "No KYC Required",
    description: "Start accepting payments in minutes. No identity verification, no paperwork."
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Bitcoin transactions confirm on-chain. No waiting for bank transfers."
  },
  {
    icon: Ban,
    title: "No Chargebacks",
    description: "Bitcoin payments are final. Say goodbye to fraud and payment disputes."
  }
];

export const Benefits = () => {
  return (
    <section className="py-20 border-t border-border">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why merchants choose <span className="text-primary">SatsGate</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for businesses who believe in Bitcoin
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
