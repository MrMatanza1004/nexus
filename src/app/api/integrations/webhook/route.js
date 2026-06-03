import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getNangoClient } from '@/integrations/nango'

export const dynamic = 'force-dynamic'

/**
 * Webhook recibido de Nango cuando un usuario conecta o reconecta un provider.
 *
 * Necesitás configurar esta URL en Environment Settings de Nango:
 *   https://ionexus.pro/api/integrations/webhook
 * Y habilitar "Send New Connection Creation Webhooks".
 */
export async function POST(req) {
  try {
    const body = await req.json()
    console.log('Nango webhook received:', JSON.stringify(body))

    // Validar que sea un evento de auth exitoso
    if (body.type !== 'auth' || !body.success) {
      return NextResponse.json({ ok: true }) // No error, solo ignoramos
    }

    const { connectionId, tags, providerConfigKey } = body

    if (!connectionId || !tags?.end_user_id) {
      console.error('Nango webhook missing connectionId or end_user_id:', body)
      return NextResponse.json({ ok: true })
    }

    const userId = tags.end_user_id
    const provider = providerConfigKey || 'google-drive'

    // Usar service_role para actualizar user_metadata
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Obtener metadata actual del usuario
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId)
    if (getUserError || !user) {
      console.error('Error fetching user for webhook:', getUserError?.message)
      return NextResponse.json({ ok: true })
    }

    const currentConnections = user.user_metadata?.nango_connections || {}

    let folderId = null
    if (provider === 'google-drive') {
      folderId = await ensureNexusFolder(userId, connectionId)
    }

    const providerFields = {}
    if (provider === 'google-mail') {
      providerFields.mail_connected = true
    }

    // Actualizar metadata
    const updatedConnections = {
      ...currentConnections,
      [provider]: connectionId,
    }

    const updateMeta = {
      nango_connections: updatedConnections,
      drive_connected: provider === 'google-drive' ? true : user.user_metadata?.drive_connected,
      ...(folderId ? { drive_folder_id: folderId } : {}),
      ...providerFields,
    }

    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        ...updateMeta,
      },
    })

    console.log(`Nango webhook: ${provider} connected for user ${userId}, connectionId: ${connectionId}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Nango webhook error:', err.message)
    // Siempre responder 200 para que Nango no reintente
    return NextResponse.json({ ok: true })
  }
}

/**
 * Crea la carpeta "NexusIO Files" en Google Drive del usuario si no existe.
 */
async function ensureNexusFolder(userId, connectionId) {
  try {
    const nango = getNangoClient()
    if (!nango) return null

    const connection = await nango.getConnection('google-drive', connectionId)
    const accessToken = connection.credentials?.access_token
    if (!accessToken) return null

    // Buscar si ya existe la carpeta
    const searchRes = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name=%27NexusIO%20Files%27%20and%20mimeType=%27application/vnd.google-apps.folder%27%20and%20trashed=false&fields=files(id,name)',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const searchData = await searchRes.json()

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id // Ya existe
    }

    // Crear la carpeta
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'NexusIO Files',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    })
    const folder = await createRes.json()
    return folder.id || null
  } catch (err) {
    console.error('Error ensuring Nexus folder:', err.message)
    return null // Non-fatal
  }
}
