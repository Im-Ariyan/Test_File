-- Shared campus records: maintenance requests, community reports and security events,
-- visible to everyone using the app (no sign-in yet, so the demo table is public).
CREATE TABLE public.campus_records (
  ref_code text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('maintenance','community','security')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  building text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical','High','Medium','Low')),
  status text NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported','Under Review','Assigned','In Progress','Resolved')),
  team text NOT NULL DEFAULT '',
  photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activity timeline entries for each record.
CREATE TABLE public.campus_record_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_ref text NOT NULL REFERENCES public.campus_records(ref_code) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campus_record_events_record_idx ON public.campus_record_events (record_ref, created_at);

CREATE OR REPLACE FUNCTION public.touch_campus_records_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campus_records_updated
  BEFORE UPDATE ON public.campus_records
  FOR EACH ROW EXECUTE FUNCTION public.touch_campus_records_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_records TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_record_events TO anon, authenticated;
GRANT ALL ON public.campus_records TO service_role;
GRANT ALL ON public.campus_record_events TO service_role;

ALTER TABLE public.campus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_record_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared campus records are readable"
  ON public.campus_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Campus records can be submitted"
  ON public.campus_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Campus records can be updated"
  ON public.campus_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Campus records can be cleared for the demo"
  ON public.campus_records FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Shared timelines are readable"
  ON public.campus_record_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Timeline notes can be added"
  ON public.campus_record_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Timeline notes can be cleared for the demo"
  ON public.campus_record_events FOR DELETE TO anon, authenticated USING (true);