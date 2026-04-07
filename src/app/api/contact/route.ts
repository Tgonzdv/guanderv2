import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const CONTACT_TO = 'tomas.gonzalezz@davinci.edu.ar';

export async function POST(request: Request) {
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Nombre, email y mensaje son requeridos' }, { status: 400 });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);

  if (!smtpUser || !smtpPass) {
    console.error('SMTP credentials not configured');
    return NextResponse.json({ error: 'Servicio de correo no configurado' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const mailSubject = subject?.trim()
    ? `[Guander Contacto] ${subject.trim()}`
    : `[Guander Contacto] Mensaje de ${name.trim()}`;

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1b3c;">
      <div style="background:#43D696;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:22px;">✶ Guander — Nuevo mensaje de contacto</h1>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:600;color:#6b7280;font-size:13px;width:120px;">Nombre</td><td style="padding:8px 0;font-size:15px;">${escapeHtml(name.trim())}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:15px;"><a href="mailto:${escapeHtml(email.trim())}" style="color:#43D696;">${escapeHtml(email.trim())}</a></td></tr>
          ${subject?.trim() ? `<tr><td style="padding:8px 0;font-weight:600;color:#6b7280;font-size:13px;">Asunto</td><td style="padding:8px 0;font-size:15px;">${escapeHtml(subject.trim())}</td></tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <p style="font-weight:600;color:#6b7280;font-size:13px;margin:0 0 8px;">Mensaje</p>
        <p style="font-size:15px;line-height:1.7;white-space:pre-wrap;margin:0;">${escapeHtml(message.trim())}</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Guander Contacto" <${smtpUser}>`,
      to: CONTACT_TO,
      replyTo: email.trim(),
      subject: mailSubject,
      html: htmlBody,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ error: 'Error al enviar el mensaje. Intentá de nuevo.' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
