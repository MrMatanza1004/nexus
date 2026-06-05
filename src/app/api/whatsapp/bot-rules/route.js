import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/bot-rules
 * List all bot rules for the authenticated user, ordered by priority ASC.
 */
export async function GET(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('whatsapp_bot_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('Bot rules list error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/whatsapp/bot-rules
 * Create a new bot rule.
 *
 * Body: { trigger_type, trigger_value?, response_value?, match_logic?, priority?, cooldown_minutes?, name? }
 *
 * Validates trigger_type and regex pattern where applicable.
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { trigger_type, trigger_value, response_value, match_logic, priority, cooldown_minutes, name } = body

    // Validate required fields
    const validTriggerTypes = ['keyword', 'regex', 'any_message', 'hours_inactive']
    if (!trigger_type || !validTriggerTypes.includes(trigger_type)) {
      return NextResponse.json({
        error: `trigger_type must be one of: ${validTriggerTypes.join(', ')}`,
      }, { status: 400 })
    }

    if (!response_value || typeof response_value !== 'string') {
      return NextResponse.json({ error: 'response_value is required' }, { status: 400 })
    }

    // Validate trigger-specific requirements
    if (trigger_type === 'regex') {
      if (!trigger_value) {
        return NextResponse.json({ error: 'trigger_value (regex pattern) is required for regex trigger' }, { status: 400 })
      }
      try {
        new RegExp(trigger_value)
      } catch {
        return NextResponse.json({ error: 'Invalid regex pattern in trigger_value' }, { status: 400 })
      }
    }

    if (trigger_type === 'keyword' && !trigger_value) {
      return NextResponse.json({ error: 'trigger_value is required for keyword trigger' }, { status: 400 })
    }

    if (trigger_type === 'hours_inactive') {
      if (!trigger_value) {
        return NextResponse.json({ error: 'trigger_value (hours) is required for hours_inactive trigger' }, { status: 400 })
      }
      const hours = parseInt(trigger_value, 10)
      if (isNaN(hours) || hours <= 0) {
        return NextResponse.json({ error: 'trigger_value must be a positive number for hours_inactive trigger' }, { status: 400 })
      }
    }

    // Validate priority (if provided)
    const parsedPriority = priority !== undefined ? parseInt(priority, 10) : 0
    if (isNaN(parsedPriority)) {
      return NextResponse.json({ error: 'priority must be a number' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('whatsapp_bot_rules')
      .insert({
        user_id: user.id,
        name: name || null,
        trigger_type,
        trigger_value: trigger_value || null,
        response_value,
        match_logic: match_logic || 'contains',
        priority: parsedPriority,
        cooldown_minutes: cooldown_minutes !== undefined ? parseInt(cooldown_minutes, 10) : 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('Bot rules create error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * PATCH /api/whatsapp/bot-rules
 * Update an existing bot rule. ID is in the request body.
 *
 * Body: { id, trigger_type?, trigger_value?, response_value?, ... }
 * Only included fields will be updated.
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, trigger_type, trigger_value, response_value, match_logic, priority, cooldown_minutes, name, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Validate the rule exists and belongs to user
    const { data: existing } = await supabase
      .from('whatsapp_bot_rules')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    // Validate trigger_type if provided
    const validTriggerTypes = ['keyword', 'regex', 'any_message', 'hours_inactive']
    if (trigger_type && !validTriggerTypes.includes(trigger_type)) {
      return NextResponse.json({
        error: `trigger_type must be one of: ${validTriggerTypes.join(', ')}`,
      }, { status: 400 })
    }

    // Validate regex pattern if trigger_value is being set for a regex type
    const effectiveTriggerType = trigger_type || existing.trigger_type
    if (effectiveTriggerType === 'regex' && trigger_value !== undefined) {
      if (!trigger_value) {
        return NextResponse.json({ error: 'trigger_value (regex pattern) is required for regex trigger' }, { status: 400 })
      }
      try {
        new RegExp(trigger_value)
      } catch {
        return NextResponse.json({ error: 'Invalid regex pattern in trigger_value' }, { status: 400 })
      }
    }

    if (effectiveTriggerType === 'keyword' && trigger_value !== undefined && !trigger_value) {
      return NextResponse.json({ error: 'trigger_value is required for keyword trigger' }, { status: 400 })
    }

    if (effectiveTriggerType === 'hours_inactive' && trigger_value !== undefined) {
      if (!trigger_value) {
        return NextResponse.json({ error: 'trigger_value (hours) is required' }, { status: 400 })
      }
      const hours = parseInt(trigger_value, 10)
      if (isNaN(hours) || hours <= 0) {
        return NextResponse.json({ error: 'trigger_value must be a positive number' }, { status: 400 })
      }
    }

    // Build update object — only include fields that were provided
    const updates = {}
    if (name !== undefined) updates.name = name
    if (trigger_type !== undefined) updates.trigger_type = trigger_type
    if (trigger_value !== undefined) updates.trigger_value = trigger_value
    if (response_value !== undefined) updates.response_value = response_value
    if (match_logic !== undefined) updates.match_logic = match_logic
    if (priority !== undefined) updates.priority = parseInt(priority, 10)
    if (cooldown_minutes !== undefined) updates.cooldown_minutes = parseInt(cooldown_minutes, 10)
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await supabase
      .from('whatsapp_bot_rules')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Bot rules update error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * DELETE /api/whatsapp/bot-rules
 * Delete a bot rule. ID is in the URL query param (?id=xxx).
 */
export async function DELETE(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('whatsapp_bot_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Bot rules delete error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
