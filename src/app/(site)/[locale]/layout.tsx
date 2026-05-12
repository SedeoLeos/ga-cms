import { Suspense } from 'react'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function SiteLayout({ children, params }: Props) {
  return (
    <Suspense>
      <SiteShell params={params}>{children}</SiteShell>
    </Suspense>
  )
}

async function SiteShell({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
