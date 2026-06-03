// ─────────────────────────────────────────────
// NEXUS — Database TypeScript Definitions
// Auto-generated from supabase/setup.sql + migrations
// ─────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          plan_type: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          affiliate_code: string | null
          referred_by: string | null
          onboarded: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          affiliate_code?: string | null
          referred_by?: string | null
          onboarded?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          affiliate_code?: string | null
          referred_by?: string | null
          onboarded?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          project_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          project_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          project_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
          portal_token: string | null
          portal_active: boolean | null
          pipeline_stage: 'lead' | 'contacted' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          portal_token?: string | null
          portal_active?: boolean | null
          pipeline_stage?: 'lead' | 'contacted' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          portal_token?: string | null
          portal_active?: boolean | null
          pipeline_stage?: 'lead' | 'contacted' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          name: string
          description: string | null
          status: 'idea' | 'in_progress' | 'review' | 'done' | 'cancelled'
          budget: number | null
          started_at: string | null
          deadline: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          name: string
          description?: string | null
          status?: 'idea' | 'in_progress' | 'review' | 'done' | 'cancelled'
          budget?: number | null
          started_at?: string | null
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          name?: string
          description?: string | null
          status?: 'idea' | 'in_progress' | 'review' | 'done' | 'cancelled'
          budget?: number | null
          started_at?: string | null
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          tags: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          tags?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          tags?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          content: string
          mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          content: string
          mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string
          mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
          created_at?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string | null
          content: string | null
          amount: number | null
          scope: string | null
          timeline: string | null
          terms: string | null
          status: 'draft' | 'sent' | 'accepted' | 'rejected'
          sent_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title?: string | null
          content?: string | null
          amount?: number | null
          scope?: string | null
          timeline?: string | null
          terms?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected'
          sent_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          title?: string | null
          content?: string | null
          amount?: number | null
          scope?: string | null
          timeline?: string | null
          terms?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected'
          sent_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string | null
          content: string | null
          amount: number | null
          status: 'draft' | 'sent' | 'signed'
          signed: boolean | null
          signed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title?: string | null
          content?: string | null
          amount?: number | null
          status?: 'draft' | 'sent' | 'signed'
          signed?: boolean | null
          signed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          title?: string | null
          content?: string | null
          amount?: number | null
          status?: 'draft' | 'sent' | 'signed'
          signed?: boolean | null
          signed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          number: string | null
          amount: number
          description: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string | null
          paid_at: string | null
          stripe_payment_link: string | null
          subtotal: number | null
          tax_rate: number | null
          tax_amount: number | null
          total: number | null
          notes: string | null
          payment_method: string | null
          paid_amount: number | null
          sent_at: string | null
          last_reminder_at: string | null
          reminder_count: number | null
          is_recurring: boolean | null
          recurring_frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          recurring_end_date: string | null
          parent_recurring_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          number?: string | null
          amount?: number
          description?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          stripe_payment_link?: string | null
          subtotal?: number | null
          tax_rate?: number | null
          tax_amount?: number | null
          total?: number | null
          notes?: string | null
          payment_method?: string | null
          paid_amount?: number | null
          sent_at?: string | null
          last_reminder_at?: string | null
          reminder_count?: number | null
          is_recurring?: boolean | null
          recurring_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          recurring_end_date?: string | null
          parent_recurring_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          number?: string | null
          amount?: number
          description?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          stripe_payment_link?: string | null
          subtotal?: number | null
          tax_rate?: number | null
          tax_amount?: number | null
          total?: number | null
          notes?: string | null
          payment_method?: string | null
          paid_amount?: number | null
          sent_at?: string | null
          last_reminder_at?: string | null
          reminder_count?: number | null
          is_recurring?: boolean | null
          recurring_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          recurring_end_date?: string | null
          parent_recurring_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number | null
          unit_price: number
          tax_rate: number | null
          total: number | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number | null
          unit_price: number
          tax_rate?: number | null
          total?: number | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number | null
          unit_price?: number
          tax_rate?: number | null
          total?: number | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      recurring_invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          next_date: string
          end_date: string | null
          is_active: boolean | null
          last_generated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          next_date: string
          end_date?: string | null
          is_active?: boolean | null
          last_generated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          next_date?: string
          end_date?: string | null
          is_active?: boolean | null
          last_generated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      recurring_invoice_items: {
        Row: {
          id: string
          recurring_id: string
          description: string
          quantity: number | null
          unit_price: number
          tax_rate: number | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          recurring_id: string
          description: string
          quantity?: number | null
          unit_price: number
          tax_rate?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          recurring_id?: string
          description?: string
          quantity?: number | null
          unit_price?: number
          tax_rate?: number | null
          sort_order?: number | null
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          event_type: 'event' | 'appointment' | 'reminder' | 'deadline' | 'call'
          start_time: string
          end_time: string | null
          all_day: boolean | null
          location: string | null
          meeting_link: string | null
          client_id: string | null
          project_id: string | null
          google_event_id: string | null
          status: 'confirmed' | 'tentative' | 'cancelled'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          event_type?: 'event' | 'appointment' | 'reminder' | 'deadline' | 'call'
          start_time: string
          end_time?: string | null
          all_day?: boolean | null
          location?: string | null
          meeting_link?: string | null
          client_id?: string | null
          project_id?: string | null
          google_event_id?: string | null
          status?: 'confirmed' | 'tentative' | 'cancelled'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          event_type?: 'event' | 'appointment' | 'reminder' | 'deadline' | 'call'
          start_time?: string
          end_time?: string | null
          all_day?: boolean | null
          location?: string | null
          meeting_link?: string | null
          client_id?: string | null
          project_id?: string | null
          google_event_id?: string | null
          status?: 'confirmed' | 'tentative' | 'cancelled'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      availability: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          enabled: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          enabled?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          enabled?: boolean | null
        }
      }
      booking_links: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string | null
          description: string | null
          duration: number | null
          buffer_before: number | null
          buffer_after: number | null
          max_per_day: number | null
          advance_notice: number | null
          enabled: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title?: string | null
          description?: string | null
          duration?: number | null
          buffer_before?: number | null
          buffer_after?: number | null
          max_per_day?: number | null
          advance_notice?: number | null
          enabled?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string | null
          description?: string | null
          duration?: number | null
          buffer_before?: number | null
          buffer_after?: number | null
          max_per_day?: number | null
          advance_notice?: number | null
          enabled?: boolean | null
          created_at?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          amount: number
          category: string | null
          description: string | null
          date: string | null
          receipt_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          amount: number
          category?: string | null
          description?: string | null
          date?: string | null
          receipt_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          amount?: number
          category?: string | null
          description?: string | null
          date?: string | null
          receipt_url?: string | null
          created_at?: string | null
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          duration: number
          description: string | null
          date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          duration: number
          description?: string | null
          date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          duration?: number
          description?: string | null
          date?: string | null
          created_at?: string | null
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          client_id: string | null
          name: string
          url: string
          size: number | null
          type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          client_id?: string | null
          name: string
          url: string
          size?: number | null
          type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          client_id?: string | null
          name?: string
          url?: string
          size?: number | null
          type?: string | null
          created_at?: string | null
        }
      }
      affiliate_clicks: {
        Row: {
          id: string
          affiliate_code: string
          ip: string | null
          referrer: string | null
          landing_page: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          affiliate_code: string
          ip?: string | null
          referrer?: string | null
          landing_page?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          affiliate_code?: string
          ip?: string | null
          referrer?: string | null
          landing_page?: string | null
          created_at?: string | null
        }
      }
      affiliate_conversions: {
        Row: {
          id: string
          affiliate_code: string
          referred_user_id: string | null
          commission_amount: number | null
          status: 'pending' | 'paid' | 'cancelled'
          period_start: string | null
          period_end: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          affiliate_code: string
          referred_user_id?: string | null
          commission_amount?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          period_start?: string | null
          period_end?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          affiliate_code?: string
          referred_user_id?: string | null
          commission_amount?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          period_start?: string | null
          period_end?: string | null
          created_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number | null
          current_amount: number | null
          category: string | null
          deadline: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount?: number | null
          current_amount?: number | null
          category?: string | null
          deadline?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number | null
          current_amount?: number | null
          category?: string | null
          deadline?: string | null
          created_at?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          content: string
          rating: number | null
          approved: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          content: string
          rating?: number | null
          approved?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          content?: string
          rating?: number | null
          approved?: boolean | null
          created_at?: string | null
        }
      }
      feedback_requests: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          project_id: string | null
          request_content: string | null
          response_content: string | null
          status: 'pending' | 'completed'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          project_id?: string | null
          request_content?: string | null
          response_content?: string | null
          status?: 'pending' | 'completed'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          project_id?: string | null
          request_content?: string | null
          response_content?: string | null
          status?: 'pending' | 'completed'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      email_campaigns: {
        Row: {
          id: string
          user_id: string
          campaign: 'trial_sequence' | 'upgrade_starter_to_pro' | 'upgrade_pro_to_ai'
          day: number | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          campaign: 'trial_sequence' | 'upgrade_starter_to_pro' | 'upgrade_pro_to_ai'
          day?: number | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          campaign?: 'trial_sequence' | 'upgrade_starter_to_pro' | 'upgrade_pro_to_ai'
          day?: number | null
          sent_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
      update_updated_at: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}
