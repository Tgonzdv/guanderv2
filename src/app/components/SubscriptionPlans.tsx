import { Shield, Star, Rocket, Zap, Info } from 'lucide-react';
import { queryD1 } from '@/lib/cloudflare-d1';

type Subscription = {
  id_subscription: number;
  name: string;
  description: string;
  state: string;
  amount: number;
};

const planVisuals = [
  {
    icon: <Shield className="w-5 h-5" />,
    buttonColor: 'bg-indigo-500 hover:bg-indigo-600',
    textColor: 'text-indigo-500',
    popular: false,
  },
  {
    icon: <Star className="w-5 h-5" />,
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-blue-500',
    popular: true,
  },
  {
    icon: <Rocket className="w-5 h-5" />,
    buttonColor: 'bg-violet-500 hover:bg-violet-600',
    textColor: 'text-violet-500',
    popular: false,
  },
  {
    icon: <Zap className="w-5 h-5" />,
    buttonColor: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    textColor: 'text-fuchsia-500',
    popular: false,
  },
] as const;

const gridColsClass: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

function formatAmount(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

export default async function SubscriptionPlans() {
  let subscriptions: Subscription[] = [];

  try {
    subscriptions = await queryD1<Subscription>(
      "SELECT id_subscription, name, description, state, amount FROM subscription WHERE state = 'activo' ORDER BY amount ASC"
    );
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }

  const colsClass = gridColsClass[Math.min(subscriptions.length, 4)] ?? 'lg:grid-cols-3';

  return (
    <section id="planes" className="w-full bg-[#f8fafc] py-24 sm:py-32 relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Planes de Suscripción
          </h2>
          <p className="text-slate-500 text-lg md:text-xl">
            ¡Elegí el plan que mejor se adapte a vos!
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6 lg:gap-8 max-w-[1400px] mx-auto`}>
          {subscriptions.map((plan, index) => {
            const visual = planVisuals[index] ?? planVisuals[planVisuals.length - 1];
            return (
              <div
                key={plan.id_subscription}
                className={`flex flex-col h-full relative bg-white rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  visual.popular
                    ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/10 z-10 scale-100 lg:scale-105'
                    : 'border border-slate-100 shadow-lg hover:shadow-xl'
                }`}
              >
                {visual.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center drop-shadow-md">
                    <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-8 flex-shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 text-slate-900">
                    <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${visual.textColor}`}>
                      {formatAmount(plan.amount)}
                    </span>
                    <span className="text-slate-500 font-medium">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-4 italic min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex-shrink-0">
                  <button
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 ${visual.buttonColor} shadow-md shadow-current/20 hover:shadow-lg`}
                  >
                    {visual.icon}
                    Elegir {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="inline-flex items-center gap-2 text-sm text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
            <Info className="w-4 h-4 text-amber-500" />
            Todos los planes incluyen 30 días de prueba gratis. Cancelá cuando quieras sin penalidades.
          </p>
        </div>
      </div>
    </section>
  );
}
