import { queryD1 } from '@/lib/cloudflare-d1';
import ProfesionalesClient, { type ProfessionalItem } from './ProfesionalesClient';

interface ProfessionalRow {
  id_professional: number;
  description: string;
  address: string;
  location: string;
  stars: number;
  accept_point: number;
  name: string;
  last_name: string;
  email: string;
  type_service_name: string;
}

export default async function ProfesionalesPage() {
  let professionals: ProfessionalItem[] = [];

  try {
    const rows = await queryD1<ProfessionalRow>(
      `SELECT
        p.id_professional,
        p.description,
        p.address,
        p.location,
        p.stars,
        p.accept_point,
        ud.name,
        ud.last_name,
        ud.email,
        ts.name AS type_service_name
      FROM professionals p
      LEFT JOIN users u      ON u.id_user         = p.fk_user_id
      LEFT JOIN user_data ud ON ud.id_user_data    = u.fk_user_data
      LEFT JOIN type_service ts ON ts.id_type_service = p.fk_type_service
      ORDER BY p.id_professional DESC`,
      [],
      { revalidate: false },
    );

    professionals = rows.map((row) => ({
      id: row.id_professional,
      name: `${row.name ?? ''} ${row.last_name ?? ''}`.trim() || 'Sin nombre',
      email: row.email ?? '',
      serviceType: row.type_service_name ?? 'Sin tipo',
      description: row.description ?? '',
      address: row.address ?? '',
      location: row.location ?? '',
      stars: typeof row.stars === 'number' ? row.stars : null,
      acceptsPoints: row.accept_point === 1,
    }));
  } catch {
    professionals = [];
  }

  return <ProfesionalesClient initialProfessionals={professionals} />;
}
