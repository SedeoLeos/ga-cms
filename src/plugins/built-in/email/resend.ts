import type { TatomirPlugin } from '../../types'

export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<{ id: string }>
}

declare module '../../types' {
  interface TatomirPlugin {
    emailAdapters?: EmailAdapter[]
  }
}

export const resendEmailPlugin: TatomirPlugin = {
  id: 'email-resend',
  name: 'Resend Email',
  version: '1.0.0',
  description: 'Transactional email via Resend — works on any Node.js host',
  emailAdapters: [
    {
      async send({ to, subject, html, from, replyTo }: EmailMessage) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const defaultFrom = process.env.EMAIL_FROM ?? 'noreply@example.com'
        const result = await resend.emails.send({
          from: from ?? defaultFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          ...(replyTo ? { replyTo } : {}),
        })
        if (result.error) throw new Error(result.error.message)
        return { id: result.data?.id ?? '' }
      },
    },
  ],
}
