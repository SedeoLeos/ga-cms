'use client'

import { Render } from '@measured/puck'
import type { Data } from '@measured/puck'
import { puckConfig } from './config'

interface Props {
  data: unknown
}

export function PuckRenderer({ data }: Props) {
  if (!data) return null
  return <Render config={puckConfig} data={data as Data} />
}
