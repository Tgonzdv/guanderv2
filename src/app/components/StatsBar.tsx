import { queryD1 } from '@/lib/cloudflare-d1';
import StatsBarClient from './StatsBarClient';

export default async function StatsBar() {
  let stores = 0;
  let professionals = 0;
  let categories = 0;
  let plans = 0;

  try {
    const r = await queryD1<{ count: number }>('SELECT COUNT(*) as count FROM stores', [], { revalidate: 60 });
    stores = r[0]?.count ?? 0;
  } catch { /* fallback */ }

  try {
    const r = await queryD1<{ count: number }>(
      "SELECT COUNT(*) as count FROM users u JOIN roles r ON u.fk_rol = r.id_rol WHERE r.rol = 'professional'",
      [], { revalidate: 60 }
    );
    professionals = r[0]?.count ?? 0;
  } catch { /* fallback */ }

  try {
    const r = await queryD1<{ count: number }>(
      'SELECT COUNT(DISTINCT fk_category) as count FROM stores WHERE fk_category IS NOT NULL',
      [], { revalidate: 60 }
    );
    categories = r[0]?.count ?? 0;
  } catch { /* fallback */ }

  try {
    const r = await queryD1<{ count: number }>(
      "SELECT COUNT(*) as count FROM subscription WHERE state = 'activo'",
      [], { revalidate: 60 }
    );
    plans = r[0]?.count ?? 0;
  } catch { /* fallback */ }

  const stats = [
    { value: stores,        suffix: '+', label: 'Tiendas aliadas' },
    { value: professionals, suffix: '+', label: 'Profesionales' },
    { value: categories,               label: 'Categorías' },
    { value: plans,                    label: 'Planes disponibles' },
  ];

  return <StatsBarClient stats={stats} />;
}
