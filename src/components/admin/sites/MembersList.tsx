'use client'

import type { MemberActionState } from '@/lib/actions/members'
import {
  deleteMemberAction,
  inviteMemberAction,
  toggleMemberVerifiedAction,
} from '@/lib/actions/members'
import { Check, Loader2, Mail, Trash2, UserPlus } from 'lucide-react'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'

export type MemberRow = {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

const INPUT_S: React.CSSProperties = {
  height: 32,
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 5,
  padding: '0 10px',
  fontSize: 12,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
}

function Row({ member }: { member: MemberRow }) {
  const [deletePending, startDelete] = useTransition()
  const [verifyPending, startVerify] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Supprimer ${member.email} ? Cette action est irréversible.`)) return
    startDelete(async () => {
      await deleteMemberAction(member.id)
    })
  }

  function handleToggleVerified() {
    startVerify(async () => {
      await toggleMemberVerifiedAction(member.id, !member.emailVerified)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 160px 96px 96px 60px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: deletePending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0', marginBottom: 1 }}>
          {member.name ?? <span style={{ color: '#4a4a68', fontStyle: 'italic' }}>Sans nom</span>}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#5a5a78',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.email}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#3e3e52' }}>
        {member.lastLoginAt ?? <span style={{ color: '#2e2e42' }}>Jamais connecté</span>}
      </div>

      <button
        type="button"
        onClick={handleToggleVerified}
        disabled={verifyPending}
        title={member.emailVerified ? 'Révoquer la vérification' : 'Marquer comme vérifié'}
        style={{
          height: 22,
          padding: '0 8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: member.emailVerified ? '#0e2e1a' : '#1e1e2e',
          border: `1px solid ${member.emailVerified ? '#1a4a28' : '#2a2a3e'}`,
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          color: member.emailVerified ? '#4ade80' : '#4a4a68',
          cursor: verifyPending ? 'not-allowed' : 'pointer',
        }}
      >
        {member.emailVerified && <Check size={10} strokeWidth={2.5} />}
        {member.emailVerified ? 'Vérifié' : 'Non vérifié'}
      </button>

      <div style={{ fontSize: 11, color: '#3e3e52' }}>{member.createdAt}</div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deletePending}
          title="Supprimer"
          className="site-delete-btn"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            background: 'none',
            border: 'none',
            cursor: deletePending ? 'not-allowed' : 'pointer',
            color: '#4a4a68',
            padding: 0,
          }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

function InviteRow() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<MemberActionState, FormData>(
    inviteMemberAction,
    null,
  )
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state && 'success' in state) setOpen(false)
  }, [state])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => emailRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open) {
    return (
      <div style={{ padding: '12px 16px' }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            height: 32,
            padding: '0 14px',
            background: '#4353ff',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: '#fff',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <UserPlus size={13} strokeWidth={2} />
          Inviter un membre
        </button>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #1f1f2e',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <label
          htmlFor="inv-email"
          style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
        >
          Email
        </label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={12}
            strokeWidth={1.5}
            color="#4a4a68"
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            id="inv-email"
            ref={emailRef}
            name="email"
            type="email"
            required
            placeholder="membre@example.com"
            style={{ ...INPUT_S, width: '100%', paddingLeft: 28 }}
          />
        </div>
      </div>

      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <label
          htmlFor="inv-name"
          style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
        >
          Nom <span style={{ color: '#3e3e52', fontWeight: 400 }}>(optionnel)</span>
        </label>
        <input
          id="inv-name"
          name="name"
          type="text"
          placeholder="Prénom Nom"
          style={{ ...INPUT_S, width: '100%' }}
        />
      </div>

      <div
        style={{ display: 'flex', gap: 6, alignItems: 'flex-end', paddingBottom: 0, marginTop: 19 }}
      >
        <button
          type="submit"
          disabled={pending}
          style={{
            height: 32,
            padding: '0 14px',
            background: pending ? '#2a2a4e' : '#4353ff',
            border: 'none',
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 500,
            color: pending ? '#6a6a90' : '#fff',
            cursor: pending ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {pending && <Loader2 size={12} className="spin" />}
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            height: 32,
            padding: '0 12px',
            background: 'none',
            border: '1px solid #2a2a3e',
            borderRadius: 5,
            fontSize: 12,
            color: '#5a5a78',
            cursor: 'pointer',
          }}
        >
          Annuler
        </button>
      </div>

      {state && 'error' in state && (
        <p style={{ width: '100%', margin: '4px 0 0', fontSize: 11, color: '#ff6060' }}>
          {state.error}
        </p>
      )}
    </form>
  )
}

const HEADERS = ['Membre', 'Dernière connexion', 'Statut', 'Ajouté le', '']

interface Props {
  members: MemberRow[]
}

export default function MembersList({ members }: Props) {
  return (
    <div
      style={{
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {members.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 96px 96px 60px',
            gap: 12,
            padding: '8px 16px',
            borderBottom: '1px solid #1f1f2e',
          }}
        >
          {HEADERS.map((h) => (
            <span
              key={h}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3e3e52',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {members.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
            Aucun membre pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
            Invitez des membres pour leur donner accès au contenu protégé du site.
          </p>
        </div>
      )}

      {members.map((m) => (
        <Row key={m.id} member={m} />
      ))}

      <InviteRow />
    </div>
  )
}
