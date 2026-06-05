# WhatsApp Bot Specification

## Purpose

Autoresponder bot evaluating incoming WhatsApp messages against user-defined rules with trigger type, priority ordering, and cooldown enforcement.

## Requirements

### Requirement: Rule CRUD

System MUST expose CRUD endpoints for `whatsapp_bot_rules`. Each rule SHALL belong to one user.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Create keyword | Admin on bot settings | Creates `{ trigger: "keyword", keyword: "precio", response: "...", priority: 10 }` | Saves rule; returns 201 + ID |
| Create regex | Same | Creates `{ trigger: "regex", pattern: "^hola\|buenas", response: "..." }` | Validates regex; saves rule |
| Create any_message | Same | Creates `{ trigger: "any_message", response: "..." }` | Saves rule without pattern |
| Update | Rule exists, owned by user | Updates any field | Applies changes; returns updated rule |
| Delete | Rule exists | Admin deletes it | Removes from DB; returns 200 |

### Requirement: Rule Evaluation

When a message arrives, system SHALL evaluate ENABLED rules ordered by `priority ASC`, executing the FIRST match.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Keyword match | Rule: keyword="precio" | User sends "¿Cuál es el precio?" | System matches; sends configured response |
| Regex match | Rule: pattern="^gracias\|^thanks" | User sends "Gracias por todo" | System matches regex; sends response |
| No match | Rules exist but none match | Message arrives | No action; `bot_responded: false` |
| Priority order | Rule A (prio:10) and B (prio:5), same keyword | Message matches | Evaluates lower priority number first; sends Rule B's response |

### Requirement: Cooldown

System MUST NOT respond to same contact more than once per cooldown (default: 60s).

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Cooldown active | Bot responded <60s ago | Same contact sends matching message | Skips response; `cooldown_skipped: true` |
| Cooldown expired | Bot responded >60s ago | Same contact sends matching message | Sends response; resets timer |

### Requirement: Rule Disable

System SHALL support toggling `enabled`. Disabled rules SHALL be excluded from evaluation.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Rule disabled | Rule `enabled: false` | Message matches its keyword | Skips this rule; evaluates next or does nothing |
| Re-enabled | Rule now `enabled: true` | Matching message arrives | Evaluates and responds normally |

### Requirement: Template Variables

System SHALL support `{{name}}` (contact name) and `{{clientName}}` (linked client name) in responses.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Substitution | Response: "Hola {{name}}..." | Matches contact "Carlos" | Sends "Hola Carlos..." |
| Missing var | Contact has no name | Same template | Sends empty string; SHOULD NOT crash |

### Requirement: Hours-Inactive Trigger

System SHALL support rules with `trigger: "hours_inactive"` firing when user has not manually replied for N consecutive hours.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Threshold met | hours_inactive=4, last reply 5h ago | New message from that contact | Sends inactivity response |
| Not met | Last reply 2h ago (threshold=4) | Same event | Does NOT fire rule |
