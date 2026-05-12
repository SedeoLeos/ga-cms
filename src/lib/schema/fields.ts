import { z } from 'zod'

export const FieldSchemaZ = z.object({
  id: z.string().min(1),
  type: z.enum([
    'text',
    'textarea',
    'richtext',
    'number',
    'boolean',
    'date',
    'select',
    'media',
    'relation',
  ]),
  name: z.string().min(1, 'Le nom du champ est requis').max(100),
  key: z
    .string()
    .min(1, 'La clé est requise')
    .max(60)
    .regex(/^[a-z][a-z0-9_]*$/, 'Clé : commence par une lettre, puis minuscules/chiffres/_'),
  required: z.boolean(),
  description: z.string().max(500).optional(),
  options: z.array(z.string()).max(200).optional(),
  multiple: z.boolean().optional(),
  relatedCollectionId: z.string().optional(),
})
